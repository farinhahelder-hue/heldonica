'use client';

import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';

type Props = {
  html: string;
  className?: string;
  style?: CSSProperties;
};

export default function EnhancedRichContent({ html, className, style }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [sanitizedHtml, setSanitizedHtml] = useState(html);

  // Sanitize HTML on mount and when html changes
  useEffect(() => {
    import('dompurify').then(({ default: DOMPurify }) => {
      setSanitizedHtml(DOMPurify.sanitize(html));
    });
  }, [html]);

  // Setup carousel interactions after sanitized HTML is rendered
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cleanups: Array<() => void> = [];
    const carousels = Array.from(
      root.querySelectorAll<HTMLElement>('[data-heldonica-carousel="true"]')
    );

    carousels.forEach((carousel) => {
      const slides = Array.from(
        carousel.querySelectorAll<HTMLElement>('[data-carousel-slide="true"]')
      );

      if (slides.length <= 1) {
        return;
      }

      const previousButton = carousel.querySelector<HTMLButtonElement>(
        '[data-carousel-prev="true"]'
      );
      const nextButton = carousel.querySelector<HTMLButtonElement>(
        '[data-carousel-next="true"]'
      );
      const dots = Array.from(
        carousel.querySelectorAll<HTMLButtonElement>('[data-carousel-dot]')
      );

      let activeIndex = slides.findIndex((slide) =>
        slide.classList.contains('is-active')
      );
      if (activeIndex < 0) {
        activeIndex = 0;
      }

      const render = () => {
        carousel.dataset.enhanced = 'true';
        carousel.tabIndex = 0;

        slides.forEach((slide, index) => {
          const isActive = index === activeIndex;
          slide.classList.toggle('is-active', isActive);
          slide.setAttribute('aria-hidden', String(!isActive));
        });

        dots.forEach((dot, index) => {
          const isActive = index === activeIndex;
          dot.classList.toggle('is-active', isActive);
          dot.setAttribute('aria-pressed', String(isActive));
        });
      };

      const moveTo = (nextIndex: number) => {
        activeIndex = (nextIndex + slides.length) % slides.length;
        render();
      };

      const onPrevious = (event: Event) => {
        event.preventDefault();
        moveTo(activeIndex - 1);
      };

      const onNext = (event: Event) => {
        event.preventDefault();
        moveTo(activeIndex + 1);
      };

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          moveTo(activeIndex - 1);
        }

        if (event.key === 'ArrowRight') {
          event.preventDefault();
          moveTo(activeIndex + 1);
        }
      };

      previousButton?.addEventListener('click', onPrevious);
      nextButton?.addEventListener('click', onNext);
      carousel.addEventListener('keydown', onKeyDown);

      dots.forEach((dot) => {
        const onDotClick = (event: Event) => {
          event.preventDefault();
          const index = Number(dot.dataset.carouselDot);
          if (!Number.isNaN(index)) {
            moveTo(index);
          }
        };

        dot.addEventListener('click', onDotClick);
        cleanups.push(() => dot.removeEventListener('click', onDotClick));
      });

      render();

      cleanups.push(() => previousButton?.removeEventListener('click', onPrevious));
      cleanups.push(() => nextButton?.removeEventListener('click', onNext));
      cleanups.push(() => carousel.removeEventListener('keydown', onKeyDown));
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [html]);

  return (
    <>
      <div
        ref={rootRef}
        className={className}
        style={style}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
      <style>{`
        /* ── CAROUSEL ── */
        .heldonica-carousel {
          margin: 2rem 0;
          border-radius: 1.4rem;
          overflow: hidden;
          border: 1px solid #ece3d8;
          background: #f6f1ea;
          box-shadow: 0 18px 45px rgba(55, 40, 25, 0.08);
        }

        .heldonica-carousel__viewport {
          position: relative;
          background: linear-gradient(135deg, #f4ede3 0%, #efe5d6 100%);
        }

        .heldonica-carousel__slide {
          margin: 0;
        }

        .heldonica-carousel__slide img {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 10;
          object-fit: cover;
          margin: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          background: #eadfce;
        }

        .heldonica-carousel:not([data-enhanced="true"]) .heldonica-carousel__controls {
          display: none;
        }

        .heldonica-carousel[data-enhanced="true"] .heldonica-carousel__slide {
          display: none;
        }

        .heldonica-carousel[data-enhanced="true"] .heldonica-carousel__slide.is-active {
          display: block;
        }

        .heldonica-carousel__controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.95rem 1rem;
          background: white;
          border-top: 1px solid #ece3d8;
        }

        .heldonica-carousel__button {
          width: 2.4rem;
          height: 2.4rem;
          border-radius: 999px;
          border: 1px solid #dbcdbd;
          background: #fffaf4;
          color: #6b2a1a;
          font-size: 1.35rem;
          line-height: 1;
          cursor: pointer;
          transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
        }

        .heldonica-carousel__button:hover {
          background: #f7ecdf;
          border-color: #caa785;
          transform: translateY(-1px);
        }

        .heldonica-carousel__dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          flex: 1;
        }

        .heldonica-carousel__dot {
          width: 0.72rem;
          height: 0.72rem;
          border-radius: 999px;
          border: none;
          background: #d8c7b4;
          cursor: pointer;
          transition: transform 0.18s ease, background 0.18s ease;
        }

        .heldonica-carousel__dot.is-active {
          background: #6b2a1a;
          transform: scale(1.15);
        }

        /* ── 1. PÉPITE DÉNICHÉE ── */
        .heldonica-pepite {
          margin: 2.5rem 0;
          padding: 1.8rem;
          background: #FAF9F6;
          border-left: 4px solid #7C9E8A;
          border-radius: 0 1.2rem 1.2rem 0;
          box-shadow: 0 4px 20px rgba(124, 158, 138, 0.05);
        }
        .heldonica-pepite__header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-weight: 700;
          color: #2E4F4F;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 0.85rem;
          margin-bottom: 0.8rem;
        }
        .heldonica-pepite__content {
          font-size: 0.95rem;
          color: #4A5568;
          line-height: 1.6;
        }

        /* ── 2. TESTÉ PAR HELDONICA ── */
        .heldonica-teste {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          margin: 1.5rem 0;
          padding: 0.75rem 1.25rem;
          background: #fbf7f0;
          border: 1px solid #eadbc8;
          border-radius: 999px;
          font-size: 0.88rem;
          color: #6b2a1a;
          font-weight: 600;
        }

        /* ── 3. VERDICT HELDONICA ── */
        .heldonica-verdict {
          margin: 3rem 0;
          background: #1C1917;
          color: #F5F5F4;
          border-radius: 1.4rem;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }
        .heldonica-verdict__header {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2.2rem;
          background: #272522;
          border-bottom: 1px solid #3F3C38;
          text-align: center;
        }
        @media (min-width: 640px) {
          .heldonica-verdict__header {
            flex-direction: row;
            justify-content: space-between;
            text-align: left;
          }
        }
        .heldonica-verdict__badge {
          font-size: 3.5rem;
          font-family: serif;
          font-weight: 300;
          color: #7C9E8A;
          line-height: 1;
          margin-bottom: 0.5rem;
        }
        @media (min-width: 640px) {
          .heldonica-verdict__badge {
            margin-bottom: 0;
          }
        }
        .heldonica-verdict__title {
          font-size: 1.4rem;
          font-family: serif;
          font-weight: 300;
          color: white;
        }
        .heldonica-verdict__columns {
          display: grid;
          grid-template-cols: 1fr;
          border-top: 1px solid #272522;
        }
        @media (min-width: 768px) {
          .heldonica-verdict__columns {
            grid-template-cols: 1fr 1fr;
          }
        }
        .heldonica-verdict__col {
          padding: 2rem;
        }
        .heldonica-verdict__col:first-child {
          border-bottom: 1px solid #272522;
        }
        @media (min-width: 768px) {
          .heldonica-verdict__col:first-child {
            border-bottom: none;
            border-right: 1px solid #272522;
          }
        }
        .heldonica-verdict__subtitle {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1.2rem;
        }
        .heldonica-verdict__subtitle--pro { color: #7C9E8A; }
        .heldonica-verdict__subtitle--con { color: #8B6355; }
        .heldonica-verdict__list {
          list-style: none !important;
          padding-left: 0 !important;
          margin: 0 !important;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .heldonica-verdict__list li {
          font-size: 0.9rem;
          color: #D6D3D1;
          display: flex;
          gap: 0.6rem;
          align-items: start;
        }

        /* ── 4. LA PROCHAINE ÉTAPE POUR TOI ── */
        .heldonica-etape {
          margin: 3.5rem 0;
          padding: 2.5rem;
          background: #FAF8F5;
          border: 1px solid #ECE7E1;
          border-radius: 1.4rem;
          text-align: center;
        }
        .heldonica-etape__title {
          font-family: serif;
          font-size: 1.6rem;
          font-weight: 300;
          color: #1C1917;
          margin-bottom: 0.8rem;
        }
        .heldonica-etape__text {
          font-size: 0.95rem;
          color: #6C6760;
          max-w-lg;
          margin: 0 auto 1.8rem auto;
          line-height: 1.6;
        }
        .heldonica-etape__cta {
          display: inline-block;
          padding: 0.9rem 2rem;
          background: #8B6355;
          color: white !important;
          font-weight: 600;
          text-decoration: none !important;
          border-radius: 999px;
          font-size: 0.9rem;
          transition: transform 0.18s ease, opacity 0.18s ease;
        }
        .heldonica-etape__cta:hover {
          transform: translateY(-1px);
          opacity: 0.95;
        }

        /* ── 5. FAQ ENRICHIE Accordion ── */
        .heldonica-faq {
          margin: 2.5rem 0;
        }
        .heldonica-faq details {
          background: #FAF9F6;
          border: 1px solid #ECE7E1;
          border-radius: 0.8rem;
          margin-bottom: 0.75rem;
          overflow: hidden;
          transition: border-color 0.18s ease;
        }
        .heldonica-faq details[open] {
          border-color: #caa785;
        }
        .heldonica-faq summary {
          padding: 1.1rem 1.4rem;
          font-weight: 600;
          color: #1C1917;
          cursor: pointer;
          outline: none;
          list-style: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .heldonica-faq summary::-webkit-details-marker {
          display: none;
        }
        .heldonica-faq summary::after {
          content: '→';
          font-size: 1.1rem;
          color: #8B6355;
          transition: transform 0.18s ease;
        }
        .heldonica-faq details[open] summary::after {
          transform: rotate(90deg);
        }
        .heldonica-faq__answer {
          padding: 0 1.4rem 1.4rem 1.4rem;
          font-size: 0.95rem;
          color: #6C6760;
          line-height: 1.6;
        }

        /* ── 6. ENCADRÉ CHIFFRES ET PREUVES ── */
        .heldonica-preuve {
          margin: 3rem 0;
          padding: 2.2rem;
          background: #FAF9F6;
          border: 1px solid #ECE7E1;
          border-radius: 1.4rem;
        }
        .heldonica-preuve__title {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #8B6355;
          text-align: center;
          margin-bottom: 1.8rem;
        }
        .heldonica-preuve__grid {
          display: grid;
          grid-template-cols: 1fr;
          gap: 2rem;
        }
        @media (min-width: 640px) {
          .heldonica-preuve__grid {
            grid-template-cols: repeat(3, 1fr);
          }
        }
        .heldonica-preuve__item {
          text-align: center;
        }
        .heldonica-preuve__val {
          font-family: serif;
          font-size: 2.6rem;
          color: #1C1917;
          font-weight: 300;
          line-height: 1.1;
          margin-bottom: 0.4rem;
        }
        .heldonica-preuve__lbl {
          font-size: 0.8rem;
          color: #6C6760;
        }

        @media (max-width: 640px) {
          .heldonica-carousel {
            border-radius: 1rem;
          }

          .heldonica-carousel__controls {
            padding: 0.75rem 0.85rem;
            gap: 0.75rem;
          }

          .heldonica-carousel__button {
            width: 2.1rem;
            height: 2.1rem;
            font-size: 1.15rem;
          }
        }
      `}</style>
    </>
  );
}
