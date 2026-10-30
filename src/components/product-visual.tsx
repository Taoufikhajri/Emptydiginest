import { DynamicIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

type ProductVisualProps = {
  imageUrl?: string | null;
  icon: string;
  iconColor: string;
  // Size of the fallback icon, e.g. "size-5".
  iconClassName?: string;
  className?: string;
};

// The product's uploaded image filling its box, or its icon when it has no image.
export function ProductVisual({ imageUrl, icon, iconColor, iconClassName, className }: ProductVisualProps) {
  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- served from the database, already sized by the admin
    return <img src={imageUrl} alt="" className={cn("size-full object-contain", className)} />;
  }
  return <DynamicIcon icon={icon} className={cn(iconClassName, className)} style={{ color: iconColor }} />;
}
