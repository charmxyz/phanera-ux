import { Suspense } from "react";
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Logo } from "@/components/brand/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { requireSession } from "@/lib/dashboard/queries";
import { getUsageSummary } from "@/lib/usage/usage";

async function SidebarWithData() {
  const { user } = await requireSession();
  const usage = await getUsageSummary(user.id);
  return <AppSidebar email={user.email ?? ""} planLabel={usage.limits.label} used={usage.used} allowance={usage.allowance} period={usage.period} />;
}

function SidebarSkeleton() {
  return (
    <Sidebar>
      <SidebarHeader className="h-14 justify-center px-4"><Logo href="/dashboard" /></SidebarHeader>
      <SidebarContent className="gap-2 p-3">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-7" />)}</SidebarContent>
    </Sidebar>
  );
}

function PageSkeleton() {
  return (
    <div className="grid gap-6" aria-busy>
      <div className="grid gap-2 border-b border-border pb-6"><Skeleton className="h-7 w-48" /><Skeleton className="h-4 w-72" /></div>
      <div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <SidebarProvider data-surface="white">
      <Suspense fallback={<SidebarSkeleton />}>
        <SidebarWithData />
      </Suspense>
      <SidebarInset>
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
          <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
