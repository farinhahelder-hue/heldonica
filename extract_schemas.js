const https = require('https');

https.get('https://www.heldonica.fr/destinations/madere', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const regex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
    let match;
    const schemas = [];
    while ((match = regex.exec(data)) !== null) {
      try {
        schemas.push(JSON.parse(match[1]));
      } catch (e) {
        console.error("Parse error", e.message);
      }
    }

    console.log(`Found ${schemas.length} schema(s).`);
    schemas.forEach((s, idx) => {
       console.log(`\nSchema ${idx + 1} type:`, s['@type']);
       console.log(JSON.stringify(s, null, 2));
    });
  });
}).on('error', (err) => {
  console.log('Error: ' + err.message);
});
