import { Activity, Footprints, Apple, BookOpen, Coffee, Droplet, Dumbbell, Feather, Heart, Home, Moon, Sunrise, Sun, Zap } from "lucide-react";

export const ICON_OPTIONS = [
  "Activity", "Footprints", "Apple", "BookOpen", "Coffee", "Droplet", "Dumbbell", "Feather", "Heart", "Home", "Moon", "Sunrise", "Sun", "Zap"
];

export const ICON_COMPONENTS_MAP = {
  Activity, Footprints, Apple, BookOpen, Coffee, Droplet, Dumbbell, Feather, Heart, Home, Moon, Sunrise, Sun, Zap
};

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
