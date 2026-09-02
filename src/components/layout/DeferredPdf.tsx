'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Mounts the PDF viewer only once it is about to be seen.
 *
 * An `<object>` in the initial markup makes the browser start fetching the file
 * and spinning up its PDF viewer immediately, which competes for the main
 * thread with the first paint. Measured on the resume route, that pushed the
 * largest contentful paint — a paragraph of text near the top — to 2.5s, almost
 * all of it render delay.
 *
 * `loading="lazy"` does not apply to `<object>`, so the deferral is explicit.
 * The download link above never depends on this, and a `<noscript>` copy keeps
 * the preview working with JavaScript disabled.
 */
export function DeferredPdf({
  src,
  title,
  fallback,
}: {
  src: string;
  title: string;
  fallback: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: '300px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-[70vh] min-h-[420px] w-full">
      {visible ? (
        <object
          data={src}
          type="application/pdf"
          className="h-full w-full rounded-xl border border-border bg-surface"
          aria-label={title}
        >
          {fallback}
        </object>
      ) : (
        <div
          className="flex h-full w-full items-center justify-center rounded-xl border border-border bg-surface"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
