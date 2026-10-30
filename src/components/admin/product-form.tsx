"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { saveProduct } from "@/app/actions/admin";
import { ProductVisual } from "@/components/product-visual";
import { iconNames } from "@/lib/icons";
import { imageAccept } from "@/lib/images";
import { buttonClass, inputClass } from "./ui";

export type ProductFormValues = {
  id?: number;
  name: string;
  slug: string;
  description: string;
  categoryId: number | null;
  icon: string;
  iconColor: string;
  imageUrl: string | null;
  price: string;
  compareAt: string;
  features: string;
  buyersThisMonth: number;
  featured: boolean;
  active: boolean;
};

type ProductFormProps = { values: ProductFormValues; categories: { id: number; name: string }[]; currency: string };

export function ProductForm({ values, categories, currency }: ProductFormProps) {
  const [state, action, pending] = useActionState(saveProduct, undefined);
  const [icon, setIcon] = useState(values.icon);
  const [color, setColor] = useState(values.iconColor);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- object URL must be created and revoked together
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const shownImage = imageFile ? imagePreview : removeImage ? null : values.imageUrl;

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-[1fr_320px]">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <label className="block text-sm font-medium">
          Name
          <input name="name" required defaultValue={values.name} maxLength={160} className={inputClass} />
        </label>
        <label className="block text-sm font-medium">
          URL slug <span className="font-normal text-muted-foreground">(leave empty to generate from the name)</span>
          <input name="slug" defaultValue={values.slug} maxLength={80} className={inputClass} />
        </label>
        <label className="block text-sm font-medium">
          Description
          <textarea name="description" rows={5} defaultValue={values.description} maxLength={4000} className={`${inputClass} h-auto py-2`} />
        </label>
        <label className="block text-sm font-medium">
          Features <span className="font-normal text-muted-foreground">(one per line, up to 10)</span>
          <textarea name="features" rows={4} defaultValue={values.features} className={`${inputClass} h-auto py-2`} />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm font-medium">
            Price ({currency})
            <input name="price" required inputMode="decimal" defaultValue={values.price} placeholder="19.99" className={inputClass} />
          </label>
          <label className="block text-sm font-medium">
            Original price <span className="font-normal text-muted-foreground">(optional)</span>
            <input name="compareAt" inputMode="decimal" defaultValue={values.compareAt} placeholder="49.99" className={inputClass} />
          </label>
          <label className="block text-sm font-medium">
            Buyers this month
            <input name="buyersThisMonth" type="number" min={0} defaultValue={values.buyersThisMonth} className={inputClass} />
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <label className="block text-sm font-medium">
            Category
            <select name="categoryId" defaultValue={values.categoryId ?? 0} className={inputClass}>
              <option value={0}>No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-start gap-3">
            <span className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-secondary p-2">
              <ProductVisual imageUrl={shownImage} icon={icon} iconColor={color} iconClassName="size-8" />
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              <label className="block text-sm font-medium">
                Image <span className="font-normal text-muted-foreground">(PNG, JPG, WebP, GIF or SVG, up to 500 KB)</span>
                <input
                  name="image"
                  type="file"
                  accept={imageAccept}
                  onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                  className="mt-1.5 block w-full text-xs file:me-2 file:h-8 file:cursor-pointer file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:text-xs file:font-semibold"
                />
              </label>
              {values.imageUrl && !imageFile && (
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    name="removeImage"
                    checked={removeImage}
                    onChange={(event) => setRemoveImage(event.target.checked)}
                    className="size-4 accent-[var(--primary)]"
                  />
                  Remove image and show the icon
                </label>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Without an image, the icon below is shown.</p>
          <div className="flex items-end gap-3">
            <label className="block flex-1 text-sm font-medium">
              Icon
              <select name="icon" value={icon} onChange={(event) => setIcon(event.target.value)} className={inputClass}>
                {iconNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Color
              <input
                name="iconColor"
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                className="mt-1.5 block h-10 w-14 cursor-pointer rounded-lg border border-border bg-background p-1"
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" defaultChecked={values.active} className="size-4 accent-[var(--primary)]" />
            Visible in the store
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" defaultChecked={values.featured} className="size-4 accent-[var(--primary)]" />
            Featured on the home page
          </label>
        </div>
        {state?.error && (
          <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}
        <button type="submit" disabled={pending} className={`${buttonClass} w-full`}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {values.id ? "Save product" : "Create product"}
        </button>
      </div>
    </form>
  );
}
