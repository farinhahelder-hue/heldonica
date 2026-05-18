const articles = Array.from({ length: 1000 }).map((_, i) => ({
  title: `Title ${i} with some extra words and another word`,
  excerpt: `Excerpt for ${i} with some extra words and another word`,
  content: `Content for ${i} with some extra words and another word, plus much more text here to simulate real content`,
}));
const query = 'some extra words';

function before() {
  let totalScore = 0;
  for (const article of articles) {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/);
    let score = 0;
    for (const word of queryWords) {
      if (article.title?.toLowerCase().includes(word)) score += 10;
      if (article.excerpt?.toLowerCase().includes(word)) score += 5;
      if (article.content?.toLowerCase().includes(word)) score += 1;
    }
    totalScore += score;
  }
  return totalScore;
}

function after() {
  let totalScore = 0;
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);
  for (const article of articles) {
    const titleLower = article.title?.toLowerCase() || '';
    const excerptLower = article.excerpt?.toLowerCase() || '';
    const contentLower = article.content?.toLowerCase() || '';
    let score = 0;
    for (const word of queryWords) {
      if (titleLower.includes(word)) score += 10;
      if (excerptLower.includes(word)) score += 5;
      if (contentLower.includes(word)) score += 1;
    }
    totalScore += score;
  }
  return totalScore;
}

console.time('before');
for(let i=0; i<1000; i++) before();
console.timeEnd('before');

console.time('after');
for(let i=0; i<1000; i++) after();
console.timeEnd('after');
