"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      ticking = false;
    };

    // Un listener `scroll` qui met à jour l'état à chaque événement force un
    // rendu pendant le défilement. On diffère au cycle de rendu du navigateur :
    // au plus un appel par frame, et l'écoute est `passive` pour que le
    // défilement ne soit jamais bloqué.
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(toggleVisibility);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          aria-label="Retour en haut"
          className="fixed bottom-6 right-6 z-50 p-3 bg-eucalyptus text-white rounded-full shadow-xl border border-white/10 hover:bg-eucalyptus/90 hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-eucalyptus/50"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
