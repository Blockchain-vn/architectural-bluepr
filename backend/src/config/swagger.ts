import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Multi Content API",
            version: "1.0.0",
            description: "API tài liệu cho hệ thống chia sẻ đa nội dung",
        },
        servers: [
            {
                url: "http://localhost:5000",
                description: "Local server",
            },
            {
                url: "https://architectural-bluepr-4.onrender.com",
                description: "Staging server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'ID của người dùng'
                        },
                        username: {
                            type: 'string',
                            description: 'Tên đăng nhập'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email người dùng'
                        },
                        role: {
                            type: 'string',
                            enum: ['user', 'admin'],
                            description: 'Vai trò người dùng',
                            default: 'user'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Thời gian tạo tài khoản'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Thời gian cập nhật cuối cùng'
                        }
                    }
                },
                LoginInput: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'user@example.com'
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            example: 'yourpassword123'
                        }
                    }
                },
                RegisterInput: {
                    type: 'object',
                    required: ['username', 'email', 'password'],
                    properties: {
                        username: {
                            type: 'string',
                            example: 'johndoe',
                            minLength: 3
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'user@example.com'
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            minLength: 6,
                            example: 'yourpassword123'
                        }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        user: {
                            $ref: '#/components/schemas/User'
                        },
                        token: {
                            type: 'string',
                            description: 'JWT token for authentication'
                        }
                    }
                },
                Stats: {
                    type: "object",
                    description: "Thống kê tổng quan hệ thống",
                    properties: {
                        _id: {
                            type: "string",
                            description: "ID của bản ghi thống kê"
                        },
                        totalContents: {
                            type: "integer",
                            description: "Tổng số nội dung"
                        },
                        totalUsers: {
                            type: "integer",
                            description: "Tổng số người dùng"
                        },
                        totalTransactions: {
                            type: "integer",
                            description: "Tổng số giao dịch"
                        },
                        totalReports: {
                            type: "integer",
                            description: "Tổng số báo cáo"
                        },
                        pendingContents: {
                            type: "integer",
                            description: "Số nội dung chờ duyệt"
                        },
                        approvedContents: {
                            type: "integer",
                            description: "Số nội dung đã duyệt"
                        },
                        rejectedContents: {
                            type: "integer",
                            description: "Số nội dung bị từ chối"
                        },
                        lastUpdated: {
                            type: "string",
                            format: "date-time",
                            description: "Thời gian cập nhật cuối cùng"
                        }
                    }
                },
                Content: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            description: "ID của nội dung"
                        },
                        title: {
                            type: "string",
                            description: "Tiêu đề nội dung"
                        },
                        description: {
                            type: "string",
                            description: "Mô tả chi tiết"
                        },
                        field: {
                            type: "string",
                            description: "Lĩnh vực của nội dung"
                        },
                        file_type: {
                            type: "string",
                            description: "Loại file (image, video, document, ...)"
                        },
                        file_url: {
                            type: "string",
                            description: "Đường dẫn đến file"
                        },
                        status: {
                            type: "string",
                            enum: ["pending", "approved", "rejected"],
                            description: "Trạng thái phê duyệt"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Thời gian tạo"
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            description: "Thời gian cập nhật"
                        }
                    }
                },
                ContentInput: {
                    type: "object",
                    required: ["title", "field", "file_type", "file_url"],
                    properties: {
                        title: {
                            type: "string",
                            description: "Tiêu đề bắt buộc"
                        },
                        description: {
                            type: "string",
                            description: "Mô tả (không bắt buộc)"
                        },
                        field: {
                            type: "string",
                            description: "Lĩnh vực của nội dung"
                        },
                        file_type: {
                            type: "string",
                            description: "Loại file (image, video, document, ...)"
                        },
                        file_url: {
                            type: "string",
                            description: "Đường dẫn đến file"
                        }
                    }
                }
            }
        }
    },
    apis: ["./src/models/**/*.routes.ts"], // Đảm bảo đường dẫn này đúng với cấu trúc thư mục của bạn
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log("📚 Swagger documentation available at /api-docs");
};