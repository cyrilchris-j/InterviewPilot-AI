import { useEffect, useRef, useState } from "react";

type TypewriterProps = {
  text: string;
  speed?: number;
  startDelay?: number;
  className?: string;
  onComplete?: () => void;
};

export function Typewriter({ text, speed = 12, startDelay = 250, className, onComplete }: TypewriterProps) {
  const [count, setCount] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    setCount(0);
    doneRef.current = false;
    if (!text) {
      onComplete?.();
      return;
    }
    const start = window.setTimeout(() => {
      let current = 0;
      const interval = window.setInterval(() => {
        current += 1;
        setCount(current);
        if (current >= text.length) {
          window.clearInterval(interval);
          if (!doneRef.current) {
            doneRef.current = true;
            onComplete?.();
          }
        }
      }, speed);
      return () => window.clearInterval(interval);
    }, startDelay);

    return () => window.clearTimeout(start);
  }, [text, speed, startDelay, onComplete]);

  const done = count >= text.length;

  return (
    <span className={className}>
      {text.slice(0, count)}
      <span className={done ? "opacity-0" : "inline-block h-[1.05em] w-[2px] translate-y-[2px] bg-primary animate-caret-blink"} />
    </span>
  );
}