import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">Page not found</h1>
      <p className="mt-2 text-muted-foreground">This page doesn&apos;t exist or is no longer available.</p>
      <Link
        href="/products"
        className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        Browse the catalog
      </Link>
    </div>
  );
}
