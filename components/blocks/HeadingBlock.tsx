import React from 'react';
import type { HeadingBlock as HeadingBlockType } from '@/types/cms-blocks';

interface Props {
  block: HeadingBlockType;
  className?: string;
}

export function HeadingBlock({ block, className = '' }: Props) {
  const { level, text, subtitle } = block;

  const baseHeadingStyles = "font-serif text-charcoal tracking-tight font-medium";

  const renderHeading = () => {
    switch (level) {
      case 1:
        return (
          <h1 className={`text-3xl md:text-5xl lg:text-6xl mb-3 ${baseHeadingStyles}`}>
            {text}
          </h1>
        );
      case 2:
        return (
          <div className="relative my-8">
            <h2 className={`text-2xl md:text-3xl lg:text-4xl mb-2 ${baseHeadingStyles} border-b border-stone-100 pb-3 flex items-center gap-3`}>
              <span className="w-1.5 h-6 bg-terracotta/80 rounded-full inline-block" />
              <span>{text}</span>
            </h2>
          </div>
        );
      case 3:
        return (
          <h3 className={`text-xl md:text-2xl mt-6 mb-2 ${baseHeadingStyles} text-stone-800`}>
            {text}
          </h3>
        );
      case 4:
        return (
          <h4 className={`text-lg md:text-xl mt-4 mb-2 ${baseHeadingStyles} text-stone-700`}>
            {text}
          </h4>
        );
      default:
        return (
          <h2 className={`text-2xl md:text-3xl mb-2 ${baseHeadingStyles}`}>
            {text}
          </h2>
        );
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {renderHeading()}
      {subtitle && (
        <p className="text-base md:text-lg text-stone-500 italic mt-1 font-sans">
          {subtitle}
        </p>
      )}
    </div>
  );
}
