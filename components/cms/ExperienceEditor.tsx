'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ExperienceEditor({ data, onSave }: any) {
  const [selectedExp, setSelectedExp] = useState(data?.experiences?.[0]);
  const [editingExp, setEditingExp] = useState(selectedExp);

  const handleExpChange = (field: string, value: any) => {
    setEditingExp({
      ...editingExp,
      [field]: value,
    });
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    const updated = [...(editingExp?.[field] || [])];
    updated[index] = value;
    setEditingExp({
      ...editingExp,
      [field]: updated,
    });
  };

  const addArrayItem = (field: string) => {
    setEditingExp({
      ...editingExp,
      [field]: [...(editingExp?.[field] || []), ''],
    });
  };

  const removeArrayItem = (field: string, index: number) => {
    const updated = editingExp[field].filter((_: any, i: number) => i !== index);
    setEditingExp({
      ...editingExp,
      [field]: updated,
    });
  };

  const handleSave = () => {
    const updatedExperiences = data.experiences.map((e: any) =>
      e.id === editingExp.id ? editingExp : e
    );
    onSave({
      ...data,
      experiences: updatedExperiences,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-serif font-bold text-mahogany mb-6">💼 Gestion des Expériences (MARA)</h2>

      <div className="grid grid-cols-3 gap-6">
        {/* Sidebar - Liste des expériences */}
        <div className="col-span-1 border-r pr-6">
          <h3 className="font-bold text-mahogany mb-4">Expériences</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data?.experiences?.map((exp: any) => (
              <button
                key={exp.id}
                onClick={() => {
                  setSelectedExp(exp);
                  setEditingExp(exp);
                }}
                className={`w-full text-left p-3 rounded-lg transition text-sm ${
                  selectedExp?.id === exp.id
                    ? 'bg-eucalyptus text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {exp.title}
              </button>
            ))}
          </div>
          <Button
            onClick={() => {
              const newExp = {
                id: `exp-${Date.now()}`,
                title: 'Nouvelle expérience',
                period: '2024',
                mission: '',
                actions: [],
                results: [],
                contributions: [],
              };
              const updatedData = {
                ...data,
                experiences: [...data.experiences, newExp],
              };
              onSave(updatedData);
            }}
            className="w-full mt-4 bg-mahogany hover:bg-red-900"
          >
            + Nouvelle Expérience
          </Button>
        </div>

        {/* Main - Éditeur d'expérience */}
        <div className="col-span-2">
          {editingExp && (
            <div className="space-y-6">
              {/* Infos de base */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Titre</label>
                  <Input
                    value={editingExp.title}
                    onChange={(e) => handleExpChange('title', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Période</label>
                  <Input
                    value={editingExp.period}
                    onChange={(e) => handleExpChange('period', e.target.value)}
                    placeholder="2023 - 2024"
                  />
                </div>
              </div>

              {/* MARA Framework */}
              <div className="space-y-6">
                {/* Mission */}
                <div>
                  <h4 className="font-bold text-mahogany mb-2">🎯 Mission</h4>
                  <Textarea
                    value={editingExp.mission}
                    onChange={(e) => handleExpChange('mission', e.target.value)}
                    rows={3}
                    placeholder="Décrivez la mission..."
                  />
                </div>

                {/* Actions */}
                <div>
                  <h4 className="font-bold text-mahogany mb-2">✅ Actions</h4>
                  <div className="space-y-2">
                    {editingExp.actions?.map((action: string, index: number) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={action}
                          onChange={(e) =>
                            handleArrayChange('actions', index, e.target.value)
                          }
                          placeholder="Action..."
                        />
                        <Button
                          onClick={() => removeArrayItem('actions', index)}
                          variant="destructive"
                          size="sm"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => addArrayItem('actions')}
                    className="mt-2 bg-eucalyptus hover:bg-teal"
                    size="sm"
                  >
                    + Action
                  </Button>
                </div>

                {/* Résultats */}
                <div>
                  <h4 className="font-bold text-mahogany mb-2">📊 Résultats</h4>
                  <div className="space-y-2">
                    {editingExp.results?.map((result: string, index: number) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={result}
                          onChange={(e) =>
                            handleArrayChange('results', index, e.target.value)
                          }
                          placeholder="Résultat..."
                        />
                        <Button
                          onClick={() => removeArrayItem('results', index)}
                          variant="destructive"
                          size="sm"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => addArrayItem('results')}
                    className="mt-2 bg-eucalyptus hover:bg-teal"
                    size="sm"
                  >
                    + Résultat
                  </Button>
                </div>

                {/* Apports */}
                <div>
                  <h4 className="font-bold text-mahogany mb-2">💡 Apports</h4>
                  <div className="space-y-2">
                    {editingExp.contributions?.map((contrib: string, index: number) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={contrib}
                          onChange={(e) =>
                            handleArrayChange('contributions', index, e.target.value)
                          }
                          placeholder="Apport..."
                        />
                        <Button
                          onClick={() => removeArrayItem('contributions', index)}
                          variant="destructive"
                          size="sm"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => addArrayItem('contributions')}
                    className="mt-2 bg-eucalyptus hover:bg-teal"
                    size="sm"
                  >
                    + Apport
                  </Button>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-4">
                <Button onClick={handleSave} className="bg-mahogany hover:bg-red-900">
                  💾 Sauvegarder
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
