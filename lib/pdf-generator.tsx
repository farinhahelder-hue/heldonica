import React from 'react'
import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer'

Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVQ.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsgH1x4gaVQ.ttf', fontWeight: 700 },
  ],
})

const C = {
  eucalyptus: '#2C6E49',
  mahogany: '#4A2C2A',
  charcoal: '#2D2D2D',
  cloudDancer: '#F5F0EB',
  white: '#FFFFFF',
  teal: '#1B998B',
  gold: '#D4A72C',
  rose: '#C4714A',
  sage: '#8CB09A',
}

const s = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Open Sans', backgroundColor: C.white },
  coverPage: { padding: 0, backgroundColor: C.charcoal },
  coverOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 40 },
  coverTitle: { fontSize: 36, fontWeight: 700, color: C.white, textAlign: 'center', marginBottom: 12 },
  coverSubtitle: { fontSize: 16, color: C.cloudDancer, textAlign: 'center', marginBottom: 24, lineHeight: 1.5, maxWidth: 400 },
  coverLabel: { fontSize: 10, color: C.teal, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: 700, color: C.mahogany, marginBottom: 16, marginTop: 24, borderBottomWidth: 2, borderBottomColor: C.eucalyptus, paddingBottom: 8 },
  subsectionTitle: { fontSize: 14, fontWeight: 700, color: C.mahogany, marginTop: 16, marginBottom: 8 },
  factGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  factCard: { width: '45%', padding: 12, borderRadius: 8, backgroundColor: C.cloudDancer },
  factLabel: { fontSize: 8, color: C.eucalyptus, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 },
  factValue: { fontSize: 12, color: C.charcoal, fontWeight: 700 },
  bodyText: { fontSize: 10, color: C.charcoal, lineHeight: 1.6, marginBottom: 8 },
  articleItem: { marginBottom: 12, padding: 12, backgroundColor: C.cloudDancer, borderRadius: 6 },
  articleTitle: { fontSize: 12, fontWeight: 700, color: C.mahogany, marginBottom: 4 },
  articleExcerpt: { fontSize: 10, color: C.charcoal, lineHeight: 1.4 },
  checklistItem: { flexDirection: 'row', gap: 8, marginBottom: 6, alignItems: 'flex-start' },
  checkbox: { width: 12, height: 12, marginTop: 2, borderWidth: 2, borderColor: C.eucalyptus, borderRadius: 2 },
  checklistText: { fontSize: 10, color: C.charcoal, flex: 1, lineHeight: 1.4 },
  tag: { fontSize: 8, color: C.white, backgroundColor: C.eucalyptus, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 4 },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
  budgetLabel: { fontSize: 10, color: C.charcoal },
  budgetValue: { fontSize: 10, fontWeight: 700, color: C.eucalyptus },
  itineraryDay: { marginBottom: 16, padding: 12, backgroundColor: C.cloudDancer, borderRadius: 6, borderLeftWidth: 3, borderLeftColor: C.teal },
  itineraryDayNum: { fontSize: 10, fontWeight: 700, color: C.teal, marginBottom: 4 },
  itineraryTitle: { fontSize: 11, fontWeight: 700, color: C.mahogany, marginBottom: 4 },
  itineraryDesc: { fontSize: 9, color: C.charcoal, lineHeight: 1.5 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#999', borderTopWidth: 1, borderTopColor: '#ddd', paddingTop: 12 },
  ctaBox: { marginTop: 24, padding: 16, backgroundColor: C.eucalyptus, borderRadius: 8, textAlign: 'center' },
  ctaText: { fontSize: 12, color: C.white, fontWeight: 700 },
  ctaSubtext: { fontSize: 10, color: C.cloudDancer, marginTop: 4 },
  twoCol: { flexDirection: 'row', gap: 16 },
})

interface GuideData {
  title: string
  subtitle?: string
  destinationSlug: string
  country?: string
  flagEmoji?: string
  travelStyle?: string
  bestSeason?: string
  avgBudget?: number
  heroImage?: string
  articles: { title: string; excerpt: string; slug: string }[]
}

