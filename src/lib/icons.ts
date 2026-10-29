import {
  AudioLines,
  BookOpen,
  Boxes,
  Brush,
  CalendarCheck,
  Camera,
  Clapperboard,
  Code2,
  Database,
  Feather,
  FileText,
  GraduationCap,
  LayoutTemplate,
  Mic,
  Music,
  Package,
  Palette,
  PenTool,
  Rocket,
  Shapes,
  Sparkles,
  Terminal,
  Timer,
  Type,
  Wand2,
  Workflow,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import { createElement } from "react";

// Icons the admin can pick for products and categories. Stored by name in the database.
export const iconMap: Record<string, LucideIcon> = {
  AudioLines,
  BookOpen,
  Boxes,
  Brush,
  CalendarCheck,
  Camera,
  Clapperboard,
  Code2,
  Database,
  Feather,
  FileText,
  GraduationCap,
  LayoutTemplate,
  Mic,
  Music,
  Package,
  Palette,
  PenTool,
  Rocket,
  Shapes,
  Sparkles,
  Terminal,
  Timer,
  Type,
  Wand2,
  Workflow,
};

export const iconNames = Object.keys(iconMap);

export const getIcon = (name: string | null | undefined): LucideIcon =>
  (name && iconMap[name]) || Package;

// Renders an icon by stored name; use instead of assigning getIcon() to a variable during render.
export function DynamicIcon({ icon, ...props }: { icon: string | null | undefined } & LucideProps) {
  return createElement(getIcon(icon), props);
}
