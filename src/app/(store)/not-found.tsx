import Link from "next/link";
import { getI18n } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">{t("notFound.title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("notFound.body")}</p>
      <Link
        href="/products"
        className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        {t("notFound.browse")}
      </Link>
    </div>
  );
}
