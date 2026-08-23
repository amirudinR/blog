"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const prevPathname = useRef(pathname);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      setAnimate(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimate(true);
          window.scrollTo({ top: 0, behavior: "instant" });
        });
      });
    }
  }, [pathname]);

  return (
    <div
      ref={containerRef}
      className={animate ? "md3-page-animate" : undefined}
    >
      {children}
    </div>
  );
}
