import type { Video } from "~/lib/schemas/video";

export type VideoHeaderProps = {
  video: Video;
};

export function VideoHeader({ video }: VideoHeaderProps) {
  return (
    <div className="absolute left-0 right-0 top-0 bg-black p-4 text-white">
      <h1 className="mb-2 text-lg font-bold">{video.title}</h1>
    </div>
  );
}
