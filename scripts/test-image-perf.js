const sharp = require('sharp');
const fs = require('fs');

async function runTest() {
  // Create a dummy 5MB image buffer in memory
  // 3000x3000px raw RGB buffer is approx 27MB, enough to simulate a large file
  const width = 3000;
  const height = 3000;
  const channels = 3;
  const rawData = Buffer.alloc(width * height * channels, 128); // Gray image

  console.log('Generating dummy JPEG...');
  const dummyJpg = await sharp(rawData, {
    raw: { width, height, channels }
  }).jpeg().toBuffer();

  console.log(`Dummy image size: ${(dummyJpg.length / 1024 / 1024).toFixed(2)} MB`);

  console.log('Testing sharp processing time...');
  const start = performance.now();

  const processed = await sharp(dummyJpg)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const end = performance.now();
  const timeMs = Math.round(end - start);

  console.log(`Processed image size: ${(processed.length / 1024).toFixed(2)} KB`);
  console.log(`Processing time: ${timeMs}ms`);

  if (timeMs < 500) {
    console.log('✅ Performance test passed (< 500ms)');
    process.exit(0);
  } else {
    console.log('❌ Performance test failed (>= 500ms)');
    process.exit(1); // In a real CI, this might fail, but on local dev/sandbox it varies
  }
}

runTest().catch(console.error);
