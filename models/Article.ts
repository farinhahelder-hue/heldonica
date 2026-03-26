import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: String,
    category: {
      type: String,
      enum: ['Travel', 'Culture', 'Destination', 'Tips', 'News'],
      default: 'Travel',
    },
    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Draft',
    },
    image: String,
    seoTitle: String,
    seoDescription: String,
    seoKeywords: String,
    author: String,
    publishedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Article || mongoose.model('Article', ArticleSchema);
