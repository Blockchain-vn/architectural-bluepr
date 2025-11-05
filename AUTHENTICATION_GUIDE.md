# Hướng dẫn Xác thực và Phân quyền

Tài liệu này mô tả cách triển khai hệ thống xác thực với OTP qua email và cơ chế refresh token.

## Các tính năng chính

1. Đăng ký tài khoản với xác thực OTP qua email
2. Đăng nhập và nhận access token & refresh token
3. Làm mới access token bằng refresh token
4. Xác thực người dùng qua JWT

## Cấu hình môi trường

1. Sao chép file `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```

2. Cập nhật các biến môi trường trong file `.env`:
   - `MONGODB_URI`: Đường dẫn kết nối MongoDB
   - `JWT_SECRET`: Chuỗi bí mật để ký JWT
   - `JWT_REFRESH_SECRET`: Chuỗi bí mật để ký refresh token
   - `EMAIL_USER`: Địa chỉ email dùng để gửi OTP
   - `EMAIL_PASSWORD`: Mật khẩu ứng dụng (hoặc mật khẩu email)
   - `APP_URL`: URL gốc của ứng dụng

## Cài đặt phụ thuộc

```bash
npm install
```

## Chạy ứng dụng

```bash
# Chế độ phát triển
npm run dev

# Chế độ sản xuất
npm start
```

## API Endpoints

### 1. Đăng ký tài khoản (Gửi OTP)

**POST** `/api/auth/register`

Request body:
```json
{
  "username": "example_user",
  "email": "user@example.com",
  "password": "securePassword123!"
}
```

### 2. Xác thực OTP và hoàn tất đăng ký

**POST** `/api/auth/verify-registration`

Request body:
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "username": "example_user",
  "password": "securePassword123!"
}
```

### 3. Gửi lại mã OTP

**POST** `/api/auth/resend-otp`

Request body:
```json
{
  "email": "user@example.com"
}
```

### 4. Đăng nhập

**POST** `/api/auth/login`

Request body:
```json
{
  "email": "user@example.com",
  "password": "securePassword123!"
}
```

### 5. Làm mới Access Token

**POST** `/api/auth/refresh-token`

Request body:
```json
{
  "refreshToken": "your_refresh_token_here"
}
```

### 6. Lấy thông tin người dùng hiện tại

**GET** `/api/auth/me`

Headers:
```
Authorization: Bearer your_access_token_here
```

## Xử lý lỗi

Tất cả các API đều trả về response theo định dạng:

```typescript
{
  "success": boolean,
  "message": string,
  "data?": any,
  "error?": string
}
```

## Bảo mật

1. **Mật khẩu**: Được mã hóa bằng bcrypt trước khi lưu vào database
2. **JWT**: Sử dụng thuật toán HS256 để ký token
3. **Refresh Token**: Được lưu trữ an toàn trong database và chỉ sử dụng một lần
4. **OTP**: Có thời hạn và chỉ sử dụng một lần

## Ghi chú

- Access token hết hạn sau 15 phút
- Refresh token hết hạn sau 7 ngày
- Mã OTP có hiệu lực trong 10 phút
