import { NextRequest, NextResponse } from 'next/server'
import { requireCmsAuth } from '@/lib/cms-auth'
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { createWriteStream, existsSync } from 'fs';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function downloadFile(url: string, destPath: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  const buf = await res.arrayBuffer();
  await fs.writeFile(destPath, Buffer.from(buf));
}

export async function POST(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  try {
    const { images, audioUrl, prompt, textOverlay } = await req.json()

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    const sessionId = uuidv4();
    const workDir = path.join(os.tmpdir(), `video-assembly-${sessionId}`);
    await fs.mkdir(workDir, { recursive: true });

    const imagePaths: string[] = [];

    console.log(`Working directory: ${workDir}`);

    // Download images
    for (let i = 0; i < images.length; i++) {
      const ext = path.extname(new URL(images[i].url || images[i]).pathname) || '.jpg';
      const dest = path.join(workDir, `img_${String(i).padStart(3, '0')}${ext}`);
      console.log(`Downloading ${images[i].url || images[i]} to ${dest}`);
      await downloadFile(images[i].url || images[i], dest);
      imagePaths.push(dest);
    }

    // Download audio if provided
    let localAudioPath = null;
    if (audioUrl) {
      const ext = path.extname(new URL(audioUrl).pathname) || '.mp3';
      localAudioPath = path.join(workDir, `audio${ext}`);
      console.log(`Downloading audio to ${localAudioPath}`);
      await downloadFile(audioUrl, localAudioPath);
    }

    const outputPath = path.join(workDir, 'output.mp4');

    // Create ffmpeg command
    await new Promise((resolve, reject) => {
      // Very basic slideshow: each image shows for 3 seconds, crossfade

      const fileListPath = path.join(workDir, 'files.txt');
      const fileListContent = imagePaths.map(p => `file '${p}'\nduration 3`).join('\n') + `\nfile '${imagePaths[imagePaths.length - 1]}'`;

      require('fs').writeFileSync(fileListPath, fileListContent);

      let command = ffmpeg()
        .input(fileListPath)
        .inputOptions(['-f concat', '-safe 0'])

      if (localAudioPath) {
        command = command.input(localAudioPath);
      }

      // Output options
      command = command
        .outputOptions([
          '-c:v libx264',
          '-pix_fmt yuv420p',
          '-r 30'
        ])
        .on('start', (cmd) => console.log('FFmpeg started:', cmd))
        .on('error', (err) => {
           console.error('FFmpeg Error:', err);
           reject(err);
        })
        .on('end', () => resolve(outputPath))
        .save(outputPath);
    });

    // Read generated video and upload to Supabase Storage
    const videoBuffer = await fs.readFile(outputPath);
    const filename = `generated-video-${sessionId}.mp4`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('media')
      .upload(`videos/${filename}`, videoBuffer, {
        contentType: 'video/mp4'
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabaseAdmin.storage.from('media').getPublicUrl(`videos/${filename}`);

    // Cleanup
    await fs.rm(workDir, { recursive: true, force: true }).catch(console.error);

    return NextResponse.json({ success: true, url: publicUrl })
  } catch (err: any) {
    console.error('Video assembly error:', err)
    return NextResponse.json({ error: err.message || 'Failed to assemble video' }, { status: 500 })
  }
}
