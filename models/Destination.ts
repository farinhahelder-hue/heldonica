import mongoose from 'mongoose';

const DestinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Moderate', 'Challenging'],
      default: 'Moderate',
    },
    bestSeason: String,
    duration: String,
    highlights: [String],
    image: String,
    seoTitle: String,
    seoDescription: String,
    seoKeywords: String,
    published: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Destination || mongoose.model('Destination', DestinationSchema);
