import { Document, model, Schema } from 'mongoose';
const slugify = require('slugify');

// Interface cho Category
export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema cho Category
const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Tên danh mục là bắt buộc'],
      unique: true,
      trim: true,
      maxlength: [100, 'Tên danh mục không được vượt quá 100 ký tự'],
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Mô tả không được vượt quá 500 ký tự'],
    },
  },
  {
    timestamps: true,
    collection: 'categories',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Tạo slug từ name trước khi lưu
categorySchema.pre<ICategory>('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, locale: 'vi' });
  }
  next();
});

// Tạo text index cho trường name để tìm kiếm full-text
categorySchema.index({ name: 'text' });

const Category = model<ICategory>('Category', categorySchema);

export default Category;
