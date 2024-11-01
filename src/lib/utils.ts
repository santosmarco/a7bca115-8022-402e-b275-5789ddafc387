import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import type { Falsey } from "lodash";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isTruthy<T>(value: T): value is Exclude<T, Falsey> {
  return Boolean(value);
}
