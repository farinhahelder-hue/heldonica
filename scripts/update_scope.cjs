const fs = require('fs');
let content = fs.readFileSync('scripts/sync_google_photos.py', 'utf8');
content = content.replace("SCOPES = ['https://www.googleapis.com/auth/photoslibrary.readonly']", "SCOPES = ['https://www.googleapis.com/auth/photoslibrary']");
fs.writeFileSync('scripts/sync_google_photos.py', content, 'utf8');
