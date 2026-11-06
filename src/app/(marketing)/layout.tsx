import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    // Plain white, like the dashboard and shared reports.
    <div data-surface="white" className="flex flex-1 flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
