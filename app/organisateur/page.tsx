'use client';

import { useState, useEffect } from 'react';

type TripStep = {
  id: string;
  city: string;
  country: string;
  startDate: string;
  nights: number;
  accommodation: number;
  transport: number;
  food: number;
  activities: number;
};

type ChecklistItem = {
  id: string;
  text: string;
  checked: boolean;
  category: string;
};

const CHECKLIST_TEMPLATES: Record<string, { text: string; category: string }[]> = {
  default: [
    { text: 'Passeport / CNI valide', category: 'documents' },
    { text: 'Billets avion/train', category: 'documents' },
    { text: 'Réservation hébergement', category: 'réservations' },
    { text: 'Assurance voyage', category: 'santé' },
    { text: 'Médicaments', category: 'santé' },
    { text: 'Vêtements adaptés', category: 'équipement' },
    { text: 'Chargeurs appareils', category: 'équipement' },
    { text: 'Appareil photo', category: 'équipement' },
    { text: 'Argent liquide', category: 'divers' },
    { text: 'Cartes bancaires', category: 'divers' },
  ],
  citybreak: [
    { text: 'Passeport / CNI', category: 'documents' },
    { text: 'Billets', category: 'documents' },
    { text: 'Réservation hotel', category: 'réservations' },
    { text: 'Plan du quartier', category: 'divers' },
    { text: 'Tenues légères', category: 'équipement' },
    { text: 'Chaussures marche', category: 'équipement' },
    { text: 'Appareil photo', category: 'équipement' },
  ],
  randonnee: [
    { text: 'Validité passport', category: 'documents' },
    { text: 'Assurance montagne', category: 'santé' },
    { text: 'Chaussures rando', category: 'équipement' },
    { text: 'Sac à dos', category: 'équipement' },
    { text: 'Vêtements pluie', category: 'équipement' },
    { text: 'Trousse premiers secours', category: 'santé' },
    { text: 'Bouteille eau', category: 'équipement' },
    { text: 'Carte IGN', category: 'équipement' },
  ],
  roadtrip: [
    { text: 'Permis conduire', category: 'documents' },
    { text: 'Location véhicule', category: 'réservations' },
    { text: 'Assurance RC', category: 'santé' },
    { text: 'Carte grise', category: 'documents' },
    { text: 'Trousse secours', category: 'santé' },
    { text: 'Kit dépannage', category: 'équipement' },
    { text: 'GPS offline', category: 'équipement' },
    { text: 'Snacks route', category: 'divers' },
  ],
};

