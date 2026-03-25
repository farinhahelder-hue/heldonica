import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      enum: ['Travel', 'Culture', 'Destination', 'Tips', 'News'],
      default: 'Travel',
    },
    author: {
      type: String,
      default: 'Heldonica',
    },
    published: {
      type: Boolean,
      default: false,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Article || mongoose.model('Article', ArticleSchema);
