'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function PageEditor({ data, onSave }: any) {
  const [selectedPage, setSelectedPage] = useState(data?.pages?.[0]);
  const [editingPage, setEditingPage] = useState(selectedPage);

  const handlePageChange = (field: string, value: any) => {
    setEditingPage({
      ...editingPage,
      [field]: value,
    });
  };

  const handleSectionChange = (sectionIndex: number, field: string, value: any) => {
    const updatedSections = [...(editingPage?.sections || [])];
    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      [field]: value,
    };
    setEditingPage({
      ...editingPage,
      sections: updatedSections,
    });
  };

  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      type: 'text',
      title: 'Nouvelle section',
      content: '',
    };
    setEditingPage({
      ...editingPage,
      sections: [...(editingPage?.sections || []), newSection],
    });
  };

  const removeSection = (index: number) => {
    const updatedSections = editingPage.sections.filter((_: any, i: number) => i !== index);
    setEditingPage({
      ...editingPage,
      sections: updatedSections,
    });
  };

  const handleSave = () => {
    const updatedPages = data.pages.map((p: any) =>
      p.id === editingPage.id ? editingPage : p
    );
    onSave({
      ...data,
      pages: updatedPages,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-serif font-bold text-mahogany mb-6">📄 Gestion des Pages</h2>

      <div className="grid grid-cols-3 gap-6">
        {/* Sidebar - Liste des pages */}
        <div className="col-span-1 border-r pr-6">
          <h3 className="font-bold text-mahogany mb-4">Pages</h3>
          <div className="space-y-2">
            {data?.pages?.map((page: any) => (
              <button
                key={page.id}
                onClick={() => {
                  setSelectedPage(page);
                  setEditingPage(page);
                }}
                className={`w-full text-left p-3 rounded-lg transition ${
                  selectedPage?.id === page.id
                    ? 'bg-eucalyptus text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {page.title}
              </button>
            ))}
          </div>
          <Button
            onClick={() => {
              const newPage = {
                id: `page-${Date.now()}`,
                title: 'Nouvelle page',
                slug: '/new-page',
                sections: [],
              };
              const updatedData = {
                ...data,
                pages: [...data.pages, newPage],
              };
              onSave(updatedData);
            }}
            className="w-full mt-4 bg-mahogany hover:bg-red-900"
          >
            + Nouvelle Page
          </Button>
        </div>

        {/* Main - Éditeur de page */}
        <div className="col-span-2">
          {editingPage && (
            <div className="space-y-6">
              {/* Infos de la page */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Titre</label>
                  <Input
                    value={editingPage.title}
                    onChange={(e) => handlePageChange('title', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">URL (slug)</label>
                  <Input
                    value={editingPage.slug}
                    onChange={(e) => handlePageChange('slug', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Sections */}
              <div>
                <h4 className="font-bold text-mahogany mb-4">Sections</h4>
                <div className="space-y-4">
                  {editingPage.sections?.map((section: any, index: number) => (
                    <div key={section.id} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="font-medium text-charcoal">{section.title}</h5>
                        <Button
                          onClick={() => removeSection(index)}
                          variant="destructive"
                          size="sm"
                        >
                          Supprimer
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-charcoal mb-1">
                            Type
                          </label>
                          <select
                            value={section.type}
                            onChange={(e) =>
                              handleSectionChange(index, 'type', e.target.value)
                            }
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="text">Texte</option>
                            <option value="hero">Héro</option>
                            <option value="gallery">Galerie</option>
                            <option value="video">Vidéo</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-charcoal mb-1">
                            Titre
                          </label>
                          <Input
                            value={section.title}
                            onChange={(e) =>
                              handleSectionChange(index, 'title', e.target.value)
                            }
                          />
                        </div>
                        {section.type === 'text' && (
                          <div>
                            <label className="block text-sm font-medium text-charcoal mb-1">
                              Contenu
                            </label>
                            <Textarea
                              value={section.content}
                              onChange={(e) =>
                                handleSectionChange(index, 'content', e.target.value)
                              }
                              rows={4}
                            />
                          </div>
                        )}
                        {(section.type === 'hero' || section.type === 'gallery') && (
                          <div>
                            <label className="block text-sm font-medium text-charcoal mb-1">
                              Image
                            </label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    handleSectionChange(
                                      index,
                                      'image',
                                      event.target?.result
                                    );
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={addSection} className="mt-4 bg-eucalyptus hover:bg-teal">
                  + Ajouter une Section
                </Button>
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
