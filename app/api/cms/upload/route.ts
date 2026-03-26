import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Créer le répertoire uploads s'il n'existe pas
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filepath = join(uploadsDir, filename);

    // Sauvegarder le fichier
    await writeFile(filepath, buffer);

    // Retourner l'URL publique
    const url = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: url,
      filename: filename,
    });
  } catch (error: any) {
    console.error('Erreur upload:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
