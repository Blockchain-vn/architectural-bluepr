import connectDB from '../config/db';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Category, { ICategory } from '../models/category/category.model';
import File, { IFile } from '../models/file/file.model';
import Content, { IContent } from '../models/content/content.models';
import User, { IUser } from '../models/user/user.model';

// Load environment variables
dotenv.config();

// Sample data - Lưu ý: Mật khẩu sẽ được hash trước khi lưu vào database
const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123', // Mật khẩu sẽ được hash trước khi lưu
    role: 'admin' as const,
  },
  {
    username: 'user1',
    email: 'user1@example.com',
    password: 'user123', // Mật khẩu sẽ được hash trước khi lưu
    role: 'user' as const,
  },
];

const sampleCategories: Partial<ICategory>[] = [
  {
    name: 'Tất cả bản vẽ',
    description: 'Tất cả các bản vẽ thiết kế',
  },
  {
    name: 'Cơ khí',
    description: 'Bản vẽ cơ khí và thiết kế máy móc',
  },
  {
    name: 'Điện',
    description: 'Bản vẽ điện và hệ thống điện',
  },
  {
    name: 'Xây dựng',
    description: 'Bản vẽ xây dựng và kết cấu công trình',
  },
  {
    name: 'Điều hòa',
    description: 'Bản vẽ hệ thống điều hòa không khí',
  },
  {
    name: 'Cấp thoát nước',
    description: 'Bản vẽ hệ thống cấp thoát nước',
  },
  {
    name: 'Điện tử',
    description: 'Bản vẽ mạch điện tử và linh kiện',
  },
  {
    name: 'Người máy',
    description: 'Bản vẽ robot và hệ thống tự động hóa',
  },
  {
    name: 'Nội thất',
    description: 'Bản vẽ thiết kế nội thất và trang trí',
  },
];

const sampleFiles = [
  {
    name: 'thiet-ke-co-khi.dwg',
    url: '/uploads/thiet-ke-co-khi.dwg',
    type: 'DWG' as const,
    size: 5120 * 1024, // 5MB
  },
  {
    name: 'so-do-mach-dien.pdf',
    url: '/uploads/so-do-mach-dien.pdf',
    type: 'PDF' as const,
    size: 2048 * 1024, // 2MB
  },
  {
    name: 'ket-cau-nha-cao-tang.rvt',
    url: '/uploads/ket-cau-nha-cao-tang.rvt',
    type: 'RVT' as const,
    size: 10240 * 1024, // 10MB
  },
  {
    name: 'he-thong-dieu-hoa.skp',
    url: '/uploads/he-thong-dieu-hoa.skp',
    type: 'SKP' as const,
    size: 7168 * 1024, // 7MB
  },
  {
    name: 'thiet-ke-noi-that.3ds',
    url: '/uploads/thiet-ke-noi-that.3ds',
    type: '3D' as const,
    size: 15360 * 1024, // 15MB
  },
];

// Define a simplified content interface for seed data
interface ISampleContent {
  title: string;
  description: string;
  price?: number;
  details: {
    dimensions?: string;
    bedrooms?: number;
    bathrooms?: number;
    floors?: number;
    style?: string;
    area?: number;
    [key: string]: any;
  };
  status: 'pending' | 'approved';
  categoryName: string;
  fileName: string;
}

