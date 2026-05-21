import { supabase } from './supabase-client'

const BUCKET = 'media'

// Vérifier que le bucket existe
async function ensureBucket() {
  if (!supabase) return false
  
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = buckets?.some(b => b.name === BUCKET)
  
  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: '50MB', // 50MB pour vidéos
    })
    if (error) {
      console.error('Bucket creation error:', error)
      return false
    }
  }
  return true
}

// Upload fichier vers Supabase Storage
export async function uploadToSupabaseStorage(
  file: File
): Promise<{ publicUrl: string; error?: string }> {
  if (!supabase) {
    return { publicUrl: '', error: 'Supabase non configuré' }
  }

  try {
    // Vérifier/créer bucket
    const bucketReady = await ensureBucket()
    if (!bucketReady) {
      return { publicUrl: '', error: 'Bucket non disponible' }
    }

    // Nom de fichier unique
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const path = `uploads/${timestamp}-${safeName}`

    // Upload
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return { publicUrl: '', error: error.message }
    }

    // Obtenir URL publique
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
    
    return { publicUrl: urlData.publicUrl }
  } catch (err: any) {
    console.error('Upload exception:', err)
    return { publicUrl: '', error: err.message }
  }
}

// Supprimer fichier
export async function deleteFromSupabaseStorage(path: string) {
  if (!supabase) return { error: 'Non configuré' }
  
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  return { error }
}

// Lister fichiers
export async function listSupabaseMedia(prefix = 'uploads/') {
  if (!supabase) return []
  
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix)
  if (error) {
    console.error('List error:', error)
    return []
  }
  
  return (data || []).map(obj => ({
    name: obj.name,
    path: prefix + obj.name,
    size: obj.metadata?.size || 0,
    updatedAt: obj.updated_at,
  }))
}