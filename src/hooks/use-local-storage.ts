"use client";

import { useState } from "react";
import { type JsonValue } from "type-fest";
import { type z } from "zod";

export function useLocalStorage<T extends z.ZodType<JsonValue>>(
  key: string,
  schema: T,
): [z.output<T> | undefined, (value: z.input<T>) => void] {
  const [storedValue, setStoredValue] = useState<z.output<T> | undefined>(
    () => {
      if (typeof window === "undefined") return undefined;
      try {
        const item = window.localStorage.getItem(key);
        return item ? schema.parse(JSON.parse(item)) : undefined;
      } catch (error) {
        console.error(error);
        return undefined;
      }
    },
  );

  const setValue = (value: z.input<T>) => {
    try {
      setStoredValue(schema.parse(value));
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
