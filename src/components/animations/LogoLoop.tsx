import { useEffect, useMemo, useRef, useState, memo, ReactNode } from "react";
import "./LogoLoop.css";

interface LogoItem {
  node?: ReactNode;
  src?: string;
  alt?: string;
  title?: string;
  href?: string;
}

interface Props {
  logos: LogoItem[];
  speed?: number;
  direction?: "left" | "right";
  width?: number | string;
  logoHeight?: number;
  gap?: number;
  pauseOnHover?: boolean;
  fadeOut?: boolean;
  fadeOutColor?: string;
  scaleOnHover?: boolean;
  ariaLabel?: string;
  className?: string;
}

export const LogoLoop = memo(({
  logos,
  speed = 60,
  direction = "left",
  width = "100%",
  logoHeight = 28,
  gap = 32,
  pauseOnHover = true,
  fadeOut = false,
  fadeOutColor,
  scaleOnHover = false,
  ariaLabel = "Items",
  className,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef<HTMLUListElement>(null);
  const [seqWidth, setSeqWidth] = useState(0);
  const [copyCount, setCopyCount] = useState(2);
  const [hovered, setHovered] = useState(false);
  const offsetRef = useRef(0);
  const rafRef = useRef<number>();
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      const cw = containerRef.current?.clientWidth ?? 0;
      const sw = seqRef.current?.getBoundingClientRect().width ?? 0;
      if (sw > 0) {
        setSeqWidth(Math.ceil(sw));
        setCopyCount(Math.max(2, Math.ceil(cw / sw) + 2));
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    if (seqRef.current) ro.observe(seqRef.current as unknown as Element);
    return () => ro.disconnect();
  }, [logos, gap, logoHeight]);

  useEffect(() => {
    const dir = direction === "left" ? 1 : -1;
    const animate = (ts: number) => {
      if (lastRef.current === null) lastRef.current = ts;
      const dt = (ts - lastRef.current) / 1000;
      lastRef.current = ts;
      if (!(hovered && pauseOnHover) && seqWidth > 0) {
        offsetRef.current = (offsetRef.current + speed * dir * dt + seqWidth) % seqWidth;
        if (trackRef.current) trackRef.current.style.transform = `translate3d(${-offsetRef.current}px,0,0)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); lastRef.current = null; };
  }, [speed, direction, seqWidth, hovered, pauseOnHover]);

  const cssVars = useMemo(() => ({
    "--logoloop-gap": `${gap}px`,
    "--logoloop-logoHeight": `${logoHeight}px`,
    ...(fadeOutColor && { "--logoloop-fadeColor": fadeOutColor }),
  }) as React.CSSProperties, [gap, logoHeight, fadeOutColor]);

  const renderItem = (item: LogoItem, key: string) => {
    const content = item.node ?? (item.src ? <img src={item.src} alt={item.alt || ""} /> : null);
    const wrapped = item.href ? (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className="logoloop__link">{content}</a>
    ) : (
      <span className="logoloop__node">{content}</span>
    );
    return <li key={key} className="logoloop__item" role="listitem">{wrapped}</li>;
  };

  const lists = Array.from({ length: copyCount }, (_, i) => (
    <ul
      key={i}
      className="logoloop__list"
      role="list"
      aria-hidden={i > 0}
      ref={i === 0 ? seqRef : undefined}
    >
      {logos.map((l, j) => renderItem(l, `${i}-${j}`))}
    </ul>
  ));

  return (
    <div
      ref={containerRef}
      className={`logoloop ${fadeOut ? "logoloop--fade" : ""} ${scaleOnHover ? "logoloop--scale-hover" : ""} ${className || ""}`}
      style={{ width: typeof width === "number" ? `${width}px` : width, ...cssVars }}
      aria-label={ariaLabel}
      role="region"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div ref={trackRef} className="logoloop__track">{lists}</div>
    </div>
  );
});

LogoLoop.displayName = "LogoLoop";
export default LogoLoop;
