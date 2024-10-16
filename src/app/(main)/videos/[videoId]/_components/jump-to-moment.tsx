"use client";

import { usePlayer } from "~/components/player/provider";
import { Button } from "~/components/ui/button";

export function JumpToMomentButton({ timestamp }: { timestamp: number }) {
  const { seek } = usePlayer();

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full hover:bg-primary hover:text-primary-foreground"
      onClick={() => seek(timestamp)}
    >
      Jump to Moment
    </Button>
  );
}
