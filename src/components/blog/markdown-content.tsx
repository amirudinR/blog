import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import Markdown from "react-markdown";

import { CopyCodeButton } from "@/components/blog/copy-code-button";
import { ProtectedImage } from "@/components/blog/protected-image";
import type { Components } from "react-markdown";

type MarkdownContentProps = {
  markdown: string;
};

const components: Components = {
  a({ node: _node, href, children, ...props }) {
    const external = href?.startsWith("http") ?? false;
    return (
      <a
        href={href}
        {...props}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  },
  img({ node: _node, src, alt, ...props }) {
    return (
      <ProtectedImage
        src={typeof src === "string" ? src : undefined}
        alt={alt ?? ""}
        className="rounded-lg"
        {...props}
      />
    );
  },
  pre({ node: _node, children, ...props }) {
    return (
      <div data-code-block className="relative">
        <pre
          className="overflow-x-auto rounded-xl border bg-muted/50 p-4 text-sm"
          {...props}
        >
          {children}
        </pre>
        <CopyCodeButton />
      </div>
    );
  },
  table({ node: _node, children, ...props }) {
    return (
      <div className="overflow-x-auto">
        <table {...props}>{children}</table>
      </div>
    );
  },
};

export function MarkdownContent({ markdown }: MarkdownContentProps) {
  return (
    <div
      className="prose prose-neutral max-w-none dark:prose-invert
        prose-headings:font-heading prose-headings:tracking-tight
        prose-a:text-primary prose-a:decoration-primary/40 prose-a:underline-offset-[3px]
        prose-blockquote:border-primary/40 prose-blockquote:not-italic prose-blockquote:text-muted-foreground
        prose-p:text-[17px] prose-p:leading-relaxed prose-li:text-[17px] prose-li:leading-relaxed
        prose-code:before:hidden prose-code:after:hidden
        prose-img:rounded-xl"
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeHighlight]}
        components={components}
      >
        {markdown}
      </Markdown>
    </div>
  );
}
