import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { BrandMark } from "@/components/store/brand-mark";
import { requireAdmin } from "@/lib/auth";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: { default: "Admin", template: `%s | ${siteConfig.name} Admin` } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="border-b border-border bg-card lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0 lg:border-e lg:border-b-0">
        <div className="flex h-16 items-center gap-2.5 px-5">
          <BrandMark className="size-7" />
          <span className="font-semibold tracking-tight">{siteConfig.name}</span>
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">Admin</span>
        </div>
        <AdminNav />
        <div className="hidden px-5 pt-6 text-xs text-muted-foreground lg:block">
          <p className="truncate">Signed in as {admin.email}</p>
          <Link href="/" className="mt-2 inline-flex items-center gap-1 font-semibold text-foreground hover:text-primary">
            View store
            <ExternalLink className="size-3" />
          </Link>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
