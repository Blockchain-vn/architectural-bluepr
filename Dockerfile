# Giai đoạn build
FROM node:18-alpine AS builder

# Tạo thư mục làm việc
WORKDIR /usr/src/app

# Sao chép file cấu hình
COPY package*.json ./
COPY tsconfig*.json ./

# Cài đặt dependencies
RUN npm ci

# Sao chép toàn bộ mã nguồn
COPY . .

# Build ứng dụng
RUN npm run build

# Giai đoạn chạy
FROM node:18-alpine

# Tạo thư mục làm việc
WORKDIR /usr/src/app

# Sao chép file package
COPY package*.json ./

# Cài đặt cả dependencies và devDependencies
RUN npm ci --only=production

# Sao chép file đã build từ giai đoạn builder
COPY --from=builder /usr/src/app/dist ./dist

# Sao chép file môi trường
COPY .env* ./

# Mở cổng
EXPOSE 3000

# Lệnh khởi động
CMD ["node", "dist/server.js"]