function escapeHtmlAttr(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function normalizeCarouselUrls(urls: string[]) {
  return Array.from(
    new Set(
      urls
        .map((url) => url.trim())
        .filter(Boolean)
    )
  );
}

export function buildCarouselHtml(inputUrls: string[]) {
  const urls = normalizeCarouselUrls(inputUrls);

  if (urls.length < 2) {
    return '';
  }

  const slides = urls
    .map((url, index) => {
      const safeUrl = escapeHtmlAttr(url);
      return `
        <figure class="heldonica-carousel__slide${index === 0 ? ' is-active' : ''}" data-carousel-slide="true">
          <img src="${safeUrl}" alt="Photo ${index + 1} du carrousel" loading="lazy" />
        </figure>
      `;
    })
    .join('');

  const dots = urls
    .map(
      (_, index) => `
        <button
          type="button"
          class="heldonica-carousel__dot${index === 0 ? ' is-active' : ''}"
          data-carousel-dot="${index}"
          aria-label="Aller à l'image ${index + 1}"
        ></button>
      `
    )
    .join('');

  return `
    <div class="heldonica-carousel not-prose" data-heldonica-carousel="true" data-carousel-count="${urls.length}">
      <div class="heldonica-carousel__viewport">
        ${slides}
      </div>
      <div class="heldonica-carousel__controls">
        <button type="button" class="heldonica-carousel__button" data-carousel-prev="true" aria-label="Image précédente">‹</button>
        <div class="heldonica-carousel__dots">
          ${dots}
        </div>
        <button type="button" class="heldonica-carousel__button" data-carousel-next="true" aria-label="Image suivante">›</button>
      </div>
    </div>
    <p></p>
  `;
}

export function buildImageHtml(url: string) {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return '';
  }

  return `<img src="${escapeHtmlAttr(trimmedUrl)}" alt="" loading="lazy" />`;
}
