"use client";

import * as React from "react";
import { PlayerSegment, usePlayer } from "~/components/player/provider";

export type SegmentsControllerProps = {
  segments: Array<PlayerSegment>;
};

export function SegmentsController({ segments }: SegmentsControllerProps) {
  const { setSegments } = usePlayer();

  React.useEffect(() => {
    setSegments(segments);
  }, [segments]);

  return null;
}
