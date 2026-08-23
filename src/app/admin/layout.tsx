import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Roboto } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import { cn } from "@/lib/utils";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BlogKu Admin",
    template: "%s | BlogKu Admin",
  },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className={cn("md3", roboto.variable)}>{children}</div>
      <Toaster position="top-center" richColors />
    </>
  );
}
