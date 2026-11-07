import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPost, getPostSlugs, SITE_URL } from "@/lib/blog";
import { buttonVariants } from "@/components/ui/button";
import { formatPostDate } from "../format";

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: { absolute: `${post.title} | Phanera` },
    description: post.description,
    keywords: post.keyword ? [post.keyword] : undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      siteName: "Phanera",
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  };
}

export default async function BlogPost({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const all = getAllPosts();
  const at = all.findIndex((p) => p.slug === post.slug);
  // The next three posts (wrapping), so every article links to a different set.
  const related = [1, 2, 3].map((n) => all[(at + n) % all.length]).filter((p) => p && p.slug !== post.slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    author: { "@type": "Organization", name: "Phanera", url: SITE_URL },
    publisher: { "@type": "Organization", name: "Phanera", url: SITE_URL, logo: `${SITE_URL}/brand/phanera-icon-512.png` },
    keywords: post.keyword,
  };

  return (
    <article className="py-16 sm:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="container-reading">
        <nav aria-label="Breadcrumb" className="mb-6 font-mono text-xs text-muted-foreground">
          <Link href="/blog" className="hover:text-foreground">Blog</Link>
        </nav>
        <h1 className="text-3xl leading-[1.08] font-medium tracking-[-0.03em] text-balance sm:text-[2.75rem]">{post.title}</h1>
        <p className="mt-4 text-pretty text-muted-foreground sm:text-lg">{post.description}</p>
        <p className="mt-6 font-mono text-xs text-muted-foreground">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time> · {post.readingTime} min read
        </p>
        {post.headings.length > 3 && (
          <nav aria-label="On this page" className="mt-10 rounded-2xl border border-border p-5">
            <p className="mb-3 text-sm font-medium">On this page</p>
            <ol className="grid gap-1.5 text-sm text-muted-foreground">
              {post.headings.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className="hover:text-foreground">{h.text}</a>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </header>

      <div className="container-reading">
        <div className="blog-prose mt-10" dangerouslySetInnerHTML={{ __html: post.html }} />

        <aside className="mt-16 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <p className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">Try it on your site</p>
          <h2 className="mt-3 text-xl font-medium tracking-tight text-balance sm:text-2xl">
            Watch AI personas use your website
          </h2>
          <p className="mt-2 text-pretty text-muted-foreground">
            Paste a URL, pick a task and Phanera&apos;s AI personas attempt it in real browsers. You get session replays and
            prioritised usability findings in minutes. Free for your first 5 tests, no card needed.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/#start" className={buttonVariants()}>Run a free test</Link>
            <Link href="/pricing" className={buttonVariants({ variant: "outline" })}>See pricing</Link>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="container-marketing mt-20" aria-labelledby="related">
          <h2 id="related" className="mx-auto max-w-5xl text-lg font-medium tracking-tight">Keep reading</h2>
          <ul className="mx-auto mt-4 grid max-w-5xl gap-4 sm:grid-cols-3">
            {related.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/30">
                  <span className="font-mono text-xs text-muted-foreground">{p.readingTime} min read</span>
                  <span className="mt-2 leading-snug font-medium text-balance">{p.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
