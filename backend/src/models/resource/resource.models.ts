import mongoose, { Document, Schema } from 'mongoose';

export enum FileCategory {
  DESIGN = 'design',        // Thiết kế (AI, PS, Sketch, Figma, XD)
  DOCUMENT = 'document',    // Tài liệu (PDF, DOC, PPT, XLS)
  MODEL_3D = '3d_model',    // Mô hình 3D (SKP, MAX, FBX, BLEND)
  CAD = 'cad',              // Bản vẽ kỹ thuật (DWG, DXF, RVT)
  IMAGE = 'image',          // Hình ảnh (JPG, PNG, SVG, GIF)
  VIDEO = 'video',          // Video (MP4, MOV, AVI)
  ARCHIVE = 'archive'       // File nén (ZIP, RAR, 7Z)
}

export interface IResource extends Document {
  name: string;
  description: string;
  category: FileCategory;
  fileExtensions: string[];
  software: Array<{
    name: string;
    description: string;
    downloadUrl: string;
    isFree: boolean;
    os: string[];           // ['windows', 'mac', 'linux', 'web']
    imageUrl?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(FileCategory),
      required: true,
    },
    fileExtensions: [{
      type: String,
      required: true,
      lowercase: true,
    }],
    software: [{
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      downloadUrl: {
        type: String,
        required: true,
      },
      isFree: {
        type: Boolean,
        default: false,
      },
      os: [{
        type: String,
        enum: ['windows', 'mac', 'linux', 'web'],
        required: true,
      }],
      imageUrl: String,
    }],
  },
  { timestamps: true }
);

// Tạo index để tìm kiếm nhanh theo phần mở rộng file
ResourceSchema.index({ fileExtensions: 1 });
ResourceSchema.index({ category: 1 });

export default mongoose.model<IResource>('Resource', ResourceSchema);
