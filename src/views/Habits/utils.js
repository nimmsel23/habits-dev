import { Activity, Footprints, Apple, BookOpen, Coffee, Droplet, Dumbbell, Feather, Heart, Home, Moon, Sunrise, Sun, Zap } from "lucide-react";

export const ICON_OPTIONS = [
  "Activity", "Footprints", "Apple", "BookOpen", "Coffee", "Droplet", "Dumbbell", "Feather", "Heart", "Home", "Moon", "Sunrise", "Sun", "Zap"
];

export const ICON_COMPONENTS_MAP = {
  Activity, Footprints, Apple, BookOpen, Coffee, Droplet, Dumbbell, Feather, Heart, Home, Moon, Sunrise, Sun, Zap
};

// Feste Core4-Kategorien statt frei anlegbarer Kategorien — deckt sich mit
// den Domänen aus Core4Layout.jsx (dort bislang nur per Keyword-Heuristik
// aus dem Namen geraten, hier explizit am Habit gespeichert).
export const CATEGORY_OPTIONS = [
  { key: "body", label: "Body" },
  { key: "being", label: "Being" },
  { key: "balance", label: "Balance" },
  { key: "business", label: "Business" },
];

export const CATEGORY_LABEL_MAP = Object.fromEntries(
  CATEGORY_OPTIONS.map((c) => [c.key, c.label])
);

export function getRollingDays(count) {
  const dates = [];
  const today = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export const DAY_LABELS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
