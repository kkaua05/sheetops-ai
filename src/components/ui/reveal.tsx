"use client";

/**
 * Reveal — fades and slides a section into view the first time it enters the
 * viewport. Pure CSS transition driven by a `data-revealed` attribute; the
 * IntersectionObserver only toggles that attribute, so the animation itself
 * stays on the GPU-friendly transform/opacity path and is skipped entirely
 * for prefers-reduced-motion (handled in globals.css).
 */

import * as React from "react";

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Extra delay before the element animates in, in milliseconds. */
  delay?: number;
  as?: "div" | "section";
}

export function Reveal({ children, delay = 0, style, as = "div", ...props }: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  // Progressive enhancement: if IntersectionObserver isn't available, default
  // to revealed rather than leaving the content permanently hidden.
  const [revealed, setRevealed] = React.useState(() => typeof IntersectionObserver === "undefined");

  React.useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Tag = as;
  return (
    <Tag
      ref={ref}
      data-reveal=""
      data-revealed={revealed}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      {...props}
    >
      {children}
    </Tag>
  );
}
