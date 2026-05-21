'use client';

import { useState, useEffect } from 'react';
import DestinationForm from './DestinationForm';
import DestinationList from './DestinationList';

export default function DestinationManager() {
  const [destinations, setDestinations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/destinations');
      const data = await response.json();
      setDestinations(data);
    } catch (error) {
      console.error('Failed to fetch destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setShowForm(false);
    setEditingId(null);
    await fetchDestinations();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this destination?')) return;

    try {
      const response = await fetch(`/api/destinations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDestinations(destinations.filter((d: any) => d._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete destination:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Destinations</h2>
        <button
          onClick={() => {
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="bg-[#2E4F4F] text-white px-6 py-2 rounded-lg hover:bg-[#1a2f2f] transition"
        >
          {showForm ? 'Cancel' : 'New Destination'}
        </button>
      </div>

      {showForm && (
        <DestinationForm
          destinationId={editingId}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingId(null);
          }}
        />
      )}

      {loading ? (
        <div className="text-center py-8">Loading destinations...</div>
      ) : (
        <DestinationList
          destinations={destinations}
          onEdit={(id) => {
            setEditingId(id);
            setShowForm(true);
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
