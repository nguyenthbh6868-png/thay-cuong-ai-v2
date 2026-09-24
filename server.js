import express from 'express';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

const SYSTEM = `Bạn là Thầy Cường AI, trợ lý giáo dục đa năng, thân thiện, chính xác và phù hợp học sinh. Trả lời câu hỏi hợp lệ trong khả năng của mô hình. Khi không chắc chắn, nói rõ giới hạn thay vì bịa. Nếu người dùng gửi ảnh, quan sát ảnh và trả lời dựa trên nội dung nhìn thấy. Nếu người dùng yêu cầu sáng tác bài hát, có thể viết lời bài hát hoàn chỉnh, cấu trúc, phong cách, nhịp độ và prompt sản xuất âm nhạc; không tuyên bố đã tạo file âm thanh nếu hệ thống chưa có công cụ tạo nhạc. Nếu yêu cầu tạo hình ảnh, tạo prompt hình ảnh rõ ràng, giữ chính xác chữ tiếng Việt nếu người dùng yêu cầu chữ trong ảnh.`;

app.get('/api/health', (req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(process.env.OPENAI_API_KEY), service: 'Thầy Cường AI V2' });
});

app.post('/api/assistant', async (req, res) => {
  const client = getClient();
  if (!client) return res.status(503).json({ error: 'OPENAI_API_KEY chưa được cấu hình trên server.' });
  try {
    const { message = '', image = null } = req.body || {};
    if (!message && !image) return res.status(400).json({ error: 'Vui lòng nhập câu hỏi hoặc gửi ảnh.' });

    const route = await client.responses.create({
      model: process.env.OPENAI_TEXT_MODEL || 'gpt-5.6-luna',
      instructions: 'Phân loại yêu cầu của người dùng. Chỉ trả JSON hợp lệ theo schema đã yêu cầu.',
      input: `Nếu yêu cầu chính là TẠO hoặc CHỈNH SỬA HÌNH ẢNH, trả {"intent":"IMAGE","prompt":"prompt tạo ảnh tối ưu","reply":"câu thông báo ngắn bằng tiếng Việt"}. Mọi trường hợp khác trả {"intent":"TEXT","prompt":"","reply":""}. Yêu cầu người dùng: ${message}`,
      text: { format: { type: 'json_schema', name: 'route', strict: true, schema: { type: 'object', properties: { intent: { type: 'string', enum: ['TEXT','IMAGE'] }, prompt: { type: 'string' }, reply: { type: 'string' } }, required: ['intent','prompt','reply'], additionalProperties: false } } }
    });
    const r = JSON.parse(route.output_text);

    if (r.intent === 'IMAGE') {
      const prompt = image ? `${r.prompt}\nCó ảnh tham chiếu được người dùng gửi trong hội thoại; nếu cần chỉnh ảnh cụ thể, hãy giải thích rằng bản web hiện tại hỗ trợ tạo ảnh mới từ mô tả, còn chỉnh ảnh tham chiếu cần bổ sung endpoint image edit.` : r.prompt;
      const im = await client.images.generate({
        model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2',
        prompt,
        size: '1536x1024'
      });
      const item = im.data?.[0];
      if (!item?.b64_json) throw new Error('API tạo ảnh không trả về dữ liệu ảnh.');
      return res.json({ type: 'image', text: r.reply || 'Mình đã tạo hình ảnh theo yêu cầu.', image: `data:image/png;base64,${item.b64_json}` });
    }

    const content = [];
    if (message) content.push({ type: 'input_text', text: message });
    if (image) content.push({ type: 'input_image', image_url: image });
    const out = await client.responses.create({
      model: process.env.OPENAI_TEXT_MODEL || 'gpt-5.6-luna',
      instructions: SYSTEM,
      input: [{ role: 'user', content }]
    });
    return res.json({ type: 'text', text: out.output_text || 'Mình chưa tạo được câu trả lời.' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e?.message || 'AI error' });
  }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, '0.0.0.0', () => console.log(`Thầy Cường AI V2 running on port ${PORT}`));
