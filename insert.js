const fs = require('fs');

const path = 'app/cms-admin/CmsAdminClient.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace("const BlogGenerator = dynamic(() => import('@/components/admin/BlogGenerator'), { ssr: false });",
"const BlogGenerator = dynamic(() => import('@/components/admin/BlogGenerator'), { ssr: false });\nconst VideoMaker = dynamic(() => import('@/components/admin/video-maker/VideoMaker'), { ssr: false });");

const insertionPoint = "{tab === 'carousel' && (";
const insertionContent = `{tab === 'video' && (\n          <VideoMaker />\n        )}\n\n        {tab === 'carousel' && (`;

content = content.replace(insertionPoint, insertionContent);

fs.writeFileSync(path, content);
