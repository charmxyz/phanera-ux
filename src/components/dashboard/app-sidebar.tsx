"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HistoryIcon, LayoutDashboardIcon, GlobeIcon, PlusIcon, SettingsIcon, LogOutIcon } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/brand/logo";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon, exact: true },
  { href: "/dashboard/new", label: "New Test", icon: PlusIcon },
  { href: "/dashboard/websites", label: "Websites", icon: GlobeIcon },
  { href: "/dashboard/tests", label: "Test History", icon: HistoryIcon },
  { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
];

export function AppSidebar({ email, planLabel, used, allowance, period }: { email: string; planLabel: string; used: number; allowance: number; period: "lifetime" | "month" }) {
  const pathname = usePathname();
  const remaining = Math.max(0, allowance - used);
  return (
    <Sidebar>
      <SidebarHeader className="h-14 justify-center px-4">
        <Logo href="/dashboard" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((n) => {
                const active = n.exact ? pathname === n.href : pathname === n.href || pathname.startsWith(`${n.href}/`);
                return (
                  <SidebarMenuItem key={n.href}>
                    <SidebarMenuButton isActive={active} render={<Link href={n.href} />}>
                      <n.icon />
                      <span>{n.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-3 p-3">
        <div className="grid gap-2 rounded-lg border border-sidebar-border p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">{planLabel} plan</span>
            <span className="text-muted-foreground">{remaining} of {allowance} left</span>
          </div>
          <Progress value={allowance ? (used / allowance) * 100 : 0} className="h-1" />
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">Test runs {period === "lifetime" ? "included" : "this month"}</p>
            {planLabel === "Free" && <Link href="/dashboard/settings#billing" className="text-xs font-medium hover:underline">Upgrade</Link>}
          </div>
        </div>
        <div className="flex items-center gap-2 px-1">
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground" title={email}>{email}</span>
          <form action="/auth/signout" method="post">
            <button type="submit" className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-foreground">
              <LogOutIcon className="size-3.5" /> Sign out
            </button>
          </form>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