const sampleContents: ISampleContent[] = [
  {
    title: 'Bản vẽ chi tiết bộ truyền động cơ khí',
    description: 'Bản vẽ kỹ thuật 3D đầy đủ chi tiết bộ truyền động cơ khí, phù hợp cho sản xuất và lắp ráp',
    price: 1500000,
    details: {
      kichThuoc: 'A1',
      tyLe: '1:5',
      soLuongChiTiet: 12,
      phanMem: 'AutoCAD 2023',
      dungLuong: '5MB',
      nguonGoc: 'Thiết kế mới',
    },
    status: 'approved',
    categoryName: 'Cơ khí',
    fileName: 'thiet-ke-co-khi.dwg',
  },
  {
    title: 'Sơ đồ mạch điện điều khiển công nghiệp',
    description: 'Bản vẽ mạch điện điều khiển tự động hóa công nghiệp, đầy đủ thông số kỹ thuật',
    price: 1200000,
    details: {
      kichThuoc: 'A2',
      tyLe: '1:10',
      soLuongLinhKien: 45,
      phanMem: 'EPLAN',
      dungLuong: '2MB',
      nguonGoc: 'Tài liệu đào tạo',
    },
    status: 'approved',
    categoryName: 'Điện',
    fileName: 'so-do-mach-dien.pdf',
  },
  {
    title: 'Kết cấu nhà cao tầng - Tầng điển hình',
    description: 'Bản vẽ kết cấu bê tông cốt thép nhà cao tầng, đầy đủ các mặt bằng, mặt cắt và chi tiết',
    price: 2500000,
    details: {
      kichThuoc: 'A0',
      tyLe: '1:50',
      soTang: 25,
      phanMem: 'Revit 2023',
      dungLuong: '10MB',
      nguonGoc: 'Dự án thực tế',
    },
    status: 'approved',
    categoryName: 'Xây dựng',
    fileName: 'ket-cau-nha-cao-tang.rvt',
  },
  {
    title: 'Thiết kế hệ thống điều hòa trung tâm',
    description: 'Bản vẽ thiết kế hệ thống điều hòa không khí trung tâm cho tòa nhà văn phòng',
    price: 1800000,
    details: {
      kichThuoc: 'A1',
      tyLe: '1:100',
      dienTichPhucVu: '2000m2',
      phanMem: 'SketchUp Pro',
      dungLuong: '7MB',
      nguonGoc: 'Dự án thực tế',
    },
    status: 'approved',
    categoryName: 'Điều hòa',
    fileName: 'he-thong-dieu-hoa.skp',
  },
  {
    title: 'Thiết kế nội thất phòng khách hiện đại',
    description: 'Bản vẽ 3D nội thất phòng khách phong cách hiện đại, đầy đủ bố cục và vật liệu',
    price: 1200000,
    details: {
      kichThuoc: 'A2',
      tyLe: '1:25',
      phongCach: 'Hiện đại',
      phanMem: '3ds Max + V-Ray',
      dungLuong: '15MB',
      nguonGoc: 'Mẫu thiết kế',
    },
    status: 'approved',
    categoryName: 'Nội thất',
    fileName: 'thiet-ke-noi-that.3ds',
  },
];

// Hash password helper
const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Main seed function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('🔌 Đã kết nối tới MongoDB');

    // Clear existing data
    console.log('🧹 Đang xóa dữ liệu cũ...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      File.deleteMany({}),
      Content.deleteMany({}),
    ]);
    console.log('✅ Đã xóa dữ liệu cũ');

    // Create users with hashed passwords
    console.log('👥 Đang tạo người dùng...');
    
    // Hash passwords before creating users
    const hashedUsers = await Promise.all(sampleUsers.map(async (user) => {
      const hashedPassword = await hashPassword(user.password);
      return {
        ...user,
        password: hashedPassword
      };
    }));
    
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`✅ Đã tạo ${createdUsers.length} người dùng`);

    // Create categories
    console.log('🏷️ Đang tạo danh mục...');
    // Tạo slug thủ công cho từng danh mục
    const categoriesWithSlug = sampleCategories.map(category => ({
      ...category,
      slug: category.name ? category.name.toLowerCase()
        .replace(/[^\w\u00C0-\u1EF9]+/g, '-')
        .replace(/^-+|-+$/g, '') : ''
    }));
    
    const createdCategories: ICategory[] = [];
    for (const category of categoriesWithSlug) {
      try {
        const newCategory = await Category.create(category);
        createdCategories.push(newCategory);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Lỗi khi tạo danh mục ${category.name}:`, errorMessage);
      }
    }
    console.log(`✅ Đã tạo ${createdCategories.length} danh mục`);

    // Create files
    console.log('📁 Đang tạo file...');
    const createdFiles = await File.insertMany(sampleFiles);
    console.log(`✅ Đã tạo ${createdFiles.length} file`);

    // Create contents with relationships
    console.log('🏠 Đang tạo nội dung...');
    const adminUser = createdUsers.find((u: { role: string }) => u.role === 'admin');
    // Tạo nội dung
    const createdContents = await Promise.all(
      sampleContents.map(async (content) => {
        const category = createdCategories.find((c) => c.name === content.categoryName);
        const file = createdFiles.find((f) => f.name === content.fileName);
        
        if (!category || !file) {
          throw new Error(`Không tìm thấy category hoặc file cho nội dung: ${content.title}`);
        }

        const { categoryName, fileName, ...contentData } = content;
        
        const newContent = new Content({
          ...contentData,
          category_id: category._id,
          file_id: file._id,
          createdBy: adminUser?._id,
          approvedBy: adminUser?._id, // Thêm người phê duyệt
          approvedAt: new Date(), // Thêm thời gian phê duyệt
          status: 'approved' as const, // Đảm bảo trạng thái là đã duyệt
        });

        return newContent.save();
      })
    );
    console.log(`✅ Đã tạo ${createdContents.length} nội dung`);

    console.log('🎉 Đã thêm dữ liệu mẫu thành công!');
    console.log('\n🔑 Thông tin đăng nhập:');
    console.log('👤 Admin:');
    console.log(`   Email: admin@example.com`);
    console.log(`   Mật khẩu: admin123`);
    console.log('\n👤 Người dùng:');
    console.log(`   Email: user1@example.com`);
    console.log(`   Mật khẩu: user123`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi thêm dữ liệu mẫu:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