const STYLE_LABELS: Record<string, string> = {
  'slow-culture': 'Slow & Culture',
  'slow-nature': 'Slow & Nature',
  'nature': 'Nature',
  'culture': 'Culture',
  'city': 'Ville',
  'food': 'Food & Gastronomie',
}

function formatBudget(amount?: number): string {
  if (!amount) return ''
  if (amount >= 1000) return `~${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k€ / semaine / couple`
  return `~${amount}€ / semaine / couple`
}

const CHECKLIST_ITEMS = [
  'Passeport valide 6 mois après le retour',
  'Visa si nécessaire (vérifier service-public.fr)',
  'Assurance voyage (carte bancaire + complément)',
  'Adaptateur électrique (type selon pays)',
  'Trousse de premiers soins de base',
  'Chaussures confortables pour la marche',
  ' gourde réutilisable',
  'Carnet de voyage / journal de bord',
  'Appareil photo ou smartphone pour les souvenirs',
  'Guide papier ou sauvegarde offline du PDF',
]

const generateItinerary = (title: string, articles: GuideData['articles']) => {
  if (articles.length === 0) return null
  const name = title.toLowerCase().split('—')[0].trim()
  return [
    { day: 1, title: `Arrivée à ${name}`, desc: `Installation et première découverte de ${name}. Flânerie dans le centre historique, repérage des quartiers, premier repas local.` },
    { day: 2, title: articles[0]?.title || `Exploration de ${name}`, desc: articles[0]?.excerpt?.substring(0, 180) || `Journée consacrée à la découverte des incontournables de ${name}.` },
    ...(articles[1] ? [{ day: 3, title: articles[1].title, desc: articles[1].excerpt?.substring(0, 180) || `Suite de l'exploration.` }] : []),
    ...(articles[2] ? [{ day: 4, title: articles[2].title, desc: articles[2].excerpt?.substring(0, 180) || `Journée découverte.` }] : []),
    { day: 5, title: `Dernier jour à ${name}`, desc: `Dernières balades, achats souvenirs, et départ. Ou prolongation du séjour !` },
  ]
}

