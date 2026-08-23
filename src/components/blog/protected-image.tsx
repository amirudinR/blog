"use client";

type ProtectedImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src?: string;
  alt?: string;
};

export function ProtectedImage({ src, alt, className, ...props }: ProtectedImageProps) {
  return (
    <img
      src={src}
      alt={alt ?? ""}
      loading="lazy"
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      className={className}
      {...props}
    />
  );
}
