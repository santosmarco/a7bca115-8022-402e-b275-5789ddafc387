import { VideoPlayer } from "~/components/video-player";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="container mx-auto py-8">
        <h1 className="mb-6 text-3xl font-bold">Fancy Video Player</h1>
        <VideoPlayer videoId="vi1ZzEvSRqDoJNrgLENckg53" />
      </main>
    </HydrateClient>
  );
}
