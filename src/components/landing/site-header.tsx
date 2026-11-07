import { Suspense } from "react";
import Link from "next/link";
import { getOptionalUser } from "@/lib/auth/session";
import { MenuIcon } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/#product", label: "Product" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
];

function GuestLinks() {
  return (
    <>
      <Link href="/login" className={buttonVariants({ variant: "ghost", className: "text-muted-foreground hover:text-foreground" })}>
        Log in
      </Link>
      <Link href="/#start" className={cn(buttonVariants(), "ml-2")}>Get Started</Link>
    </>
  );
}

async function AuthLinks() {
  const user = await getOptionalUser();
  if (!user) return <GuestLinks />;
  return <Link href="/dashboard" className={cn(buttonVariants(), "ml-2")}>Dashboard</Link>;
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container-marketing flex h-14 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={buttonVariants({ variant: "ghost", className: "text-muted-foreground hover:text-foreground" })}>
              {n.label}
            </Link>
          ))}
          <Suspense fallback={<GuestLinks />}>
            <AuthLinks />
          </Suspense>
        </nav>
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" />}>
            <MenuIcon />
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="grid gap-1 px-4" aria-label="Mobile">
              {[...NAV, { href: "/login", label: "Log in" }].map((n) => (
                <SheetClose key={n.href} render={<Link href={n.href} className={buttonVariants({ variant: "ghost", className: "justify-start" })} />}>
                  {n.label}
                </SheetClose>
              ))}
              <SheetClose render={<Link href="/#start" className={cn(buttonVariants(), "mt-2")} />}>Get Started</SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
