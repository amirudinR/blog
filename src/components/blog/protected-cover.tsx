"use client";

import Image, { type ImageProps } from "next/image";

type ProtectedCoverProps = Omit<ImageProps, "draggable" | "onContextMenu">;

export function ProtectedCover(props: ProtectedCoverProps) {
  return (
    <Image
      {...props}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}
