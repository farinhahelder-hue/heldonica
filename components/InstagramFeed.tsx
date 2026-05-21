'use client'

import Link from 'next/link'
import Image from 'next/image'

interface InstagramPost {
  id: string
  timestamp: string
  permalink: string
  mediaType: string
  isReel?: boolean
  mediaUrl: string
  thumbnailUrl?: string
  caption: string
  prunedCaption: string
}

interface InstagramData {
  biography: string
  profilePictureUrl: string
  followersCount: number
  posts: InstagramPost[]
}

interface InstagramFeedProps {
  data?: InstagramData
}

const DEFAULT_DATA: InstagramData = {
  biography: 'Explorateurs émerveillés, dénicheurs de pépites, créateurs d\'aventure',
  profilePictureUrl: 'https://cdn2.behold.pictures/krtq4aOLMchlDMKueVu5yuJE1i42/17841475314011094/profile.webp',
  followersCount: 94,
  posts: [
    {
      id: '18094297271228057',
      timestamp: '2026-05-19T19:22:12+0000',
      permalink: 'https://www.instagram.com/p/DYiCRfbDDow/',
      mediaType: 'IMAGE',
      mediaUrl: 'https://scontent-sof1-2.cdninstagram.com/v/t51.82787-15/701157049_17888515308510468_6229517155163490485_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=111&ccb=7-5&_nc_sid=18de74',
      prunedCaption: 'Révélation du mardi soir... Une salade toute simple.'
    },
    {
      id: '17888752854377537',
      timestamp: '2026-05-19T12:18:32+0000',
      permalink: 'https://www.instagram.com/reel/DYhRlZ3M-Yb/',
      mediaType: 'VIDEO',
      isReel: true,
      mediaUrl: 'https://scontent-sof1-2.cdninstagram.com/v/t51.71878-15/704206722_2130696197781057_8838662902988251231_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=110',
      thumbnailUrl: 'https://scontent-sof1-2.cdninstagram.com/v/t51.71878-15/704206722_2130696197781057_8838662902988251231_n.jpg?stp=dst-jpg_e35_tt6',
      prunedCaption: 'Paris 1878, le lac du parc Montsouris...'
    },
    {
      id: '18073705643299378',
      timestamp: '2026-05-18T07:11:20+0000',
      permalink: 'https://www.instagram.com/reel/DYeJrTKs0tW/',
      mediaType: 'VIDEO',
      isReel: true,
      mediaUrl: 'https://scontent-sof1-1.cdninstagram.com/v/t51.71878-15/702525304_1346431114047805_2082488216536267381_n.jpg?stp=dst-jpg_e35_tt6',
      thumbnailUrl: 'https://scontent-sof1-1.cdninstagram.com/v/t51.71878-15/702525304_1346431114047805_2082488216536267381_n.jpg?stp=dst-jpg_e35_tt6',
      prunedCaption: '#mondaymood #nature'
    },
    {
      id: '17941641933200847',
      timestamp: '2026-05-16T22:02:36+0000',
      permalink: 'https://www.instagram.com/reel/DYalbblsPSZ/',
      mediaType: 'VIDEO',
      isReel: true,
      mediaUrl: 'https://scontent-sof1-1.cdninstagram.com/v/t51.71878-15/701009750_808778528736606_7922379865124072296_n.jpg?stp=dst-jpg_e35_tt6',
      thumbnailUrl: 'https://scontent-sof1-1.cdninstagram.com/v/t51.71878-15/701009750_808778528736606_7922379865124072296_n.jpg?stp=dst-jpg_e35_tt6',
      prunedCaption: 'Un samedi au Havre...'
    },
    {
      id: '17944143159018066',
      timestamp: '2026-05-15T07:32:17+0000',
      permalink: 'https://www.instagram.com/reel/DYWdiiAsl7m/',
      mediaType: 'VIDEO',
      isReel: true,
      mediaUrl: 'https://scontent-sof1-1.cdninstagram.com/v/t51.71878-15/696070451_4004021229899110_4432688687598379494_n.jpg?stp=dst-jpg_e35_tt6',
      thumbnailUrl: 'https://scontent-sof1-1.cdninstagram.com/v/t51.71878-15/696070451_4004021229899110_4432688687598379494_n.jpg?stp=dst-jpg_e35_tt6',
      prunedCaption: 'Tu peux demander à la dame?'
    },
    {
      id: '18585101782063476',
      timestamp: '2026-05-14T11:13:55+0000',
      permalink: 'https://www.instagram.com/reel/DYUSFK7Md_W/',
      mediaType: 'VIDEO',
      isReel: true,
      mediaUrl: 'https://scontent-sof1-2.cdninstagram.com/v/t51.71878-15/700134682_2429197154209719_1511111923027686534_n.jpg?stp=dst-jpg_e35_tt6',
      thumbnailUrl: 'https://scontent-sof1-2.cdninstagram.com/v/t51.71878-15/700134682_2429197154209719_1511111923027686534_n.jpg?stp=dst-jpg_e35_tt6',
      prunedCaption: 'Bogotá, on ne t\'avait pas prévu.'
    }
  ]
}

export default function InstagramFeed({ data }: InstagramFeedProps) {
  const instagramData = data || DEFAULT_DATA
  const { posts, profilePictureUrl, followersCount, biography } = instagramData

  return (
    <section className="py-16 bg-stone-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden">
              <Image 
                src={profilePictureUrl} 
                alt="@heldonica" 
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-serif text-xl text-stone-900">@heldonica</h3>
              <p className="text-sm text-stone-500">{followersCount} abonnés</p>
            </div>
          </div>
          <a 
            href="https://instagram.com/heldonica"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-eucalyptus hover:underline font-medium"
          >
            Suivre →
          </a>
        </div>

        <p className="text-stone-600 mb-10 max-w-2xl">{biography}</p>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {posts.map((post) => (
            <a 
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square relative group overflow-hidden rounded-lg"
            >
              {post.mediaType === 'VIDEO' ? (
                <div className="absolute inset-0 bg-stone-200">
                  <Image 
                    src={post.thumbnailUrl || post.mediaUrl} 
                    alt=""
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {post.isReel && (
                    <span className="absolute top-2 right-2 text-white text-xs bg-black/60 px-1.5 py-0.5 rounded">
                      🎥
                    </span>
                  )}
                </div>
              ) : (
                <Image 
                  src={post.mediaUrl}
                  alt={post.prunedCaption}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-2">
                <p className="text-white text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity">
                  {post.prunedCaption.slice(0, 50)}...
                </p>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a 
            href="https://instagram.com/heldonica"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-eucalyptus font-medium hover:gap-3 transition-all"
          >
            Voir plus sur Instagram →
          </a>
        </div>
      </div>
    </section>
  )
}