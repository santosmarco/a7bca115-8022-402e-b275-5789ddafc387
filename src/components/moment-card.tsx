import { motion } from "framer-motion";
import {
  ClockIcon,
  MessageCircle,
  Share2Icon,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { ExpandingText } from "~/components/expanding-text";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { toast } from "~/hooks/use-toast";
import { useValidatedForm } from "~/hooks/use-validated-form";
import { getMomentStyles } from "~/lib/moments";
import { type VideoMoment } from "~/lib/schemas/video-moment";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(500, "Comment is too long"),
});

export type MomentCardProps = {
  moment: VideoMoment;
  index?: number;
  onSkipToMoment?: (moment: VideoMoment) => void;
  jumpToLabel?: React.ReactNode;
  noShare?: boolean;
  className?: string;
};

export function MomentCard({
  moment,
  index,
  onSkipToMoment,
  jumpToLabel,
  noShare,
  className,
}: MomentCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const utils = api.useUtils();

  const form = useValidatedForm(commentSchema, {
    defaultValues: {
      content: "",
    },
  });

  const { data: user } = api.auth.getUser.useQuery();
  const { data: reactions } = api.moments.getReactions.useQuery({
    momentId: moment.id,
  });
  console.log(moment);
  const { data: comments } = api.moments.getComments.useQuery({
    momentId: moment.id,
  });

  const { mutate: addReaction } = api.moments.addReaction.useMutation({
    onMutate: async ({ type }) => {
      // Cancel outgoing refetches
      await utils.moments.getReactions.cancel({ momentId: moment.id });

      // Snapshot the previous value
      const previousReactions = utils.moments.getReactions.getData({
        momentId: moment.id,
      });

      // Optimistically update to the new value
      utils.moments.getReactions.setData({ momentId: moment.id }, (old) => {
        const filtered = old?.filter((r) => r.user_id !== user?.id) ?? [];
        return [
          ...filtered,
          {
            id: "temp-id",
            moment_id: moment.id,
            user_id: user?.id ?? "",
            reaction_type: type,
            created_at: new Date().toISOString(),
            user: user
              ? {
                  id: user.id,
                  nickname: user.nickname,
                  avatar_url: user.user_metadata.avatar_url,
                  is_admin: user.is_admin,
                }
              : null,
          },
        ];
      });

      return { previousReactions };
    },
    onError: (err, newReaction, context) => {
      // Revert back to previous state on error
      utils.moments.getReactions.setData(
        { momentId: moment.id },
        context?.previousReactions,
      );
      toast({
        title: "Error",
        description: "Failed to add reaction. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { mutate: addComment } = api.moments.addComment.useMutation({
    onMutate: async ({ content }) => {
      await utils.moments.getComments.cancel({ momentId: moment.id });

      const previousComments = utils.moments.getComments.getData({
        momentId: moment.id,
      });

      utils.moments.getComments.setData({ momentId: moment.id }, (old) => {
        return [
          ...(old ?? []),
          {
            id: "temp-id",
            moment_id: moment.id,
            user_id: user?.id ?? "",
            content,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user: user
              ? {
                  id: user.id,
                  nickname: user.nickname,
                  avatar_url: user.user_metadata.avatar_url,
                  is_admin: user.is_admin,
                }
              : null,
          },
        ];
      });

      return { previousComments };
    },
    onSuccess: () => {
      form.reset();
    },
    onError: (err, newComment, context) => {
      utils.moments.getComments.setData(
        { momentId: moment.id },
        context?.previousComments,
      );
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const styles = getMomentStyles(moment);

  const handleCopyUrl = () => {
    const url = `${window.location.origin}/embed/moments/${encodeURIComponent(moment.index)}`;
    void navigator.clipboard.writeText(url);
    toast({
      title: "URL Copied",
      description: "The moment URL has been copied to your clipboard.",
    });
    setIsOpen(false);
  };

  const handleCopyEmbed = () => {
    const embedCode = `<iframe src="${window.location.origin}/embed/moments/${encodeURIComponent(moment.index)}" width="100%" height="400" frameborder="0"></iframe>`;
    void navigator.clipboard.writeText(embedCode);
    toast({
      title: "Embed Code Copied",
      description: "The embed code has been copied to your clipboard.",
    });
    setIsOpen(false);
  };

  const handleReaction = (type: "thumbs_up" | "thumbs_down") => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to react to moments.",
        variant: "destructive",
      });
      return;
    }
    addReaction({ momentId: moment.id, type });
  };

  const onSubmitComment = (data: z.infer<typeof commentSchema>) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment.",
        variant: "destructive",
      });
      return;
    }
    addComment({ momentId: moment.id, content: data.content });
  };

  const thumbsUpCount =
    reactions?.filter((r) => r.reaction_type === "thumbs_up").length ?? 0;
  const thumbsDownCount =
    reactions?.filter((r) => r.reaction_type === "thumbs_down").length ?? 0;
  const userReaction = reactions?.find(
    (r) => r.user_id === user?.id,
  )?.reaction_type;

  return (
    <motion.div
      key={moment.index}
      className={cn(
        "flex flex-col rounded-md border border-border bg-accent p-4 shadow-md",
        className,
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
        delay: index ? index * 0.1 : 0,
      }}
    >
      <div className="mb-3 flex flex-col md:mb-2 md:flex-row md:items-center md:justify-between">
        <h2 className="font-bold">{moment.title}</h2>
        <div className="mt-0.5 flex items-center gap-x-2 text-muted-foreground md:mt-0">
          <span className="flex items-center gap-x-1.5 text-sm">
            <ClockIcon className="h-3.5 w-3.5" />
            {moment.segment_start_timestamp.replace(/\.\d+/, "")}
          </span>
          {!noShare && (
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="link"
                  size="icon"
                  className="ml-1.5 hidden h-3.5 w-3.5 text-muted-foreground hover:text-foreground focus-visible:ring-0 md:block"
                >
                  <Share2Icon className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyUrl}>
                  Copy URL
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyEmbed}>
                  Copy Embed Code
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2 md:mb-4">
        {moment.target_person_type && (
          <Badge variant="outline" className="rounded-full">
            {moment.target_person_type}
          </Badge>
        )}
        <Badge
          variant="outline"
          className="rounded-full"
          {...styles.activityTypeBadge}
        >
          {moment.activity_type}
        </Badge>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-end">
        <ExpandingText
          text={moment.summary}
          className="text-sm text-muted-foreground"
          containerProps={{ className: "mb-4 sm:mb-0 sm:flex-grow" }}
        />
      </div>

      <Separator className="my-4" />

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-2 hover:text-primary",
              userReaction === "thumbs_up" &&
                "text-primary hover:text-primary/70",
            )}
            onClick={() => handleReaction("thumbs_up")}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{thumbsUpCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-2 hover:text-primary",
              userReaction === "thumbs_down" &&
                "text-destructive hover:text-destructive/70",
            )}
            onClick={() => handleReaction("thumbs_down")}
          >
            <ThumbsDown className="h-4 w-4" />
            <span>{thumbsDownCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 hover:text-primary"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4" />
            <span>{comments?.length ?? 0}</span>
          </Button>
        </div>

        {onSkipToMoment && (
          <div className="flex justify-end sm:ml-4">
            <Button onClick={() => onSkipToMoment(moment)}>
              {jumpToLabel ?? "Jump To"}
            </Button>
          </div>
        )}
      </div>

      {showComments && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 space-y-4"
        >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmitComment)}
              className="flex items-center gap-2"
            >
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Add a comment..."
                        {...field}
                        className="bg-background"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" size="sm">
                Send
              </Button>
            </form>
          </Form>

          <div className="space-y-4">
            {comments
              ?.filter(
                (
                  comment,
                ): comment is typeof comment & {
                  user: NonNullable<(typeof comment)["user"]>;
                } => !!comment.user,
              )
              .map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={/* comment.user.avatar_url */ undefined}
                    />
                    <AvatarFallback>
                      {comment.user.nickname?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium">
                        {comment.user.nickname}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
