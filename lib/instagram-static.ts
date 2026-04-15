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
    image: 'https://heldonica.fr/wp-content/uploads/2026/03/madere-foret-1024x683.jpg',
  },
  {
    id: 'story-madere-cabo',
    title: 'Lever 6h a Cabo Girao',
    location: 'Madere',
    permalink: 'https://www.instagram.com/heldonica/',
    image: 'https://heldonica.fr/wp-content/uploads/2026/03/fetched-image-2-1024x768.jpg',
  },
  {
    id: 'story-zurich-limmat',
    title: 'Limmat au ralenti',
    location: 'Zurich',
    permalink: 'https://www.instagram.com/heldonica/',
    image: 'https://heldonica.fr/wp-content/uploads/2025/09/zurich-limmat-ete-3-1024x681.jpg',
  },
  {
    id: 'story-stoos-ridge',
    title: 'Crete Stoos',
    location: 'Suisse',
    permalink: 'https://www.instagram.com/heldonica/',
    image: 'https://heldonica.fr/wp-content/uploads/2025/08/PXL_20250712_190916811.RAW-01.COVER-EDIT-1024x771.jpg',
  },
  {
    id: 'story-roumanie',
    title: 'Cour cachee a Timisoara',
    location: 'Roumanie',
    permalink: 'https://www.instagram.com/heldonica/',
    image: 'https://heldonica.fr/wp-content/uploads/2025/09/timisoara-ville-3-1024x683.jpg',
  },
  {
    id: 'story-paris',
    title: 'Petite Ceinture',
    location: 'Paris',
    permalink: 'https://www.instagram.com/heldonica/',
    image: 'https://heldonica.fr/wp-content/uploads/2025/09/paris-petite-ceinture-2-683x1024.jpg',
  },
]
