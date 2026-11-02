import { useMemo } from 'react';

import { useInView } from '@/components/ui/aurora-utils/use-in-view';
import { cn } from '@/lib/utils';

function mergeRefs(...refs) {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    }
  };
}

// Where each light starts, how much slower than `duration` it drifts, and
// how far into its drift it begins, so the three never move in step.
const LIGHTS = [
  { left: '-15%', top: '-30%', pace: 1, start: 0 },
  { left: '40%', top: '-15%', pace: 1.35, start: -0.3 },
  { left: '10%', top: '35%', pace: 1.7, start: -0.65 },
];

/**
 * Slow, soft light drifting behind its content. Three radial gradients
 * moved with transforms only: no blur filters, no canvas. The lights pause
 * while off screen and hold still with `prefers-reduced-motion`.
 *
 * @example
 * <Aurora className="rounded-xl border p-10" colors={["#38bdf8", "#a78bfa", "#f472b6"]}>
 *   <h2>…</h2>
 * </Aurora>
 */
function Aurora({
  colors = ['#38bdf8', '#a78bfa', '#f472b6'],
  duration = 20,
  intensity = 0.3,
  className,
  children,
  ref,
  ...props
}) {
  const [observe, inView] = useInView({ rootMargin: '200px' });
  const mergedRef = useMemo(() => mergeRefs(ref, observe), [ref, observe]);

  return (
    <div
      ref={mergedRef}
      data-slot="aurora"
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      <div
        aria-hidden="true"
        data-slot="aurora-lights"
        className="pointer-events-none absolute inset-0"
        style={{ zIndex: -1 }}
      >
        {LIGHTS.map((light, index) => (
          <span
            key={index}
            className="animate-aurora absolute size-[75%] rounded-full motion-reduce:animate-none"
            style={{
              left: light.left,
              top: light.top,
              background: `radial-gradient(closest-side, ${colors[index]}, transparent)`,
              opacity: intensity,
              animationDuration: `${duration * light.pace}s`,
              animationDelay: `${duration * light.start}s`,
              animationPlayState: inView ? 'running' : 'paused',
            }}
          />
        ))}
      </div>
      {children}
    </div>
  );
}

export default Aurora;

