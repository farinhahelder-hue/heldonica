export interface InstagramStory {
  id: string
  title: string
  location: string
  permalink: string
  image: string
}

export const INSTAGRAM_PROFILE = {
  username: 'heldonica',
  followersLabel: 'Stories terrain faceless',
  website: 'https://heldonica.fr',
}

export const INSTAGRAM_STORIES: InstagramStory[] = [
  {
    id: 'story-madere-fanal',
    title: 'Brume de Fanal',
    location: 'Madere',
    permalink: 'https://www.instagram.com/heldonica/',
    image: 'https://images.unsplash.com/photo-1560719887-fe3105fa1e55?w=1200&q=80',
  },
  {
    id: 'story-madere-cabo',
    title: 'Lever 6h a Cabo Girao',
    location: 'Madere',
    permalink: 'https://www.instagram.com/heldonica/',
    image: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=1200&q=80',
  },
  {
    id: 'story-zurich-limmat',
    title: 'Limmat au ralenti',
    location: 'Zurich',
    permalink: 'https://www.instagram.com/heldonica/',
    image: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1200&q=80',
  },
  {
    id: 'story-stoos-ridge',
    title: 'Crete Stoos',
    location: 'Suisse',
    permalink: 'https://www.instagram.com/heldonica/',
    image: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/blog-images/stoos-01.jpg',
  },
  {
    id: 'story-roumanie',
    title: 'Cour cachee a Timisoara',
    location: 'Roumanie',
    permalink: 'https://www.instagram.com/heldonica/',
    image: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/blog-images/romania-01.jpg',
  },
  {
    id: 'story-paris',
    title: 'Petite Ceinture',
    location: 'Paris',
    permalink: 'https://www.instagram.com/heldonica/',
    image: 'https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b?w=1200&q=80',
  },
]
