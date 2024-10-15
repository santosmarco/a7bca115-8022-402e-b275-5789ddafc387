import { PlayIcon } from "lucide-react";

import { Button } from "~/components/ui/button";

export type PlayButtonProps = {
  onClick: () => void;
};

export const PlayButton = ({ onClick }: PlayButtonProps) => {
  return (
    <Button size="icon" onClick={onClick}>
      <PlayIcon />
    </Button>
  );
};
