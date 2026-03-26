import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Sauvegarder dans le fichier public/cms-data.json
    const filePath = join(process.cwd(), 'public', 'cms-data.json');
    await writeFile(filePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ success: true, message: 'Données sauvegardées' });
  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
