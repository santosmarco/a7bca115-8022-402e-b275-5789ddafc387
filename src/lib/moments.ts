import { type Badge } from "~/components/ui/badge";
import { type VideoMoment } from "~/lib/schemas/video-moment";

export type MomentStyles = {
  activityTypeBadge?: React.ComponentProps<typeof Badge>;
};

export function getMomentStyles(moment: VideoMoment) {
  const styles: MomentStyles = {};

  if (moment.activity === "Emotion") {
    styles.activityTypeBadge = {
      color: getColorFromRanking(moment.activity_type),
    };
  }

  return styles;
}

function getColorFromRanking(ranking: string | null | undefined) {
  if (!ranking) {
    return "primary";
  }
  const [numerator, denominator] = ranking.split("/").map(Number);
  if (numerator === undefined || denominator === undefined) {
    return "primary";
  }
  const score = numerator / denominator;

  if (score >= 0.8) return "success";
  if (score >= 0.7) return "primary";
  if (score >= 0.6) return "warning";
  return "destructive";
}
