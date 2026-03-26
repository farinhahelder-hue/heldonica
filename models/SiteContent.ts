import mongoose from 'mongoose';

const SiteContentSchema = new mongoose.Schema({
  // Site Settings
  site: {
    logo: String,
    title: { type: String, default: 'Heldonica' },
    tagline: String,
    description: String,
    primaryColor: { type: String, default: '#8B4513' },
    secondaryColor: { type: String, default: '#2D5016' },
    accentColor: { type: String, default: '#D4A574' },
    contactEmail: String,
    contactPhone: String,
  },
  
  // Hero Section
  hero: {
    title: String,
    subtitle: String,
    ctaText: String,
    ctaLink: String,
    mediaType: { type: String, enum: ['video', 'image'], default: 'video' },
    videoUrl: String,
    imageUrl: String,
    overlay: { type: Number, default: 0.4 },
  },
  
  // Pages
  pages: [{
    id: String,
    title: String,
    slug: String,
    content: String,
    createdAt: { type: Date, default: Date.now },
  }],
  
  // Sections
  sections: [{
    id: String,
    title: String,
    type: String,
    content: String,
    media: String,
    order: Number,
    createdAt: { type: Date, default: Date.now },
  }],
  
  // Blog
  blog: [{
    id: String,
    title: String,
    category: String,
    content: String,
    image: String,
    createdAt: { type: Date, default: Date.now },
  }],
  
  // Destinations
  destinations: [{
    id: String,
    name: String,
    country: String,
    description: String,
    image: String,
    createdAt: { type: Date, default: Date.now },
  }],
  
  // Travel Planning Requests
  travelRequests: [{
    id: String,
    tripType: String,
    vibe: String,
    destination: String,
    duration: Number,
    budget: String,
    requirements: String,
    email: String,
    phone: String,
    travelMemory: String,
    status: { type: String, enum: ['new', 'contacted', 'completed'], default: 'new' },
    createdAt: { type: Date, default: Date.now },
  }],
  
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const SiteContent = mongoose.models.SiteContent || mongoose.model('SiteContent', SiteContentSchema);
