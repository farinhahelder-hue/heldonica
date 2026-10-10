const fs = require('fs');
let imgContent = fs.readFileSync('__tests__/api/processImage.test.ts', 'utf8');

imgContent = imgContent.replace("import { POST } from '../../app/api/uploads/image/route'", `import { POST } from '../../app/api/uploads/image/route'

vi.mock('@/lib/cms-auth', () => ({
  requireCmsAuth: vi.fn().mockResolvedValue(null)
}))
`);
fs.writeFileSync('__tests__/api/processImage.test.ts', imgContent, 'utf8');
console.log('Fixed test auth mock.');
