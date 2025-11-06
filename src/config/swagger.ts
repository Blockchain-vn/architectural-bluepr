import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import path from "path";
import fs from "fs";

// Cấu hình Swagger
const options: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Architectural Blueprint API",
            version: "1.0.0",
            description: "Hệ thống quản lý và chia sẻ bản vẽ kiến trúc",
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
    apis: [
        // Tìm trong tất cả các thư mục có thể chứa routes
        "./src/**/*.ts",
        "./src/**/*.js",
        "./dist/**/*.js"
    ],
};

// Định nghĩa interface cho swaggerSpec
interface SwaggerSpec {
    paths: Record<string, unknown>;
    [key: string]: unknown;
}

const swaggerSpec = swaggerJSDoc(options) as SwaggerSpec;

function setupSwagger(app: Express) {
    // Log thông tin debug
    console.log('🔍 Current working directory:', process.cwd());
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
    
    // Log all files that will be scanned for API docs
    const scanDirs = [
        path.join(process.cwd(), 'src'),
        path.join(process.cwd(), 'dist')
    ];

    console.log('🔍 Scanning directories for API docs:');
    scanDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            console.log(`   - ${dir}`);
        } else {
            console.warn(`   ⚠️ Directory not found: ${dir}`);
        }
    });
    
    // Log swagger spec info
    console.log('🔍 API Paths found:', Object.keys(swaggerSpec.paths || {}).length);
    if (Object.keys(swaggerSpec.paths || {}).length === 0) {
        console.warn('⚠️  No API paths found in swaggerSpec!');
        console.log('🔍 Swagger options:', JSON.stringify(options, null, 2));
    }
    try {
        console.log('🔄 [1/3] Starting Swagger setup...');
        
        // Log all found paths for debugging
        if (Object.keys(swaggerSpec.paths || {}).length > 0) {
            console.log('✅ Found API paths:');
            Object.keys(swaggerSpec.paths).forEach(path => {
                console.log(`   - ${path}`);
            });
        }
        
        // Route cho file JSON
        app.get('/api-docs.json', (req, res) => {
            console.log('📄 [2/3] Sending Swagger JSON spec');
            console.log('🔍 Total paths in spec:', Object.keys(swaggerSpec.paths || {}).length);
            res.setHeader('Content-Type', 'application/json');
            res.send(swaggerSpec);
        });

        console.log('🛠️ [3/3] Preparing Swagger UI HTML');
        
        // HTML template sử dụng CDN
        const swaggerHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Architectural Blueprint API</title>
            <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
            <meta http-equiv="Pragma" content="no-cache" />
            <meta http-equiv="Expires" content="0" />
            <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css?v=" + new Date().getTime() />
            <style>
                /* Hide elements */
                .swagger-ui .topbar,
                .swagger-ui .filter-container,
                .swagger-ui .opblock-tag,
                .swagger-ui .download-url-wrapper,
                .swagger-ui .information-container.wrapper,
                .swagger-ui .scheme-container {
                    display: none !important;
                }
                
                /* Improve layout */
                .swagger-ui .info { 
                    margin: 20px 0;
                    padding: 20px;
                    border: 1px solid #e0e0e0;
                    border-radius: 4px;
                    background: #f7f7f7;
                }
                
                .swagger-ui .info .title {
                    color: #3b4151;
                    font-size: 24px;
                    margin-bottom: 10px;
                }
                
                .swagger-ui .opblock {
                    margin: 15px 0;
                    border: 1px solid #e0e0e0;
                    border-radius: 4px;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                }
                
                .swagger-ui .opblock .opblock-summary {
                    padding: 8px 20px;
                }
                
                .swagger-ui .opblock .opblock-summary-method {
                    min-width: 80px;
                    text-align: center;
                }
                
                .swagger-ui .opblock .opblock-summary-path {
                    font-size: 16px;
                }
            </style>
        </head>
        <body>
            <div id="swagger-ui"></div>
            <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js?v=" + new Date().getTime()></script>
            <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-standalone-preset.js?v=" + new Date().getTime()></script>
            <script>
                window.onload = function() {
                    console.log('🚀 Swagger UI is loading...');
                    
                    try {
                        // Set the document title immediately
                        document.title = 'Architectural Blueprint API';
                        
                        window.ui = SwaggerUIBundle({
                            url: '/api-docs.json',
                            dom_id: '#swagger-ui',
                            deepLinking: true,
                            docExpansion: 'list',
                            filter: false,
                            displayRequestDuration: true,
                            showExtensions: true,
                            showCommonExtensions: true,
                            defaultModelsExpandDepth: 1,
                            defaultModelExpandDepth: 1,
                            defaultModelRendering: 'model',
                            displayOperationId: false,
                            presets: [
                                SwaggerUIBundle.presets.apis,
                                SwaggerUIStandalonePreset
                            ],
                            layout: "StandaloneLayout",
                        // Debug options
                        onComplete: function() {
                            console.log('✅ Swagger UI rendered successfully');
                            console.log('📊 Total operations loaded:', 
                                document.querySelectorAll('.opblock').length);
                                
                            // Update the title in the UI
                            const titleEl = document.querySelector('.info .title');
                            if (titleEl) {
                                titleEl.textContent = 'Architectural Blueprint API';
                                titleEl.style.color = '#3b4151';
                                titleEl.style.fontSize = '36px';
                                titleEl.style.marginBottom = '20px';
                            }
                            
                            // Update the description
                            const descEl = document.querySelector('.info .description');
                            if (descEl) {
                                descEl.textContent = 'Hệ thống quản lý và chia sẻ bản vẽ kiến trúc';
                            }
                        },
                        onFailure: function(error) {
                            console.error('❌ Swagger UI failed to load:', error);
                        }
                    });
                    } catch (error) {
                        console.error('❌ Error initializing Swagger UI:', error);
                        document.getElementById('swagger-ui').innerHTML = 
                            '<div style="color: red; padding: 20px;">' +
                            '<h3>Error loading Swagger UI</h3>' +
                            '<pre>' + JSON.stringify(error, null, 2) + '</pre>' +
                            '</div>';
                    }
                };
            </script>
        </body>
        </html>`;

        // Route cho Swagger UI
        app.get('/api-docs', (req, res) => {
            console.log('🌐 Serving Swagger UI');
            console.log('🔍 Total API paths:', Object.keys(swaggerSpec.paths || {}).length);
            res.send(swaggerHtml);
        });

        console.log('✅ [SUCCESS] Swagger setup completed');
        console.log('🔗 Swagger UI: /api-docs');
        console.log('📄 API Spec: /api-docs.json');
        console.log('🔄 Total paths defined:', Object.keys(swaggerSpec.paths || {}).length);
    } catch (error) {
        console.error('❌ [ERROR] Failed to setup Swagger');
        
        // Xử lý error một cách an toàn
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        
        console.error('Error details:', errorMessage);
        if (errorStack) {
            console.error('Error stack:', errorStack);
        }
        
        // Thêm route lỗi để debug
        app.get('/api-docs/error', (req, res) => {
            res.json({
                error: 'Swagger setup failed',
                message: errorMessage,
                ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
            });
        });
    }
}

export { setupSwagger };