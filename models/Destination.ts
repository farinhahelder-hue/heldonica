import mongoose from 'mongoose';

const DestinationSchema = new mongoose.Schema(
  {
    name: {
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
    description: {
      type: String,
      required: true,
    },
    longDescription: {
      type: String,
    },
    image: {
      type: String,
      default: null,
    },
    gallery: [String],
    highlights: [String],
    bestTimeToVisit: String,
    duration: String,
    difficulty: {
      type: String,
      enum: ['Easy', 'Moderate', 'Challenging'],
      default: 'Moderate',
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

export default mongoose.models.Destination || mongoose.model('Destination', DestinationSchema);
