THẦY CƯỜNG AI V2 — BẢN RENDER-READY

CÁCH CHẠY LOCAL
1) Cài Node.js 20+.
2) Mở Terminal tại thư mục này.
3) Chạy: npm install
4) Tạo biến môi trường OPENAI_API_KEY (không ghi khóa vào public/index.html).
5) Chạy: npm start
6) Mở: http://localhost:3000
7) Kiểm tra backend: http://localhost:3000/api/health

CÁCH DEPLOY RENDER
1) Đưa toàn bộ thư mục này lên một GitHub repository riêng tư hoặc công khai.
2) Trên Render: New > Blueprint và chọn repository (render.yaml đã có sẵn), hoặc New > Web Service.
3) Nếu tạo Web Service thủ công:
   Build Command: npm install
   Start Command: npm start
   Health Check Path: /api/health
4) Trong Environment, thêm OPENAI_API_KEY = API key của bạn.
5) Deploy. Sau khi deploy, mở URL Render cấp.
6) Mở /api/health. Kết quả phải có: "ok":true và "aiConfigured":true.

BẢO MẬT
- Không gửi API key cho người khác.
- Không đặt API key trong HTML/JS phía trình duyệt.
- ChatGPT Plus và OpenAI API là hai dịch vụ thanh toán riêng.

CHỨC NĂNG
- Hỏi đáp mở: GPT-5.6 Luna (có thể đổi bằng OPENAI_TEXT_MODEL).
- Hiểu ảnh gửi lên: model đa phương thức.
- Tạo ảnh: GPT-Image-2.
- Sáng tác lời bài hát/ý tưởng/prompt âm nhạc: model văn bản.
- Micro + đọc tiếng Việt: Web Speech API trên trình duyệt.
- Chưa xuất file nhạc có giọng hát; muốn có tính năng này cần tích hợp một API tạo nhạc riêng.
