'use client';

import { useState, useEffect } from 'react';

interface Season {
  id?: string;
  destination_key: string;
  name: string;
  emoji?: string;
  months: string[];
  weather?: string;
  crowd?: 'low' | 'medium' | 'high';
  price?: 'low' | 'medium' | 'high';
  description?: string;
  is_active: boolean;
  display_order: number;
}

interface SeasonsManagerProps {
  destinationKey?: string;
}

export default function SeasonsManager({ destinationKey }: SeasonsManagerProps) {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchSeasons = async () => {
    try {
      setLoading(true);
      const url = destinationKey 
        ? `/api/cms/seasons?destination=${destinationKey}`
        : '/api/cms/seasons';
      const response = await fetch(url);
      const data = await response.json();
      setSeasons(data.seasons || []);
    } catch (error) {
      console.error('Failed to fetch seasons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeasons();
  }, [destinationKey]);

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette saison ?')) return;
    
    try {
      const response = await fetch(`/api/cms/seasons?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSeasons(seasons.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete season:', error);
    }
  };

  const handleSave = async (season: Season) => {
    try {
      const method = season.id ? 'PUT' : 'POST';
      const url = season.id ? `/api/cms/seasons?id=${season.id}` : '/api/cms/seasons';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(season),
      });
      
      if (response.ok) {
        setShowForm(false);
        setEditingSeason(null);
        fetchSeasons();
      }
    } catch (error) {
      console.error('Failed to save season:', error);
    }
  };

  const crowdLabels = { low: 'Faible', medium: 'Moyen', high: 'Élevé' };
  const priceLabels = { low: 'Bon marché', medium: 'Modéré', high: 'Premium' };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Saisons</h2>
        <button
          onClick={() => {
            setEditingSeason(null);
            setShowForm(!showForm);
          }}
          className="bg-[#2E4F4F] text-white px-6 py-2 rounded-lg hover:bg-[#1a2f2f] transition"
        >
          {showForm ? 'Annuler' : 'Nouvelle Saison'}
        </button>
      </div>

      {showForm && (
        <SeasonForm
          season={editingSeason}
          defaultDestination={destinationKey}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingSeason(null);
          }}
        />
      )}

      {loading ? (
        <div className="text-center py-8">Chargement des saisons...</div>
      ) : seasons.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucune saison configurée. Cliquez sur &quot;Nouvelle Saison&quot; pour commencer.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ordre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saison
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mois
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Foule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {seasons.map((season) => (
                <tr key={season.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {season.display_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {season.emoji && <span className="mr-2">{season.emoji}</span>}
                      <span className="font-medium text-gray-900">{season.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {season.months?.join(', ') || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {season.crowd ? crowdLabels[season.crowd] : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {season.price ? priceLabels[season.price] : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => {
                        setEditingSeason(season);
                        setShowForm(true);
                      }}
                      className="text-[#2E4F4F] hover:text-[#1a2f2f] mr-4"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(season.id!)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface SeasonFormProps {
  season: Season | null;
  defaultDestination?: string;
  onSave: (season: Season) => void;
  onCancel: () => void;
}

function SeasonForm({ season, defaultDestination, onSave, onCancel }: SeasonFormProps) {
  const [formData, setFormData] = useState<Season>({
    destination_key: season?.destination_key || defaultDestination || '',
    name: season?.name || '',
    emoji: season?.emoji || '',
    months: season?.months || [],
    weather: season?.weather || '',
    crowd: season?.crowd || 'medium',
    price: season?.price || 'medium',
    description: season?.description || '',
    is_active: season?.is_active ?? true,
    display_order: season?.display_order || 0,
  });

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const toggleMonth = (month: string) => {
    setFormData(prev => ({
      ...prev,
      months: prev.months.includes(month)
        ? prev.months.filter(m => m !== month)
        : [...prev.months, month]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: season?.id,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-6">
        {season?.id ? 'Modifier la Saison' : 'Nouvelle Saison'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination
            </label>
            <input
              type="text"
              value={formData.destination_key}
              onChange={(e) => setFormData(prev => ({ ...prev, destination_key: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F]"
              placeholder="Été, Hiver, Printemps..."
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emoji
            </label>
            <input
              type="text"
              value={formData.emoji || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F]"
              placeholder="☀️"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordre d&apos;affichage
            </label>
            <input
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F]"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mois
          </label>
          <div className="flex flex-wrap gap-2">
            {months.map((month) => (
              <button
                key={month}
                type="button"
                onClick={() => toggleMonth(month)}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  formData.months.includes(month)
                    ? 'bg-[#2E4F4F] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {month.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foule
            </label>
            <select
              value={formData.crowd || 'medium'}
              onChange={(e) => setFormData(prev => ({ ...prev, crowd: e.target.value as Season['crowd'] }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F]"
            >
              <option value="low">Faible</option>
              <option value="medium">Moyen</option>
              <option value="high">Élevé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix
            </label>
            <select
              value={formData.price || 'medium'}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value as Season['price'] }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F]"
            >
              <option value="low">Bon marché</option>
              <option value="medium">Modéré</option>
              <option value="high">Premium</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Météo
          </label>
          <input
            type="text"
            value={formData.weather || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, weather: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F]"
            placeholder="18-25°C, ensoleillé"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F]"
            placeholder="Description de la saison..."
          />
        </div>

        <div className="flex gap-4 pt-6 border-t">
          <button
            type="submit"
            className="bg-[#2E4F4F] text-white px-6 py-2 rounded-lg hover:bg-[#1a2f2f] transition"
          >
            Enregistrer
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
