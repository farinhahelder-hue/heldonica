/**
 * Static Instagram Feed Data for Heldonica
 * 
 * Hold feed from Behold.so API
 * Updated: 2026-04-11
 */

export const INSTAGRAM_FEED = {
  username: 'heldonica',
  biography: 'Explorateurs émerveillés, dénicheurs de pépites, créateurs d\'aventure',
  profilePictureUrl: 'https://cdn2.behold.pictures/krtq4aOLMchlDMKueVu5yuJE1i42/17841475314011094/profile.webp',
  website: 'https://heldonica.fr',
  followersCount: 94,
  followsCount: 449,
  posts: [
    {
      id: '18588338698048333',
      timestamp: '2026-04-11T07:53:53+0000',
      permalink: 'https://www.instagram.com/reel/DW-9NATjCm_/',
      mediaType: 'VIDEO',
      isReel: true,
      mediaUrl: 'https://behold.pictures/krtq4aOLMchlDMKueVu5yuJE1i42/8kD1vdXnKhVHsobvOVfM/18588338698048333/large.jpg',
      thumbnailUrl: 'https://behold.pictures/krtq4aOLMchlDMKueVu5yuJE1i42/8kD1vdXnKhVHsobvOVfM/18588338698048333/medium.jpg',
      caption: '',
      prunedCaption: '',
    },
    {
      id: '17907226542380362',
      timestamp: '2026-04-08T19:03:44+0000',
      permalink: 'https://www.instagram.com/p/DW4bkbOjLWR/',
      mediaType: 'IMAGE',
      mediaUrl: 'https://behold.pictures/krtq4aOLMchlDMKueVu5yuJE1i42/8kD1vdXnKhVHsobvOVfM/17907226542380362/large.jpg',
      caption: 'Quand Cupidon swipe right 💘 C\'est un match\n\n#StreetArt #UrbexParis #ArtDeRue #Cupidon',
      prunedCaption: 'Quand Cupidon swipe right 💘 C\'est un match',
    },
    {
      id: '18013474916683592',
      timestamp: '2026-04-06T19:09:54+0000',
      permalink: 'https://www.instagram.com/p/DWzSr1XDKOQ/',
      mediaType: 'IMAGE',
      mediaUrl: 'https://behold.pictures/krtq4aOLMchlDMKueVu5yuJE1i42/8kD1vdXnKhVHsobvOVfM/18013474916683592/large.jpg',
      caption: '🌿 Quand la nature reprend ses droits sur la pierre…\n\nIl y a des rues à Paris où le temps semble suspendu.',
      prunedCaption: '🌿 Quand la nature reprend ses droits sur la pierre…',
    },
    {
      id: '18337165339219767',
      timestamp: '2026-04-06T16:29:44+0000',
      permalink: 'https://www.instagram.com/p/DWzAWrMDFIP/',
      mediaType: 'IMAGE',
      mediaUrl: 'https://behold.pictures/krtq4aOLMchlDMKueVu5yuJE1i42/8kD1vdXnKhVHsobvOVfM/18337165339219767/large.jpg',
      caption: 'Paris est sous invasion, et c\'est la meilleure nouvelle de la journée.',
      prunedCaption: 'Paris est sous invasion, et c\'est la meilleure nouvelle de la journée.',
    },
    {
      id: '18155644081403583',
      timestamp: '2026-04-06T15:04:37+0000',
      permalink: 'https://www.instagram.com/reel/DWy2jXADEnS/',
      mediaType: 'VIDEO',
      isReel: true,
      mediaUrl: 'https://behold.pictures/krtq4aOLMchlDMKueVu5yuJE1i42/8kD1vdXnKhVHsobvOVfM/18155644081403583/large.jpg',
      thumbnailUrl: 'https://behold.pictures/krtq4aOLMchlDMKueVu5yuJE1i42/8kD1vdXnKhVHsobvOVfM/18155644081403583/medium.jpg',
      caption: 'La vie est plus belle vue d\'un toit parisien. ☕🥐✨',
      prunedCaption: 'La vie est plus belle vue d\'un toit parisien. ☕🥐✨',
    },
    {
      id: '17855528805633945',
      timestamp: '2026-04-06T15:00:52+0000',
      permalink: 'https://www.instagram.com/p/DWy2L1kjCJi/',
      mediaType: 'IMAGE',
      mediaUrl: 'https://behold.pictures/krtq4aOLMchlDMKueVu5yuJE1i42/8kD1vdXnKhVHsobvOVfM/17855528805633945/large.jpg',
      caption: 'Huit siècles d\'histoire et un miracle à ciel ouvert. ✨',
      prunedCaption: 'Huit siècles d\'histoire et un miracle à ciel ouvert. ✨',
    },
  ],
};

export type InstagramPost = typeof INSTAGRAM_FEED.posts[0];