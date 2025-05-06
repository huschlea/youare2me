import { useLayoutEffect, useRef, useState } from "react";

export function useAutoFont(min = 10, max = 46) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [size, setSize] = useState(max);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let s = max;
    while (s >= min) {
      el.style.fontSize = `${s}px`;
      if (el.scrollHeight <= el.parentElement!.clientHeight) break;
      s -= 2;
    }
    setSize(s);
  }, [min, max]);

  return { ref, size };
}
