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
                url: "http://localhost:3000",
                description: "Local server",
            },
            {
                url: "https://architectural-bluepr-backend.onrender.com",
                description: "Production server",
            },
        ],
        tags: [
            {
                name: 'Files',
                description: 'API quản lý file'
            },
            // Các tags khác...
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
                Category: {
                    type: 'object',
                    description: 'Danh mục bản vẽ',
                    required: ['name', 'slug'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'ID của danh mục'
                        },
                        name: {
                            type: 'string',
                            description: 'Tên danh mục (phải là duy nhất)',
                            maxLength: 100
                        },
                        slug: {
                            type: 'string',
                            description: 'URL-friendly name của danh mục (tự động tạo từ name)'
                        },
                        description: {
                            type: 'string',
                            description: 'Mô tả chi tiết về danh mục',
                            maxLength: 500
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Thời gian tạo danh mục'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Thời gian cập nhật danh mục'
                        }
                    }
                },
                File: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'ID của file'
                        },
                        name: {
                            type: 'string',
                            description: 'Tên file'
                        },
                        url: {
                            type: 'string',
                            description: 'Đường dẫn đến file'
                        },
                        type: {
                            type: 'string',
                            enum: ['3D', 'PDF', 'PNG', 'JPG', 'JPEG', 'DWG', 'SKP', 'RVT', 'IFC', 'OTHER'],
                            description: 'Loại file'
                        },
                        size: {
                            type: 'number',
                            description: 'Kích thước file (bytes)'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Thời gian tạo'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Thời gian cập nhật'
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
    apis: process.env.NODE_ENV === "production"
        ? ["dist/models/**/*.js"] // Tìm tất cả file .js trong thư mục models
        : ["./src/models/**/*.ts"], // Tìm tất cả file .ts trong thư mục models
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app: Express) {
    try {
        console.log('🔄 Setting up Swagger...');
        
        // Route cho file JSON
        app.get('/api-docs.json', (req, res) => {
            console.log('📄 Sending Swagger JSON spec');
            res.setHeader('Content-Type', 'application/json');
            res.send(swaggerSpec);
        });

        // Cấu hình Swagger UI
        const swaggerUiOptions = {
            explorer: true,
            swaggerOptions: {
                url: '/api-docs.json',
                docExpansion: 'list',
                filter: true,
                showRequestDuration: true,
                persistAuthorization: true,
                layout: 'StandaloneLayout',
                // Sử dụng các file từ CDN thay vì từ node_modules
                customJs: [
                    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
                    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js'
                ],
                customCssUrl: [
                    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
                    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css',
                    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css'
                ]
            },
            customCss: `
                .swagger-ui .topbar { display: none }
                .swagger-ui .info { margin: 20px 0; }
                .swagger-ui .scheme-container { margin: 0; padding: 10px 0; }
                .swagger-ui .info .title { color: #3b4151; }
            `,
            customSiteTitle: 'API Documentation',
            customfavIcon: '/favicon.ico'
        };

        // Sử dụng swagger-ui-express với cấu hình tối ưu
        app.use(
            '/api-docs',
            swaggerUi.serveFiles(swaggerSpec, swaggerUiOptions),
            swaggerUi.setup(swaggerSpec, swaggerUiOptions)
        );

        console.log('✅ Swagger UI available at /api-docs');
        console.log('📄 Swagger JSON available at /api-docs.json');
    } catch (error) {
        console.error('❌ Error setting up Swagger:', error);
    }
}

export { setupSwagger };