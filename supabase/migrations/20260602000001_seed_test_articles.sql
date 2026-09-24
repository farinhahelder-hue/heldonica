-- Migration: Insert 3 test articles into cms_blog_posts
-- These are placeholder articles for testing the blog functionality
-- Date: 2026-06-02

BEGIN;

-- Insert test articles if they don't exist
INSERT INTO cms_blog_posts (slug, title, excerpt, content, category, tags, featured_image, author, published, published_at, updated_at)
VALUES (
  'test-article-1-madere-decouverte',
  'Madère : Découverte d''une île volcanique',
  'Sept jours sur une île où chaque valley cache encore quelque chose que tu n''as pas vu. Levadas, villages de pêcheurs et bananiers.',
  '<article class="prose-heldonica">
    <p class="lead">On avait réservé sept jours. On en a fait douze. Madère fait ça — elle te retient.</p>
    <p>Pas avec des attractions, pas avec des animations de bord de piscine. Avec quelque chose de plus discret et de plus fort : l''impression que chaque vallée cache encore quelque chose que tu n''as pas vu.</p>
    <h2>Les levadas hors des sentiers battus</h2>
    <p>La Levada do Caldeirão Verde est souvent citée. C''est méritée — mais elle est fréquentée. Notre pépite à nous : la Levada do Norte entre Ribeira Brava et Ponta do Sol.</p>
    <h2>Où manger : les tables qu''on garde pour soi</h2>
    <p>Funchal regorge de restaurants touristiques. La vraie cuisine madeirianne, on la trouve ailleurs.</p>
    <h2>✦ Verdict Heldonica</h2>
    <blockquote>
      <p>Madère est l''une des rares destinations en Europe où le slow travel n''est pas un choix — c''est une contrainte imposée par la géographie elle-même.</p>
    </blockquote>
  </article>',
  'Carnets Voyage',
  ARRAY['madère','slow travel','portugal','levadas']::text[],
  'https://images.unsplash.com/photo-1555117343-8b28e6f14895?w=1200&q=85',
  'Heldonica',
  true,
  '2026-05-20 09:00:00+00',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cms_blog_posts (slug, title, excerpt, content, category, tags, featured_image, author, published, published_at, updated_at)
VALUES (
  'test-article-2-zurich-flotte',
  'Flotter sur la Limmat à Zurich : Notre aventure d''été',
  'Une journée à Zurich où on a troqué les musées pour un flotteur pneumatique et la Limmat. Résultat : une des meilleures journées du voyage.',
  '<article class="prose-heldonica">
    <p class="lead">Zurich est une ville qu''on peut arpenter des heures. Mais un jour de juillet à 32°C, on avait juste envie de flotter.</p>
    <p>La Limmat traverse Zurich du nord au sud, large, calme, accessible. En été, des Zurichois prennent des flotteurs, des kayaks, des paddleboards. Le courant est faible, la traversée prend 20 minutes, et tu te retrouves face à la ville vue depuis l''eau.</p>
    <h2>Comment faire</h2>
    <p>Location de flotteurs à la base nautique de Wollishofen (près de la gare). Environ 15CHF/heure. Tu descends la rivière, tu longes le quartier de Niederdorf côté gauche, tu passes sous les ponts.</p>
    <h2>✦ Verdict Heldonica</h2>
    <blockquote>
      <p>Si tu veux voir Zurich autrement, prends un flotteur. C''est idiot, c''est rafraîchissant, et tu comprends la ville différemment quand tu la vois depuis le courant.</p>
    </blockquote>
  </article>',
  'Carnets Voyage',
  ARRAY['zurich','suisse','été','slow travel']::text[],
  'https://images.unsplash.com/photo-1554900984-7833a6976694?w=1200&q=85',
  'Heldonica',
  true,
  '2026-05-15 09:00:00+00',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cms_blog_posts (slug, title, excerpt, content, category, tags, featured_image, author, published, published_at, updated_at)
VALUES (
  'test-article-3-stoos-ridge',
  'Stoos Ridge : La crête panoramique',
  'Une crête à 1700m d''altitude au-dessus du canton de Schwyz. Vue à 360° sur les Alpes. Un des moments les plus marquants de notre année travel.',
  '<article class="prose-heldonica">
    <p class="lead">Le Stoos Ridge, c''est une crête de 3 km de long à 1700m d''altitude au-dessus du canton de Schwyz, en Suisse centrale. Les deux côtés tombent à pic dans des vallées.</p>
    <p>On a pris le funiculaire de Schwyz jusqu''à Stoos (la station de ski), puis le sentier vers le ridge. Les 500 derniers mètres avant la crête sont une accumulation de vires, de dalles lisses et de passages vertigineux.</p>
    <h2>Le panorama</h2>
    <p>Du sommet du Fronalpstock : vue sur le lac des Quatre-Cantons au nord, les Alpes bernoises à l''ouest, le Glärnerstock au sud. Par temps clair, on voit jusqu''au Lac de Constance. C''est l''un des panoramas les plus complets des Alpes suisses.</p>
    <h2>✦ Verdict Heldonica</h2>
    <blockquote>
      <p>Le Stoos Ridge est ce genre de rando qui te rappelle pourquoi tu voyages. La difficulté physique est moderate, mais l''impact émotionnel est maximal.</p>
    </blockquote>
  </article>',
  'Découvertes Locales',
  ARRAY['suisse','randonnée','stoos','alpes','panorama']::text[],
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=85',
  'Heldonica',
  true,
  '2026-05-10 09:00:00+00',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

COMMIT;