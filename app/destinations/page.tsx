'use client';

import Link from "next/link"
import { useState, useEffect } from "react"
import Header from "@/components/Header"
import Breadcrumb from "@/components/Breadcrumb"
import Footer from "@/components/Footer"

interface Destination {
  id: string;
  name: string;
  slug: string;
  region: string;
  description: string;
  image: string;
  bestSeason: string;
  duration: string;
  budget: string;
  highlights: string;
}

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('heldonica_destinations');
    if (saved) {
      setDestinations(JSON.parse(saved));
    } else {
      // Destinations par défaut
      setDestinations([
        {
          id: '1',
          name: 'Madère',
          slug: 'madere',
          region: 'Portugal',
          description: 'Entre falaises vertigineuses et jardins suspendus, un voyage au rythme des sentiers côtiers.',
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=400&fit=crop',
          bestSeason: 'Avril à Octobre',
          duration: '7-10 jours',
          budget: '€€',
          highlights: 'Falaises, jardins, randonnées côtières'
        },
        {
          id: '2',
          name: 'Paris',
          slug: 'paris',
          region: 'France',
          description: 'Au-delà des monuments, découvrez les passages secrets, les ateliers d\'artistes et les bistrots authentiques.',
          image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&h=400&fit=crop',
          bestSeason: 'Avril à Mai, Septembre à Octobre',
          duration: '3-5 jours',
          budget: '€€',
          highlights: 'Architecture, musées, gastronomie'
        },
        {
          id: '3',
          name: 'Normandie',
          slug: 'normandie',
          region: 'France',
          description: 'Falaises de craie, villages de charme et patrimoine maritime. Un voyage dans le temps et la beauté.',
          image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=400&fit=crop',
          bestSeason: 'Mai à Septembre',
          duration: '4-6 jours',
          budget: '€€',
          highlights: 'Falaises, villages côtiers, histoire'
        },
        {
          id: '4',
          name: 'Timișoara',
          slug: 'timisoara',
          region: 'Roumanie',
          description: 'Architecture austro-hongroise, histoire riche et gastronomie généreuse. L\'Europe de l\'Est autrement.',
          image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=400&fit=crop',
          bestSeason: 'Avril à Octobre',
          duration: '5-7 jours',
          budget: '€',
          highlights: 'Architecture, histoire, gastronomie'
        },
        {
          id: '5',
          name: 'Le Havre',
          slug: 'le-havre',
          region: 'France',
          description: 'Architecture moderniste, musées avant-gardistes et port mythique. Une ville en renaissance.',
          image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=400&fit=crop',
          bestSeason: 'Mai à Septembre',
          duration: '2-3 jours',
          budget: '€',
          highlights: 'Architecture, musées, port'
        },
        {
          id: '6',
          name: 'Île-de-France',
          slug: 'ile-de-france',
          region: 'France',
          description: 'Châteaux, forêts et villages pittoresques. L\'essence de la France à quelques kilomètres de Paris.',
          image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=400&fit=crop',
          bestSeason: 'Avril à Octobre',
          duration: '3-4 jours',
          budget: '€€',
          highlights: 'Châteaux, nature, villages'
        }
      ]);
    }
  }, []);
  return (
    <>
      <Header />
      <Breadcrumb />
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-center mb-4">Nos Destinations</h1>
          <p className="text-gray-600 text-center mb-12">Découvrez nos destinations de voyage</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <Link 
              key={dest.id}
              href={`/destinations/${dest.slug}`}
              className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="aspect-[4/3] relative bg-gray-200 overflow-hidden">
                <img 
                  src={dest.image} 
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-lg group-hover:text-amber-900">{dest.name}</h2>
                <p className="text-sm text-gray-500">{dest.region}</p>
                <p className="text-sm text-gray-600 mt-2">{dest.description}</p>
                <div className="mt-3 flex justify-between text-xs text-gray-500">
                  <span>⏱️ {dest.duration}</span>
                  <span>💰 {dest.budget}</span>
                </div>
              </div>
            </Link>
          ))}        </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
