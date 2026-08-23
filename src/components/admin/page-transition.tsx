"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      const el = containerRef.current;
      if (!el) return;

      el.classList.remove("md3-page-animate");
      void el.offsetWidth;
      el.classList.add("md3-page-animate");

      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname]);

  return (
    <div ref={containerRef} className="md3-page-animate">
      {children}
    </div>
  );
}
