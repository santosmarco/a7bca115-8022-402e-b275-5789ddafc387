import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface RestartChatButtonProps {
  onRestart: () => void;
  className?: string;
}

export function RestartChatButton({
  onRestart,
  className,
}: RestartChatButtonProps) {
  const handleRestart = () => {
    onRestart();
    toast.success("Chat restarted successfully");
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            className,
          )}
        >
          <RotateCcw className="h-4 w-4" />
          Restart Chat
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restart Chat</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to restart the chat? This will clear all
            current messages and start a new conversation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRestart}>Restart</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
