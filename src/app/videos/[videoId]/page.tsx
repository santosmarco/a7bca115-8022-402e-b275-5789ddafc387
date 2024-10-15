import { VideoPlayer } from "~/components/player/video";
import { Card, CardContent } from "~/components/ui/card";
import { getVideo } from "~/lib/api-video/videos";

import { PlayerProvider } from "~/components/player/provider";
import { getActivities } from "~/lib/analyses/activities";
import { VideoDetails } from "./_components/video-details";
import { VideoTags } from "./_components/video-tags";

export type VideoPageParams = {
  videoId: string;
};

export type VideoPageProps = {
  params: VideoPageParams;
};

export default async function VideoPage({ params }: VideoPageProps) {
  const video = await getVideo(params.videoId);

  console.log(JSON.stringify(video.metadata, null, 2));

  console.log(getActivities(video.metadata));

  return (
    <PlayerProvider>
      <div className="container mx-auto space-y-8 p-4">
        <h1 className="mb-8 text-4xl font-bold">{video.title}</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card className="shadow-none">
              <CardContent className="p-0">
                <VideoPlayer videoId={video.videoId} />
              </CardContent>
            </Card>

            <VideoDetails {...video} />
          </div>

          <div className="space-y-4">
            {/* <Card>
            <CardHeader>
              <CardTitle>Key Moments</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {keyMoments.map((moment) => (
                    <div
                      key={moment.id}
                      className="rounded-lg bg-secondary p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-medium">{moment.title}</h3>
                        <Badge variant="outline" className="flex items-center">
                          <ClockIcon className="mr-1 h-3 w-3" />
                          {moment.timestamp}
                        </Badge>
                      </div>
                      <p className="mb-2 text-sm text-muted-foreground">
                        {moment.description}
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <PlayCircleIcon className="mr-2 h-4 w-4" />
                        Jump to Moment
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card> */}

            <VideoTags tags={video.tags} />
          </div>
        </div>
      </div>
    </PlayerProvider>
  );
}
