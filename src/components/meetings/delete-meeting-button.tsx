"use client";

import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { api } from "~/trpc/react";

import { FirstConfirmationModal } from "./first-confirmation-modal";
import { SecondConfirmationModal } from "./second-confirmation-modal";

export type DeleteMeetingButtonProps = {
  meetingId: string;
};

export function DeleteMeetingButton({ meetingId }: DeleteMeetingButtonProps) {
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const { mutateAsync: deleteMeetingAsync } =
    api.videos.deleteMeeting.useMutation();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMeetingAsync({ meetingId });

      // Actual deletion logic would go here
      // await deleteMeeting(meetingId)

      setIsSecondModalOpen(false);
      router.push("/");
      toast.success("Meeting successfully deleted");
    } catch (error) {
      console.error("Error deleting meeting:", error);
      toast.error("Failed to delete meeting. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Open settings</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => setIsFirstModalOpen(true)}
          >
            Delete meeting
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <FirstConfirmationModal
        isOpen={isFirstModalOpen}
        onClose={() => setIsFirstModalOpen(false)}
        onConfirm={() => {
          setIsFirstModalOpen(false);
          setIsSecondModalOpen(true);
        }}
      />

      <SecondConfirmationModal
        isOpen={isSecondModalOpen}
        onClose={() => setIsSecondModalOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
