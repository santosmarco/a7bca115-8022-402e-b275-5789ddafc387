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

type BackoffOptions = {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
};

export async function exponentialBackoff<T>(
  fn: () => Promise<T>,
  options: BackoffOptions,
): Promise<T> {
  let attempt = 0;
  let delay = options.initialDelay;

  while (attempt < options.maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt === options.maxAttempts) throw error;

      // Calculate next delay with exponential backoff
      delay = Math.min(delay * 2, options.maxDelay);

      // Add some jitter
      const jitter = Math.random() * 200;
      await new Promise((resolve) => setTimeout(resolve, delay + jitter));
    }
  }

  throw new Error("Max attempts reached");
}
