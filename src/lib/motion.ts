'use client';

import { useEffect } from 'react';

/**
 * One observer for every section entrance on the page.
 *
 * Each section used to carry its own client component to run this, which meant
 * seven React client boundaries hydrating on a page whose only purpose for them
 * was a fade. This replaces all of them with a single mount that finds the
 * pending sections in the DOM and observes them, so the sections themselves
 * stay server-rendered markup.
 *
 * Sections are driven through their `data-animate` attribute rather than React
 * state: the entrance is a DOM side effect with no bearing on what React
 * renders, and it has to be expressed in the server markup — flipping it on
 * after mount would paint each section visible and then hide it, which is a
 * flash rather than an entrance.
 *
 * Content is never left invisible. Reduced-motion readers are revealed at once,
 * a CSS media query covers them even before this runs, and a `<noscript>` rule
 * in the layout covers readers with no JavaScript at all.
 *
 * A CSS scroll-driven animation (`animation-timeline: view()`) would remove
 * this JavaScript entirely, but it re-runs in reverse when the reader scrolls
 * back up. The brief asks for one entrance per section that never re-triggers,
 * so the observer stays.
 */
export function useRevealAll() {
  useEffect(() => {
    const nodes = [...document.querySelectorAll<HTMLElement>('[data-animate="pending"]')];
    if (nodes.length === 0) return;

    const reveal = (node: HTMLElement) => {
      node.dataset.animate = 'in';
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target as HTMLElement);
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    );

    for (const node of nodes) {
      // Already on screen at mount: reveal without waiting for an intersection.
      if (node.getBoundingClientRect().top < window.innerHeight * 0.9) reveal(node);
      else observer.observe(node);
    }

    return () => observer.disconnect();
  }, []);
}
