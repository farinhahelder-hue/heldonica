"use client";

import { useState } from "react";
import Link from "next/link";
import { useContentLoader } from "@/hooks/useContentLoader";
import type { CmsZone } from "@/lib/content-loader";
import { normalizeZoneText } from "@/lib/zone-text";
import { sanitizeHtml } from "@/lib/sanitize-html";

interface NewsletterFormProps {
  variant?: "blog" | "article" | "inline";
}

export default function NewsletterForm({ variant = "blog" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const { zones, settings } = useContentLoader();

  const zonesMap = zones as Record<string, CmsZone>;

  function cz(zoneKey: string, fallback: string): string {
    return zonesMap[zoneKey]?.value || settings?.[zoneKey] || fallback;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage(cz("newsletter_error_invalid", "Adresse email invalide."));
      return;
    }

    if (!consent) {
      setStatus("error");
      setMessage(cz("newsletter_error_generic", "Une erreur est survenue. Réessaie."));
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, source: `newsletter-${variant}` }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
        setMessage(cz("newsletter_success_title", "Bienvenue dans l'aventure !"));
        setEmail("");
        setConsent(false);
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'newsletter_signup', { variant });
        }
      } else {
        setStatus("error");
        setMessage(data.error || cz("newsletter_error_generic", "Une erreur est survenue. Réessaie."));
      }
    } catch {
      setStatus("error");
      setMessage(cz("newsletter_error_network", "Connexion impossible. Réessaie dans quelques instants."));
    }
  };

  const HoneypotField = () => (
    <input
      type="text"
      name="website"
      value={honeypot}
      onChange={(e) => setHoneypot(e.target.value)}
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
    />
  );

  const badge = cz("newsletter_badge", "Chaque semaine");
  const headingDefault = cz("newsletter_heading_default", "On t'envoie ce qu'on a vraiment trouvé.");
  const headingBlog = cz("newsletter_heading_blog", "Ce qu'on a vraiment trouvé,<br />directement dans ta boîte mail");
  const description = cz("newsletter_desc", "Une adresse, un timing, une erreur à éviter. Rien de plus.");
  const placeholder = cz("newsletter_placeholder", "ton@email.fr");
  const ctaLabel = cz("newsletter_cta", "Je m'abonne");
  const ctaLoading = cz("newsletter_cta_loading", "Inscription…");
  const disclaimer = cz("newsletter_disclaimer", "En t'inscrivant, tu acceptes de recevoir nos carnets de voyage. Désinscription possible à tout moment.");
  const successSubtext = cz("newsletter_success_subtext", "Vérifie ta boîte mail, on arrive doucement.");
  const rgpdLabel = cz("newsletter_rgpd_label", "J'accepte de recevoir les e-mails de slow travel d'Heldonica. Voir notre");
  const rgpdLinkLabel = cz("newsletter_rgpd_link", "politique de confidentialité");

  if (variant === "article") {
    return (
      <section className="my-14 rounded-sm bg-mahogany px-8 py-10 text-white">
        <p className="text-teal text-xs font-semibold tracking-[0.2em] uppercase mb-3">
          {badge}
        </p>
        <h3 className="text-xl md:text-2xl font-serif font-light mb-2 leading-snug">
          {headingDefault}
        </h3>
        <p className="text-white/60 text-sm mb-6">
          {description}
        </p>
        {status === "success" ? (
          <div>
            <p className="text-teal font-medium text-sm">{message}</p>
            <p className="text-white/60 text-xs mt-2">{successSubtext}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <form id="newsletter-form-article" onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md" style={{ position: 'relative' }}>
              <HoneypotField />
              <label htmlFor="newsletter-email-article" className="sr-only">{cz("newsletter_email_label", "Ton adresse email")}</label>
              <input
                id="newsletter-email-article"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                required
                disabled={status === "loading"}
                className="flex-1 px-4 py-3 rounded-full bg-[#FAF7F2]/15 backdrop-blur-sm border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-6 py-3 bg-eucalyptus/50 hover:bg-teal text-white text-sm font-semibold rounded-full transition-colors whitespace-nowrap disabled:opacity-60"
              >
                {status === "loading" ? ctaLoading : ctaLabel}
              </button>
            </form>
            <div className="flex items-start gap-2.5 max-w-md">
              <input
                id="newsletter-rgpd-article"
                form="newsletter-form-article"
                type="checkbox"
                name="consent"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-[#FAF7F2]/10 text-eucalyptus focus:ring-teal cursor-pointer"
              />
              <label htmlFor="newsletter-rgpd-article" className="text-xs text-white/60 leading-normal">
                {rgpdLabel}{' '}
                <Link href="/politique-confidentialite" className="text-teal hover:underline font-medium">
                  {rgpdLinkLabel}
                </Link>.
              </label>
            </div>
          </div>
        )}
        {status === "error" && <p className="mt-2 text-red-300 text-xs">{message}</p>}
        <p className="mt-4 text-white/35 text-xs">{disclaimer}</p>
      </section>
    );
  }

  if (variant === "inline") {
    return (
      <div className="flex flex-col gap-3">
        {status === "success" ? (
          <div className="bg-[#FAF7F2]/10 backdrop-blur-sm rounded-sm px-6 py-4">
            <p className="text-teal/80 font-medium">{message}</p>
            <p className="text-white/60 text-xs mt-1">{successSubtext}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <form id="newsletter-form-inline" onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center" style={{ position: 'relative' }}>
              <HoneypotField />
              <label htmlFor="newsletter-email-inline" className="sr-only">{cz("newsletter_email_label", "Ton adresse email")}</label>
              <input
                id="newsletter-email-inline"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                required
                disabled={status === "loading"}
                className="flex-1 min-w-0 px-5 py-3 rounded-full bg-[#FAF7F2]/15 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-teal disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="shrink-0 px-6 py-3 bg-eucalyptus/50 hover:bg-teal text-white text-sm font-semibold rounded-full transition-colors disabled:opacity-60"
              >
                {status === "loading" ? ctaLoading : ctaLabel}
              </button>
            </form>
            <div className="flex items-start gap-2.5">
              <input
                id="newsletter-rgpd-inline"
                form="newsletter-form-inline"
                type="checkbox"
                name="consent"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-[#FAF7F2]/10 text-eucalyptus focus:ring-teal cursor-pointer"
              />
              <label htmlFor="newsletter-rgpd-inline" className="text-xs text-white/60 leading-normal">
                {rgpdLabel}{' '}
                <Link href="/politique-confidentialite" className="text-teal hover:underline font-medium">
                  {rgpdLinkLabel}
                </Link>.
              </label>
            </div>
          </div>
        )}
        {status === "error" && <p className="text-red-300 text-xs mt-1">{message}</p>}
        <p className="text-white/35 text-xs">{disclaimer}</p>
      </div>
    );
  }

  return (
    <section className="bg-mahogany py-20 px-4">
      <div className="max-w-2xl mx-auto text-center text-white">
        <p className="text-teal text-xs font-semibold tracking-[0.2em] uppercase mb-4">
          {badge}
        </p>
        <h2 className="text-3xl md:text-4xl font-serif font-light mb-4 leading-snug"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(normalizeZoneText(headingBlog)) }}
        />
        <p className="text-white/65 text-sm leading-relaxed mb-8 max-w-md mx-auto">
          {description}
        </p>

        {status === "success" ? (
          <div className="bg-[#FAF7F2]/10 backdrop-blur-sm rounded-sm px-8 py-6">
            <p className="text-teal/80 font-medium text-lg">{message}</p>
            <p className="text-white/60 text-sm mt-2">{successSubtext}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <form id="newsletter-form-blog" onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto" style={{ position: 'relative' }}>
              <HoneypotField />
              <label htmlFor="newsletter-email-blog" className="sr-only">{cz("newsletter_email_label", "Ton adresse email")}</label>
              <input
                id="newsletter-email-blog"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                required
                disabled={status === "loading"}
                className="flex-1 px-5 py-3.5 rounded-full bg-[#FAF7F2]/15 backdrop-blur-sm border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-7 py-3.5 bg-eucalyptus/50 hover:bg-teal text-white text-sm font-semibold rounded-full transition-colors whitespace-nowrap disabled:opacity-60"
              >
                {status === "loading" ? ctaLoading : ctaLabel}
              </button>
            </form>
            <div className="flex items-start gap-2.5 max-w-md mx-auto text-left">
              <input
                id="newsletter-rgpd-blog"
                form="newsletter-form-blog"
                type="checkbox"
                name="consent"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-[#FAF7F2]/10 text-eucalyptus focus:ring-teal cursor-pointer"
              />
              <label htmlFor="newsletter-rgpd-blog" className="text-xs text-white/60 leading-normal">
                {rgpdLabel}{' '}
                <Link href="/politique-confidentialite" className="text-teal hover:underline font-medium">
                  {rgpdLinkLabel}
                </Link>.
              </label>
            </div>
          </div>
        )}
        {status === "error" && <p className="mt-3 text-red-300 text-sm">{message}</p>}

        <p className="mt-4 text-white/35 text-xs">{disclaimer}</p>
      </div>
    </section>
  );
}
