import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { AntAvatar } from "@/components/ants/pixel-ant";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <AntAvatar seed="404" size={64} />
      <h1 className="text-2xl font-semibold">Nothing to see here</h1>
      <p className="text-muted-foreground">This page doesn&apos;t exist, or you don&apos;t have access to it.</p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>Go home</Link>
    </main>
  );
}
