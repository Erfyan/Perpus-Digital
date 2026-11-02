import { useCallback, useRef, useState } from 'react';

/**
 * Lightweight hook that reports whether the observed element is in the viewport.
 * Returns [refCallback, inView] — attach refCallback as a ref to the target element.
 *
 * @param {{ rootMargin?: string, threshold?: number }} options
 */
export function useInView(options = {}) {
  const { rootMargin = '0px', threshold = 0 } = options;
  const [inView, setInView] = useState(false);
  const observerRef = useRef(null);

  const observe = useCallback(
    (node) => {
      // Clean up previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!node) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          setInView(entry.isIntersecting);
        },
        { rootMargin, threshold }
      );

      observer.observe(node);
      observerRef.current = observer;
    },
    [rootMargin, threshold]
  );

  return [observe, inView];
}

