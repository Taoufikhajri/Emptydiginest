// Placeholder catalog loaded into an empty database. Edit or delete from the admin dashboard.
export type SeedCategory = { slug: string; name: string; icon: string };

export type SeedProduct = {
  slug: string;
  name: string;
  category: string;
  icon: string;
  iconColor: string;
  price: number;
  compareAt?: number;
  features?: string[];
  buyersThisMonth?: number;
  featured?: boolean;
};

export const seedCategories: SeedCategory[] = [
  { slug: "design", name: "Design & Creative", icon: "Palette" },
  { slug: "developer", name: "Developer Tools", icon: "Code2" },
  { slug: "productivity", name: "Productivity", icon: "Timer" },
  { slug: "media", name: "Audio & Video", icon: "Clapperboard" },
  { slug: "learning", name: "Learning", icon: "GraduationCap" },
];

export const seedProducts: SeedProduct[] = [
  { slug: "brushwork-pro", name: "Brushwork Pro 12 months", category: "design", icon: "Brush", iconColor: "#e8590c", price: 34.4, compareAt: 103.2, features: ["Instant activation", "All brush packs included"], featured: true },
  { slug: "gridline-ui-kit", name: "Gridline UI Kit, team license", category: "design", icon: "LayoutTemplate", iconColor: "#1c7ed6", price: 21.07, compareAt: 103.2, featured: true },
  { slug: "promptsmith", name: "Promptsmith Studio 1 month", category: "developer", icon: "Sparkles", iconColor: "#d9480f", price: 23.22, buyersThisMonth: 11, featured: true },
  { slug: "shellwise", name: "Shellwise Terminal 12 months", category: "developer", icon: "Terminal", iconColor: "#495057", price: 86, featured: true },
  { slug: "inkpad-teams", name: "Inkpad Teams 1 year", category: "productivity", icon: "FileText", iconColor: "#0b0b0c", price: 62.78, compareAt: 154.8, featured: true },
  { slug: "flowloom", name: "Flowloom Automations 1 year", category: "developer", icon: "Workflow", iconColor: "#e03131", price: 57.62, compareAt: 206.4, featured: true },
  { slug: "tabletop-crm", name: "Tabletop CRM Starter 1 year", category: "productivity", icon: "Boxes", iconColor: "#2f9e44", price: 52.46, featured: true },
  { slug: "lyra-voice", name: "Lyra Voice Studio 3 months", category: "media", icon: "Mic", iconColor: "#7048e8", price: 49.88, featured: true },
  { slug: "launchpad-hosting", name: "Launchpad Hosting Pro 1 year", category: "developer", icon: "Rocket", iconColor: "#1971c2", price: 57.62, compareAt: 206.4 },
  { slug: "daybook", name: "Daybook Planner family plan", category: "productivity", icon: "CalendarCheck", iconColor: "#f08c00", price: 41.28, compareAt: 86 },
  { slug: "shapeshift", name: "Shapeshift 3D Starter 1 year", category: "design", icon: "Shapes", iconColor: "#c2255c", price: 35.26 },
  { slug: "canvasly", name: "Canvasly Site Builder 1 year", category: "design", icon: "PenTool", iconColor: "#0b0b0c", price: 35.26, compareAt: 103.2 },
  { slug: "querybox", name: "Querybox Database GUI 1 year", category: "developer", icon: "Database", iconColor: "#5433eb", price: 28.38, compareAt: 154.8 },
  { slug: "masterclass-bundle", name: "Maker Masterclass bundle, lifetime", category: "learning", icon: "GraduationCap", iconColor: "#364fc7", price: 26.66, features: ["40+ hours of video lessons"] },
  { slug: "codecraft-course", name: "Codecraft course, 12 months", category: "learning", icon: "Code2", iconColor: "#0c8599", price: 86, features: ["Duration: 12 months", "Certificate of completion"] },
  { slug: "wordsmith", name: "Wordsmith Writing Assistant 1 month", category: "productivity", icon: "Feather", iconColor: "#2b8a3e", price: 20.64 },
  { slug: "beatlab", name: "Beatlab Producer 3 months", category: "media", icon: "Music", iconColor: "#e64980", price: 19.78 },
  { slug: "colorway", name: "Colorway Palette Pack, 12 months", category: "design", icon: "Palette", iconColor: "#f76707", price: 7.74 },
  { slug: "typefoundry", name: "Typefoundry Font Library 1 year", category: "design", icon: "Type", iconColor: "#1a1a1c", price: 8.6 },
  { slug: "framecut", name: "Framecut Video Editor 1 year", category: "media", icon: "Clapperboard", iconColor: "#1864ab", price: 8.6, compareAt: 248.54 },
  { slug: "snapkit", name: "Snapkit Photo Presets, 1 month", category: "media", icon: "Camera", iconColor: "#495057", price: 12.04, compareAt: 17.2 },
  { slug: "podcraft", name: "Podcraft Audio Cleanup 1 month", category: "media", icon: "AudioLines", iconColor: "#7950f2", price: 21.5 },
  { slug: "margin-notes", name: "Margin Notes Reader 3 months", category: "learning", icon: "BookOpen", iconColor: "#d6336c", price: 6.88 },
  { slug: "magicmask", name: "Magicmask Background Remover 1 year", category: "design", icon: "Wand2", iconColor: "#0ca678", price: 4.3, compareAt: 60.2, features: ["Unlimited exports", "Batch processing"] },
  { slug: "framecut-credits", name: "Framecut Cloud 650 credits", category: "media", icon: "Clapperboard", iconColor: "#1098ad", price: 4.73, features: ["650 render credits", "Use on desktop and mobile"] },
  { slug: "inkpad-3m", name: "Inkpad Personal 3 months", category: "productivity", icon: "FileText", iconColor: "#0b0b0c", price: 2.58 },
  { slug: "lesson-planner", name: "Lesson Planner templates", category: "learning", icon: "BookOpen", iconColor: "#1c7ed6", price: 3.87 },
  { slug: "beatlab-1m", name: "Beatlab Producer 1 month", category: "media", icon: "Music", iconColor: "#e64980", price: 2.84, compareAt: 8.6, features: ["Full 30 days of Pro features", "Cancel any time"], buyersThisMonth: 15 },
];
