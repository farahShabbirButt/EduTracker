import { useEffect, useState } from 'react';

const DURATION_MS = 800;

// Counts up to a number when it first appears or changes
export default function useCountUp(target: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return undefined;
    }

    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / DURATION_MS);
      setValue(Math.round(target * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return value;
}
