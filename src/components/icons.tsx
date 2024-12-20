import { icons } from "lucide-react";

export function createLucideIcon(name: keyof typeof icons) {
  return icons[name];
}
