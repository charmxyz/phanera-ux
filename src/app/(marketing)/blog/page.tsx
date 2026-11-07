import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { formatPostDate } from "./format";

export const metadata: Metadata = {
  title: "Blog: user research, personas and usability testing",
  description:
    "Practical guides on user research, user personas, AI personas, synthetic users and usability testing, from the team behind Phanera.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  const posts = getAllPosts();
  return (
    <div className="container-marketing py-16 sm:py-24">
      <div className="mx-auto max-w-[720px] text-center">
        <p className="mb-4 font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">Blog</p>
        <h1 className="text-3xl leading-[1.05] font-medium tracking-[-0.03em] text-balance sm:text-5xl">
          User research, without the guesswork
        </h1>
        <p className="mt-4 text-pretty text-muted-foreground sm:text-lg">
          Practical guides on personas, AI personas, usability testing and simulating real users.
        </p>
      </div>
      <ul className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-foreground/30"
            >
              <span className="font-mono text-xs text-muted-foreground">
                {formatPostDate(post.date)} · {post.readingTime} min read
              </span>
              <h2 className="mt-3 text-lg leading-snug font-medium tracking-tight text-balance">{post.title}</h2>
              <p className="mt-2 text-sm text-pretty text-muted-foreground">{post.description}</p>
              <span className="mt-auto pt-4 text-sm font-medium">Read article →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