export function TravelGuidePDF({ data }: { data: GuideData }) {
  const styleLabel = data.travelStyle ? STYLE_LABELS[data.travelStyle] || data.travelStyle : ''
  const itinerary = generateItinerary(data.title, data.articles)
  const destName = data.title.toLowerCase().split('—')[0].trim()

  return (
    <Document>
      {/* Cover */}
      <Page size="A4" style={s.coverPage}>
        <Image src={data.heroImage || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80'} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
        <View style={s.coverOverlay}>
          <Text style={s.coverLabel}>{data.flagEmoji} Guide de voyage</Text>
          <Text style={s.coverTitle}>{data.title}</Text>
          {data.subtitle && <Text style={s.coverSubtitle}>{data.subtitle}</Text>}
          <Text style={{ fontSize: 10, color: C.cloudDancer, marginTop: 20 }}>heldonica.fr/destinations/{data.destinationSlug}</Text>
        </View>
      </Page>

      {/* Page 1: Quick facts + Budget */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>En un coup d'œil</Text>
        <View style={s.factGrid}>
          {styleLabel && (
            <View style={s.factCard}>
              <Text style={s.factLabel}>Style</Text>
              <Text style={s.factValue}>{styleLabel}</Text>
            </View>
          )}
          {data.bestSeason && (
            <View style={s.factCard}>
              <Text style={s.factLabel}>Meilleure saison</Text>
              <Text style={s.factValue}>{data.bestSeason}</Text>
            </View>
          )}
          {data.avgBudget && (
            <View style={s.factCard}>
              <Text style={s.factLabel}>Budget indicatif</Text>
              <Text style={s.factValue}>{formatBudget(data.avgBudget)}</Text>
            </View>
          )}
          {data.country && (
            <View style={s.factCard}>
              <Text style={s.factLabel}>Pays</Text>
              <Text style={s.factValue}>{data.country}</Text>
            </View>
          )}
        </View>

        {data.avgBudget && (
          <>
            <Text style={s.sectionTitle}>Budget estimé</Text>
            <View style={s.budgetRow}><Text style={s.budgetLabel}>Hébergement (7 nuits)</Text><Text style={s.budgetValue}>~{Math.round(data.avgBudget * 0.35)}€</Text></View>
            <View style={s.budgetRow}><Text style={s.budgetLabel}>Repas (7 jours)</Text><Text style={s.budgetValue}>~{Math.round(data.avgBudget * 0.30)}€</Text></View>
            <View style={s.budgetRow}><Text style={s.budgetLabel}>Transports sur place</Text><Text style={s.budgetValue}>~{Math.round(data.avgBudget * 0.15)}€</Text></View>
            <View style={s.budgetRow}><Text style={s.budgetLabel}>Activités & visites</Text><Text style={s.budgetValue}>~{Math.round(data.avgBudget * 0.12)}€</Text></View>
            <View style={{ ...s.budgetRow, borderBottomWidth: 2, borderBottomColor: C.eucalyptus }}>
              <Text style={{ ...s.budgetLabel, fontWeight: 700 }}>Total estimé / couple / semaine</Text>
              <Text style={{ ...s.budgetValue, fontSize: 12 }}>{formatBudget(data.avgBudget)}</Text>
            </View>
            <Text style={{ ...s.bodyText, marginTop: 8, fontSize: 8, color: '#999' }}>
              * Budget estimé basé sur notre expérience. Les prix varient selon la saison et le niveau de confort.
            </Text>
          </>
        )}

        {itinerary && (
          <>
            <Text style={s.sectionTitle}>Itinéraire suggéré — {data.articles.length > 0 ? `${data.articles.length} jours` : '5 jours'}</Text>
            <Text style={{ ...s.bodyText, fontSize: 9, color: '#888', marginBottom: 12 }}>
              Un planning indicatif pour t&apos;inspirer. Adapte-le à ton rythme et à tes envies.
            </Text>
            {itinerary.map((day) => (
              <View key={day.day} style={s.itineraryDay}>
                <Text style={s.itineraryDayNum}>Jour {day.day}</Text>
                <Text style={s.itineraryTitle}>{day.title}</Text>
                <Text style={s.itineraryDesc}>{day.desc}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={s.footer}>Généré par Heldonica — Voyage lent & Slow Travel | heldonica.fr</Text>
      </Page>

      {/* Page 2: Articles + Checklist */}
      <Page size="A4" style={s.page}>
        {data.articles.length > 0 && (
          <>
            <Text style={s.sectionTitle}>
              {data.articles.length === 1 ? 'Article à lire' : `Nos ${data.articles.length} articles sur ${destName}`}
            </Text>
            {data.articles.map((a, i) => (
              <View key={i} style={s.articleItem}>
                <Text style={s.articleTitle}>{a.title}</Text>
                <Text style={s.articleExcerpt}>{a.excerpt?.substring(0, 200) || ''}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={s.sectionTitle}>Checklist voyage</Text>
        <Text style={{ ...s.bodyText, fontSize: 9, color: '#888', marginBottom: 12 }}>
          Coche au fur et à mesure pour ne rien oublier.
        </Text>
        {CHECKLIST_ITEMS.map((item, i) => (
          <View key={i} style={s.checklistItem}>
            <View style={s.checkbox} />
            <Text style={s.checklistText}>{item}</Text>
          </View>
        ))}

        <View style={s.ctaBox}>
          <Text style={s.ctaText}>🌍 Explore {data.title} en détail</Text>
          <Text style={s.ctaSubtext}>heldonica.fr/destinations/{data.destinationSlug}</Text>
        </View>

        <Text style={s.footer}>Généré par Heldonica — Voyage lent & Slow Travel | heldonica.fr</Text>
      </Page>
    </Document>
  )
}
