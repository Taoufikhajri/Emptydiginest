import {
  AudioLines,
  BookOpen,
  Boxes,
  Brush,
  Camera,
  CalendarCheck,
  Clapperboard,
  Code2,
  Database,
  FileText,
  Feather,
  GraduationCap,
  LayoutTemplate,
  Mic,
  Music,
  Palette,
  PenTool,
  Rocket,
  Shapes,
  Sparkles,
  Terminal,
  Type,
  Wand2,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type CategoryId = "design" | "developer" | "productivity" | "media" | "learning";

export type Category = {
  id: CategoryId;
  label: string;
};

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  icon: LucideIcon;
  iconColor: string;
  price: number;
  compareAt?: number;
  features?: string[];
  buyersThisMonth?: number;
};

export const categories: Category[] = [
  { id: "design", label: "Design & Creative" },
  { id: "developer", label: "Developer Tools" },
  { id: "productivity", label: "Productivity" },
  { id: "media", label: "Audio & Video" },
  { id: "learning", label: "Learning" },
];

// Placeholder catalog: fictional products to replace with your own.
export const products: Product[] = [
  {
    id: "brushwork-pro",
    name: "Brushwork Pro 12 months",
    category: "design",
    icon: Brush,
    iconColor: "#e8590c",
    price: 34.4,
    compareAt: 103.2,
    features: ["Instant activation", "All brush packs included"],
  },
  {
    id: "gridline-ui-kit",
    name: "Gridline UI Kit, team license",
    category: "design",
    icon: LayoutTemplate,
    iconColor: "#1c7ed6",
    price: 21.07,
    compareAt: 103.2,
  },
  {
    id: "promptsmith",
    name: "Promptsmith Studio 1 month",
    category: "developer",
    icon: Sparkles,
    iconColor: "#d9480f",
    price: 23.22,
    buyersThisMonth: 11,
  },
  {
    id: "shellwise",
    name: "Shellwise Terminal 12 months",
    category: "developer",
    icon: Terminal,
    iconColor: "#495057",
    price: 86,
  },
  {
    id: "inkpad-teams",
    name: "Inkpad Teams 1 year",
    category: "productivity",
    icon: FileText,
    iconColor: "#0b0b0c",
    price: 62.78,
    compareAt: 154.8,
  },
  {
    id: "flowloom",
    name: "Flowloom Automations 1 year",
    category: "developer",
    icon: Workflow,
    iconColor: "#e03131",
    price: 57.62,
    compareAt: 206.4,
  },
  {
    id: "tabletop-crm",
    name: "Tabletop CRM Starter 1 year",
    category: "productivity",
    icon: Boxes,
    iconColor: "#2f9e44",
    price: 52.46,
  },
  {
    id: "lyra-voice",
    name: "Lyra Voice Studio 3 months",
    category: "media",
    icon: Mic,
    iconColor: "#7048e8",
    price: 49.88,
  },
  {
    id: "launchpad-hosting",
    name: "Launchpad Hosting Pro 1 year",
    category: "developer",
    icon: Rocket,
    iconColor: "#1971c2",
    price: 57.62,
    compareAt: 206.4,
  },
  {
    id: "daybook",
    name: "Daybook Planner family plan",
    category: "productivity",
    icon: CalendarCheck,
    iconColor: "#f08c00",
    price: 41.28,
    compareAt: 86,
  },
  {
    id: "shapeshift",
    name: "Shapeshift 3D Starter 1 year",
    category: "design",
    icon: Shapes,
    iconColor: "#c2255c",
    price: 35.26,
  },
  {
    id: "canvasly",
    name: "Canvasly Site Builder 1 year",
    category: "design",
    icon: PenTool,
    iconColor: "#0b0b0c",
    price: 35.26,
    compareAt: 103.2,
  },
  {
    id: "querybox",
    name: "Querybox Database GUI 1 year",
    category: "developer",
    icon: Database,
    iconColor: "#5433eb",
    price: 28.38,
    compareAt: 154.8,
  },
  {
    id: "masterclass-bundle",
    name: "Maker Masterclass bundle, lifetime",
    category: "learning",
    icon: GraduationCap,
    iconColor: "#364fc7",
    price: 26.66,
    features: ["40+ hours of video lessons"],
  },
  {
    id: "codecraft-course",
    name: "Codecraft course, 12 months",
    category: "learning",
    icon: Code2,
    iconColor: "#0c8599",
    price: 86,
    features: ["Duration: 12 months", "Certificate of completion"],
  },
  {
    id: "wordsmith",
    name: "Wordsmith Writing Assistant 1 month",
    category: "productivity",
    icon: Feather,
    iconColor: "#2b8a3e",
    price: 20.64,
  },
  {
    id: "beatlab",
    name: "Beatlab Producer 3 months",
    category: "media",
    icon: Music,
    iconColor: "#e64980",
    price: 19.78,
  },
  {
    id: "colorway",
    name: "Colorway Palette Pack, 12 months",
    category: "design",
    icon: Palette,
    iconColor: "#f76707",
    price: 7.74,
  },
  {
    id: "typefoundry",
    name: "Typefoundry Font Library 1 year",
    category: "design",
    icon: Type,
    iconColor: "#1a1a1c",
    price: 8.6,
  },
  {
    id: "framecut",
    name: "Framecut Video Editor 1 year",
    category: "media",
    icon: Clapperboard,
    iconColor: "#1864ab",
    price: 8.6,
    compareAt: 248.54,
  },
  {
    id: "snapkit",
    name: "Snapkit Photo Presets, 1 month",
    category: "media",
    icon: Camera,
    iconColor: "#495057",
    price: 12.04,
    compareAt: 17.2,
  },
  {
    id: "podcraft",
    name: "Podcraft Audio Cleanup 1 month",
    category: "media",
    icon: AudioLines,
    iconColor: "#7950f2",
    price: 21.5,
  },
  {
    id: "readwise-notes",
    name: "Margin Notes Reader 3 months",
    category: "learning",
    icon: BookOpen,
    iconColor: "#d6336c",
    price: 6.88,
  },
  {
    id: "magicmask",
    name: "Magicmask Background Remover 1 year",
    category: "design",
    icon: Wand2,
    iconColor: "#0ca678",
    price: 4.3,
    compareAt: 60.2,
    features: ["Unlimited exports", "Batch processing"],
  },
  {
    id: "framecut-credits",
    name: "Framecut Cloud 650 credits",
    category: "media",
    icon: Clapperboard,
    iconColor: "#1098ad",
    price: 4.73,
    features: ["650 render credits", "Use on desktop and mobile"],
  },
  {
    id: "inkpad-3m",
    name: "Inkpad Personal 3 months",
    category: "productivity",
    icon: FileText,
    iconColor: "#0b0b0c",
    price: 2.58,
  },
  {
    id: "lesson-notes",
    name: "Lesson Planner templates",
    category: "learning",
    icon: BookOpen,
    iconColor: "#1c7ed6",
    price: 3.87,
  },
  {
    id: "beatlab-1m",
    name: "Beatlab Producer 1 month",
    category: "media",
    icon: Music,
    iconColor: "#e64980",
    price: 2.84,
    compareAt: 8.6,
    features: ["Full 30 days of Pro features", "Cancel any time"],
    buyersThisMonth: 15,
  },
];

export const formatPrice = (value: number) => `€${value.toFixed(2)}`;

export const discountPercent = (product: Product) =>
  product.compareAt ? Math.round((1 - product.price / product.compareAt) * 100) : 0;