export default function TravelOrganizer() {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [tripType, setTripType] = useState('citybreak');
  const [stages, setStages] = useState<TripStep[]>([
    { id: '1', city: '', country: '', startDate: '', nights: 3, accommodation: 150, transport: 100, food: 80, activities: 50 },
  ]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  const totalNights = stages.reduce((sum, s) => sum + s.nights, 0);
  const totalBudget = stages.reduce((sum, s) => sum + s.accommodation + s.transport + s.food + s.activities, 0);
  const costPerPerson = travelers > 0 ? totalBudget / travelers : 0;
  const costPerDay = totalNights > 0 ? totalBudget / totalNights : 0;
  const checkedItems = checklist.filter(i => i.checked).length;
  const progress = checklist.length > 0 ? Math.round((checkedItems / checklist.length) * 100) : 0;

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('organizer_trip');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setDestination(data.destination || '');
        setStartDate(data.startDate || '');
        setEndDate(data.endDate || '');
        setTravelers(data.travelers || 2);
        setTripType(data.tripType || 'citybreak');
        setStages(data.stages || [{ id: '1', city: '', country: '', startDate: '', nights: 3, accommodation: 150, transport: 100, food: 80, activities: 50 }]);
        if (data.checklist) setChecklist(data.checklist);
      } catch { /* ignore */ }
    }
  }, []);

  // Autosave to localStorage on changes
  useEffect(() => {
    const data = { destination, startDate, endDate, travelers, tripType, stages, checklist };
    localStorage.setItem('organizer_trip', JSON.stringify(data));
  }, [destination, startDate, endDate, travelers, tripType, stages, checklist]);

  const template = CHECKLIST_TEMPLATES[tripType] || CHECKLIST_TEMPLATES.default;
  useEffect(() => {
    if (!localStorage.getItem('organizer_trip')) {
      setChecklist(template.map((item, i) => ({
        id: String(i),
        text: item.text,
        checked: false,
        category: item.category,
      })));
    }
  }, [tripType]);

  const addStage = () => {
    setStages([...stages, {
      id: Date.now().toString(),
      city: '',
      country: '',
      startDate: '',
      nights: 3,
      accommodation: 150,
      transport: 100,
      food: 80,
      activities: 50,
    }]);
  };

  const updateStage = (id: string, field: keyof TripStep, value: unknown) => {
    setStages(stages.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeStage = (id: string) => {
    if (stages.length > 1) setStages(stages.filter(s => s.id !== id));
  };

  const toggleChecklist = (id: string) => {
    setChecklist(checklist.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  };

  const exportPlan = () => {
    const content = `VOYAGE À ${destination.toUpperCase()}
Dates: ${startDate} - ${endDate}
Voyageurs: ${travelers}

ITINÉRAIRE
${stages.map((s, i) => `${i + 1}. ${s.city} (${s.country}) - ${s.nights} nuits
   Hébergement: ${s.accommodation}€ | Transport: ${s.transport}€ | Food: ${s.food}€ | Activités: ${s.activities}€`).join('\n')}

BUDGET: ${totalBudget}€ total (${costPerPerson}€/pers, ${costPerDay}€/jour)

CHECKLIST
${checklist.map(i => `[${i.checked ? 'x' : ' '}] ${i.text}`).join('\n')}

Généré avec Heldonica`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voyage-${destination.replace(/\s+/g, '-')}.txt`;
    a.click();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#faf8f5', padding: '2rem 1rem' }} id="organizer-content">
      <style>{`@media print { body { background: white; } #organizer-content { background: white !important; padding: 1rem !important; } button { display: none !important; } }`}</style>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {typeof window !== 'undefined' && localStorage.getItem('organizer_trip') && (
        <div style={{ background: '#e8f5e9', padding: '.5rem 1rem', borderRadius: '.5rem', marginBottom: '1rem', fontSize: '.85rem', color: '#2e7d32' }}>
          💾 Voyage localement sauvegardé • <button onClick={() => localStorage.removeItem('organizer_trip')} style={{ background: 'none', border: 'none', color: '#2e7d32', textDecoration: 'underline', cursor: 'pointer' }}>Effacer</button>
        </div>
      )}
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#6b2a1a' }}>✈️ Organisateur de voyage</h1>
          <p style={{ color: '#888' }}>Planifiez votre trip, gérez votre budget</p>
        </div>

        {/* Trip Info */}
        <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>📍 Votre voyage</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '.85rem', color: '#666', marginBottom: '.3rem' }}>Destination</label>
              <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="Portugal, Toscane..." style={{ width: '100%', padding: '.65rem', border: '1.5px solid #e0dbd5', borderRadius: '.5rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '.85rem', color: '#666', marginBottom: '.3rem' }}>Type</label>
              <select value={tripType} onChange={e => setTripType(e.target.value)} style={{ width: '100%', padding: '.65rem', border: '1.5px solid #e0dbd5', borderRadius: '.5rem' }}>
                <option value="citybreak">🏙️ City break</option>
                <option value="randonnee">🥾 Randonnée</option>
                <option value="roadtrip">🚗 Road trip</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '.85rem', color: '#666', marginBottom: '.3rem' }}>Voyageurs</label>
              <input type="number" value={travelers} onChange={e => setTravelers(Number(e.target.value))} min={1} style={{ width: '100%', padding: '.65rem', border: '1.5px solid #e0dbd5', borderRadius: '.5rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '.85rem', color: '#666', marginBottom: '.3rem' }}>Dates</label>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ flex: 1, padding: '.65rem', border: '1.5px solid #e0dbd5', borderRadius: '.5rem' }} />
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ flex: 1, padding: '.65rem', border: '1.5px solid #e0dbd5', borderRadius: '.5rem' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Itinerary */}
        <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontWeight: 700 }}>🗺️ Itinéraire</h2>
            <span style={{ color: '#888' }}>{totalNights} nuits</span>
          </div>
          {stages.map((stage, i) => (
            <div key={stage.id} style={{ padding: '1rem', background: '#f8f6f4', borderRadius: '.75rem', marginBottom: '.75rem' }}>
              <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.75rem', alignItems: 'center' }}>
                <span style={{ width: 28, height: 28, background: '#6b2a1a', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{i + 1}</span>
                <input value={stage.city} onChange={e => updateStage(stage.id, 'city', e.target.value)} placeholder="Ville" style={{ flex: 1, padding: '.5rem', border: '1px solid #ddd', borderRadius: '.4rem' }} />
                <input value={stage.country} onChange={e => updateStage(stage.id, 'country', e.target.value)} placeholder="Pays" style={{ width: 80, padding: '.5rem', border: '1px solid #ddd', borderRadius: '.4rem' }} />
                <input type="number" value={stage.nights} onChange={e => updateStage(stage.id, 'nights', Number(e.target.value))} style={{ width: 60, padding: '.5rem', border: '1px solid #ddd', borderRadius: '.4rem' }} />
                <span style={{ fontSize: '.75rem', color: '#888' }}>nuits</span>
                {stages.length > 1 && <button onClick={() => removeStage(stage.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</button>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '.5rem' }}>
                {['Hébergement', 'Transport', 'Restauration', 'Activités'].map((label, idx) => (
                  <div key={label}>
                    <label style={{ fontSize: '.7rem', color: '#888' }}>{label}</label>
                    <input
                      type="number"
                      value={[stage.accommodation, stage.transport, stage.food, stage.activities][idx]}
                      onChange={e => updateStage(stage.id, ['accommodation', 'transport', 'food', 'activities'][idx] as keyof TripStep, Number(e.target.value))}
                      style={{ width: '100%', padding: '.4rem', border: '1px solid #ddd', borderRadius: '.3rem' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button onClick={addStage} style={{ marginTop: '.5rem', padding: '.6rem 1rem', background: '#f0ece6', border: 'none', borderRadius: '.5rem', cursor: 'pointer' }}>+ Ajouter une étape</button>
        </div>

        {/* Budget */}
        <div style={{ background: 'linear-gradient(135deg, #6b2a1a, #8b3a2a)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem', color: 'white' }}>
          <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>💰 Budget</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', textAlign: 'center' }}>
            <div><div style={{ fontSize: '2rem', fontWeight: 700 }}>{totalBudget}€</div><div style={{ opacity: .8, fontSize: '.8rem' }}>Total</div></div>
            <div><div style={{ fontSize: '2rem', fontWeight: 700 }}>{costPerPerson}€</div><div style={{ opacity: .8, fontSize: '.8rem' }}>/pers</div></div>
            <div><div style={{ fontSize: '2rem', fontWeight: 700 }}>{costPerDay}€</div><div style={{ opacity: .8, fontSize: '.8rem' }}>/jour</div></div>
            <div><div style={{ fontSize: '2rem', fontWeight: 700 }}>{travelers}</div><div style={{ opacity: .8, fontSize: '.8rem' }}>voyageurs</div></div>
          </div>
        </div>

        {/* Checklist */}
        <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontWeight: 700 }}>✅ Checklist</h2>
            <span style={{ color: '#888' }}>{progress}%</span>
          </div>
          <div style={{ height: 8, background: '#e0dbd5', borderRadius: 4, marginBottom: '1rem' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: progress === 100 ? '#27ae60' : '#01696f', borderRadius: 4 }} />
          </div>
          {['documents', 'réservations', 'santé', 'équipement', 'divers'].map(cat => (
            <div key={cat} style={{ marginBottom: '.75rem' }}>
              <div style={{ fontSize: '.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>{cat}</div>
              {checklist.filter(i => i.category === cat).map(item => (
                <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.4rem 0', cursor: 'pointer' }}>
                  <input type="checkbox" checked={item.checked} onChange={() => toggleChecklist(item.id)} style={{ width: 18, height: 18 }} />
                  <span style={{ textDecoration: item.checked ? 'line-through' : 'none', color: item.checked ? '#aaa' : '#333' }}>{item.text}</span>
                </label>
              ))}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button onClick={() => { localStorage.removeItem('organizer_trip'); window.location.reload(); }} style={{ padding: '.75rem 1rem', background: '#f0ece6', border: 'none', borderRadius: '.5rem', cursor: 'pointer', fontSize: '.85rem', marginRight: '.5rem' }}>
            🗑️ Effacer
          </button>
          <button onClick={() => window.print()} style={{ padding: '.75rem 1rem', background: '#f0ece6', border: 'none', borderRadius: '.5rem', cursor: 'pointer', fontSize: '.85rem', marginRight: '.5rem' }}>
            🖨️ PDF
          </button>
          <button onClick={exportPlan} style={{ padding: '.75rem 1.5rem', background: '#01696f', color: 'white', border: 'none', borderRadius: '.5rem', cursor: 'pointer', fontWeight: 600, marginRight: '1rem' }}>
            📥 Exporter
          </button>
          <a href="/travel-planning" style={{ display: 'inline-block', padding: '.75rem 1.5rem', background: '#6b2a1a', color: 'white', borderRadius: '.5rem', textDecoration: 'none', fontWeight: 600 }}>
            ✈️ Demander un devis
          </a>
        </div>
      </div>
    </div>
  );
}