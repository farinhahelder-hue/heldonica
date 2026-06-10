import { POST } from './app/api/cms/fix-empty-images/route';

async function run() {
  const req = new Request('http://localhost:3000/api/cms/fix-empty-images', { method: 'POST' });
  const start = performance.now();
  const res = await POST(req);
  const end = performance.now();
  console.log(`Time: ${end - start}ms`);
  console.log(await res.json());
}
run();
