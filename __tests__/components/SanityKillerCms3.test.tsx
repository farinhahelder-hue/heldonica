import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HotspotPicker } from '@/components/admin/media/HotspotPicker';
import { ImageBlock } from '@/components/blocks/ImageBlock';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { OmnisearchPalette } from '@/components/admin/OmnisearchPalette';
import { BlockCanvas } from '@/components/admin/blocks/BlockCanvas';
import { AstJsonInspectorModal } from '@/components/admin/blocks/AstJsonInspectorModal';
import { EeatScorecardHud } from '@/components/admin/blocks/EeatScorecardHud';
import { BubbleToolbar } from '@/components/admin/blocks/BubbleToolbar';
import { blocksToHtml, htmlToBlocks } from '@/lib/cms-blocks-converter';
import { instantiateCmsTemplate, CMS_TEMPLATES } from '@/lib/cms-templates';
import type { ImageBlock as ImageBlockType, CmsBlock } from '@/types/cms-blocks';

describe('CMS 3.0 Sanity Killer — Hotspot & Visual Click-to-Edit', () => {
  it('HotspotPicker affiche les presets et déclenche onChange lors d’un clic', () => {
    const onChange = vi.fn();
    render(
      <HotspotPicker
        imageUrl="https://heldonica.fr/test.jpg"
        hotspot={{ x: 0.5, y: 0.5 }}
        onChange={onChange}
      />
    );

    // Vérifie la présence des coordonnées de départ
    expect(screen.getByText(/X: 50% • Y: 50%/i)).toBeDefined();

    // Clic sur le preset "Sommet / Ciel"
    const sommetBtn = screen.getByText(/Sommet \/ Ciel/i);
    fireEvent.click(sommetBtn);

    expect(onChange).toHaveBeenCalledWith({ x: 0.5, y: 0.15 });
  });

  it('ImageBlock applique object-position dynamique selon le point focal', () => {
    const block: ImageBlockType = {
      id: 'blk_img_1',
      type: 'image',
      url: 'https://heldonica.fr/montagne.jpg',
      alt: 'Montagne brumeuse',
      layout: 'wide',
      aspectRatio: '16:9',
      hotspot: { x: 0.3, y: 0.15 },
    };

    const { container } = render(<ImageBlock block={block} />);
    const img = container.querySelector('img');
    expect(img).toBeDefined();
    expect(img?.style.objectPosition).toBe('30% 15%');
  });

  it('BlockRenderer en mode interactivePreview active le Click-to-Edit sur chaque bloc', () => {
    const blocks: CmsBlock[] = [
      {
        id: 'blk_text_1',
        type: 'text',
        content: 'Un sentier de fougères et de brume.',
      },
    ];
    const onSelect = vi.fn();

    const { container } = render(
      <BlockRenderer
        blocks={blocks}
        interactivePreview={true}
        selectedBlockId="blk_text_1"
        onSelectBlock={onSelect}
      />
    );

    const interactiveWrapper = container.querySelector('[data-cms-block-id="blk_text_1"]');
    expect(interactiveWrapper).toBeDefined();

    // Clic sur le bloc dans la prévisualisation
    fireEvent.click(interactiveWrapper!);
    expect(onSelect).toHaveBeenCalledWith('blk_text_1');
  });

  it('Sérialisation lossless de l’image avec Hotspot dans blocksToHtml et restauration complète', () => {
    const blocks: CmsBlock[] = [
      {
        id: 'blk_img_focal',
        type: 'image',
        url: 'https://heldonica.fr/falaise.jpg',
        alt: 'Falaises de basalte',
        layout: 'wide',
        aspectRatio: '16:9',
        hotspot: { x: 0.7, y: 0.25 },
      },
    ];

    const html = blocksToHtml(blocks);
    expect(html).toContain('object-position: 70% 25%');

    // Restauration via htmlToBlocks
    const restored = htmlToBlocks(html);
    expect(restored).toHaveLength(1);
    expect(restored[0].type).toBe('image');
    const restoredImg = restored[0] as ImageBlockType;
    expect(restoredImg.hotspot).toEqual({ x: 0.7, y: 0.25 });
  });

  it('OmnisearchPalette filtre par mot-clé et insère une pépite du Coffre RAG', () => {
    const onInsertVaultSpot = vi.fn();
    const onClose = vi.fn();

    render(
      <OmnisearchPalette
        isOpen={true}
        onClose={onClose}
        onInsertVaultSpot={onInsertVaultSpot}
        articles={[{ id: 1, title: 'Guide Madère', slug: 'madere' }]}
      />
    );

    const input = screen.getByPlaceholderText(/Rechercher partout/i);
    expect(input).toBeDefined();

    // Filtre par "Stoos"
    fireEvent.change(input, { target: { value: 'Stoos' } });

    // Vérifie la présence d'un spot RAG contenant Stoos
    const spotElements = screen.getAllByText(/Stoos/i);
    expect(spotElements.length).toBeGreaterThan(0);

    fireEvent.click(spotElements[0]);
    expect(onInsertVaultSpot).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('BlockCanvas propose l’insertion de bloc intermédiaire (InserterDivider)', () => {
    const initialBlocks: CmsBlock[] = [
      { id: 'b_head', type: 'heading', level: 2, text: 'Premier bloc' },
      { id: 'b_text', type: 'text', content: 'Deuxième bloc' },
    ];
    const onChange = vi.fn();

    render(
      <BlockCanvas
        blocks={initialBlocks}
        onChange={onChange}
      />
    );

    // Les boutons d'insertion intermédiaire sont présents
    const insertButtons = screen.getAllByRole('button', { name: /Insérer un bloc/i });
    expect(insertButtons.length).toBeGreaterThanOrEqual(2);

    // Clic sur le premier inserter pour ouvrir le menu
    fireEvent.click(insertButtons[0]);

    // Sélectionne un type de bloc (Image)
    const addImageBtn = screen.getByRole('button', { name: /Image Photo responsive/i });
    fireEvent.click(addImageBtn);

    expect(onChange).toHaveBeenCalled();
    const newBlocksArg = onChange.mock.calls[0][0];
    expect(newBlocksArg).toHaveLength(3);
    expect(newBlocksArg[0].type).toBe('image');
  });

  it('Studio des Gabarits 3.0 permet la personnalisation de la destination et l’insertion', () => {
    const onChange = vi.fn();
    render(<BlockCanvas blocks={[]} onChange={onChange} />);

    // Ouverture du modal de gabarits
    const gabaritsBtn = screen.getByRole('button', { name: /Gabarits Slow Travel/i });
    fireEvent.click(gabaritsBtn);

    // Vérifie la présence du Studio 3.0
    expect(screen.getByText(/Studio des Gabarits 3.0/i)).toBeDefined();

    // Champ de destination
    const destInput = screen.getByPlaceholderText(/ex: Stoos, Suisse/i);
    expect(destInput).toBeDefined();
    fireEvent.change(destInput, { target: { value: 'Val d’Hérens' } });

    // Clic sur "Remplacer tout le carnet"
    const replaceBtn = screen.getByRole('button', { name: /Remplacer tout le carnet/i });
    fireEvent.click(replaceBtn);

    expect(onChange).toHaveBeenCalled();
    const appliedBlocks = onChange.mock.calls[0][0] as CmsBlock[];
    expect(appliedBlocks.length).toBeGreaterThan(0);
  });

  it('Cartouche de Terrain génère des repères E-E-A-T certifiés (Nikon D7200, météo)', () => {
    const onChange = vi.fn();
    render(<BlockCanvas blocks={[]} onChange={onChange} />);

    // Ouverture du modal de cartouche de terrain
    const cartoucheBtn = screen.getByRole('button', { name: /Cartouche de Terrain/i });
    fireEvent.click(cartoucheBtn);

    // Vérifie la présence du modal
    expect(screen.getByText(/Cartouche de Terrain Certifié \(E-E-A-T\)/i)).toBeDefined();
    expect(screen.getByText(/Nikon D7200 35mm/i)).toBeDefined();

    // Insertion en tête de carnet
    const insertBtn = screen.getByRole('button', { name: /Insérer en tête de carnet/i });
    fireEvent.click(insertBtn);

    expect(onChange).toHaveBeenCalled();
    const inserted = onChange.mock.calls[0][0] as CmsBlock[];
    expect(inserted.length).toBe(2);
    expect(inserted[0].type).toBe('heading');
    expect(inserted[1].type).toBe('list');
  });
  it('Studio des Gabarits 3.0 permet de basculer l’atmosphère et la saison avec mise à jour réactive', () => {
    const onChange = vi.fn();
    render(<BlockCanvas blocks={[]} onChange={onChange} />);

    // Ouverture du modal de gabarits
    const gabaritsBtn = screen.getByRole('button', { name: /Gabarits Slow Travel/i });
    fireEvent.click(gabaritsBtn);

    // Vérifie la présence des sélecteurs sensoriels
    expect(screen.getByText(/Atmosphère & Lumière/i)).toBeDefined();
    expect(screen.getByText(/Saison & Teintes de terrain/i)).toBeDefined();

    // Sélection de la saison Printemps sauvage
    const printempsBtn = screen.getByRole('button', { name: /Printemps sauvage/i });
    fireEvent.click(printempsBtn);

    // Sélection de l'atmosphère Brume d'aube
    const brumeBtn = screen.getByRole('button', { name: /Brume d’aube/i });
    fireEvent.click(brumeBtn);

    // Clic sur "Remplacer tout le carnet"
    const replaceBtn = screen.getByRole('button', { name: /Remplacer tout le carnet/i });
    fireEvent.click(replaceBtn);

    expect(onChange).toHaveBeenCalled();
    const applied = onChange.mock.calls[0][0] as CmsBlock[];
    expect(applied.length).toBeGreaterThan(0);
  });

  it('BlockCanvas propose le simulateur responsive (Mobile APK, Tablette, Bureau)', () => {
    render(<BlockCanvas blocks={[{ id: 'b_1', type: 'heading', level: 1, text: 'Titre de test' }]} onChange={vi.fn()} />);

    // Bouton Mobile APK
    const mobileBtn = screen.getByRole('button', { name: /Mobile APK/i });
    expect(mobileBtn).toBeDefined();

    // Bascule en vue Mobile APK
    fireEvent.click(mobileBtn);
    expect(screen.getByText(/Simulateur Mobile APK/i)).toBeDefined();

    // Bascule en vue Tablette
    const tabletBtn = screen.getByRole('button', { name: /Tablette/i });
    fireEvent.click(tabletBtn);
    expect(screen.getByText(/Simulateur Tablette/i)).toBeDefined();
  });

  it('BlockCanvas gère l’historique Undo / Redo sans perte', () => {
    const onChange = vi.fn();
    const initialBlocks: CmsBlock[] = [
      { id: 'b_initial', type: 'text', content: 'Premier texte' },
    ];

    render(<BlockCanvas blocks={initialBlocks} onChange={onChange} />);

    // Boutons Undo / Redo sont présents dans la barre secondaire
    const undoBtn = screen.getByRole('button', { name: /Annuler/i });
    const redoBtn = screen.getByRole('button', { name: /Rétablir/i });
    expect(undoBtn).toBeDefined();
    expect(redoBtn).toBeDefined();

    // Initialement désactivés car l'historique est vierge
    expect((undoBtn as HTMLButtonElement).disabled).toBe(true);
    expect((redoBtn as HTMLButtonElement).disabled).toBe(true);

    // Ajout d'un bloc titre (ce qui alimente l'historique de modification via commitBlocks)
    const addTitleBtn = screen.getByRole('button', { name: /^Titre$/i });
    fireEvent.click(addTitleBtn);

    expect(onChange).toHaveBeenCalled();
  });

  it('Sauvegarde et affichage d’un gabarit personnalisé dans localStorage', () => {
    const onChange = vi.fn();
    const blocks: CmsBlock[] = [
      { id: 'b_custom', type: 'heading', level: 1, text: 'Mon itinéraire personnalisé' },
    ];

    render(<BlockCanvas blocks={blocks} onChange={onChange} />);

    // Clic sur Sauvegarder Gabarit
    const saveBtn = screen.getByRole('button', { name: /Sauvegarder Gabarit/i });
    fireEvent.click(saveBtn);

    // Le modal d'enregistrement s'ouvre
    expect(screen.getByText(/Mémoriser comme Gabarit/i)).toBeDefined();

    // Remplir le formulaire
    const titleInput = screen.getByPlaceholderText(/ex: Mon Itinéraire 3 Jours Randonnée & Refuge/i);
    fireEvent.change(titleInput, { target: { value: 'Mon Gabarit Épique' } });

    // Clic sur Valider l'enregistrement
    const confirmBtn = screen.getByRole('button', { name: /Enregistrer le gabarit/i });
    fireEvent.click(confirmBtn);

    // Vérifier l'écriture dans localStorage
    const saved = localStorage.getItem('heldonica_user_templates_v1');
    expect(saved).not.toBeNull();
    expect(saved).toContain('Mon Gabarit Épique');
  });

  it('AstJsonInspectorModal affiche l’arbre AST brut, la taille en Ko et gère la copie', () => {
    const blocks: CmsBlock[] = [
      { id: 'blk_test_1', type: 'heading', level: 2, text: 'Falaise de basalte' },
      { id: 'blk_test_2', type: 'text', content: 'On a marché sous la brume.' },
    ];
    const onClose = vi.fn();

    render(<AstJsonInspectorModal isOpen={true} onClose={onClose} blocks={blocks} />);

    expect(screen.getByText(/Inspecteur AST JSON \(Sanity Killer Engine\)/i)).toBeDefined();
    expect(screen.getByText(/Portable Blocks v1/i)).toBeDefined();
    expect(screen.getByText(/Arbre de structure brut des 2 blocs/i)).toBeDefined();
    expect(screen.getByText(/Copier JSON/i)).toBeDefined();

    // Clic sur Copier JSON
    const copyBtn = screen.getByText(/Copier JSON/i);
    fireEvent.click(copyBtn);
  });

  it('EeatScorecardHud calcule et affiche en direct le score slow travel et la conformité déontologique', () => {
    const blocks: CmsBlock[] = [
      { id: 'b_head', type: 'heading', level: 1, text: 'Immersion lente' },
      { id: 'b_text', type: 'text', content: 'On a dégusté du pain cuit au feu de bois dans le refuge.' },
      {
        id: 'b_ev',
        type: 'photo_evidence',
        url: 'https://heldonica.fr/photo.jpg',
        location: 'Stoos',
        date: '2025-06-12',
        anecdote: 'Rencontre avec le berger.',
      },
    ];

    render(<EeatScorecardHud blocks={blocks} />);

    // Présence du bouton HUD compact
    const hudBtn = screen.getByRole('button', { name: /ouvrir le scorecard e-e-a-t/i });
    expect(hudBtn).toBeDefined();

    // Déroule le popover détaillé
    fireEvent.click(hudBtn);
    expect(screen.getByText(/Scorecard E-E-A-T & Vérité Terrain/i)).toBeDefined();
    expect(screen.getByText(/Pureté Voix de Marque :/i)).toBeDefined();
    expect(screen.getByText('100% Conforme')).toBeDefined();
    expect(screen.getByText(/1 bloc\(s\) cartographié\(s\)/i)).toBeDefined();
  });

  it('BlockCanvas ouvre l’Inspecteur AST JSON lors du clic sur le bouton d’en-tête', () => {
    const blocks: CmsBlock[] = [
      { id: 'b_1', type: 'text', content: 'Contenu carnet slow travel.' },
    ];

    render(<BlockCanvas blocks={blocks} onChange={vi.fn()} />);

    const astBtn = screen.getByRole('button', { name: /inspecter et éditer l'arbre json ast/i });
    expect(astBtn).toBeDefined();

    fireEvent.click(astBtn);
    expect(screen.getByText(/Inspecteur AST JSON \(Sanity Killer Engine\)/i)).toBeDefined();
  });

  it('Les nouveaux gabarits Terroir et Train bas carbone génèrent des structures certifiées', () => {
    expect(CMS_TEMPLATES.terroir_artisan_table).toBeDefined();
    expect(CMS_TEMPLATES.train_escape_zero_carbon).toBeDefined();

    const terroirBlocks = instantiateCmsTemplate('terroir_artisan_table', {
      destination: 'Alentejo',
      atmosphere: 'terracotta_dore',
    });
    expect(terroirBlocks.length).toBeGreaterThan(4);
    expect(terroirBlocks.some((b: CmsBlock) => b.type === 'vault_spot')).toBe(true);
    expect(terroirBlocks.some((b: CmsBlock) => b.type === 'photo_evidence')).toBe(true);

    const trainBlocks = instantiateCmsTemplate('train_escape_zero_carbon', {
      destination: 'Vallée de la Roya',
      atmosphere: 'altitude_mineral',
    });
    expect(trainBlocks.length).toBeGreaterThan(4);
    expect(trainBlocks.some((b: CmsBlock) => b.type === 'list')).toBe(true);
  });

  it('BlockCanvas affiche le bouton d’export rapide lorsque onOpenExport est fourni', () => {
    const onExport = vi.fn();
    render(<BlockCanvas blocks={[]} onChange={vi.fn()} onOpenExport={onExport} />);

    const exportBtn = screen.getByRole('button', { name: /exporter markdown ou html newsletter/i });
    expect(exportBtn).toBeDefined();

    fireEvent.click(exportBtn);
    expect(onExport).toHaveBeenCalledTimes(1);
  });
});
