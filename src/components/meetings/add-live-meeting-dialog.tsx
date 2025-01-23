"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { api, type RouterOutputs } from "~/trpc/react";

const formSchema = z.object({
  meetingUrl: z
    .string()
    .url("Please enter a valid URL")
    .min(1, "Meeting URL is required"),
});

type AddLiveMeetingDialogProps = {
  user: RouterOutputs["auth"]["getUser"];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function AddLiveMeetingDialog({
  user,
  isOpen,
  onClose,
  onSuccess,
}: AddLiveMeetingDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      meetingUrl: "",
    },
  });

  const { mutate: launchMeetingBot, isPending: isLoading } =
    api.calendar.launchMeetingBot.useMutation({
      onSuccess: () => {
        form.reset();
        onClose();
        onSuccess();
        toast.success("Bot launched successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  function onSubmit(values: z.infer<typeof formSchema>) {
    launchMeetingBot({
      meetingUrl: values.meetingUrl,
      profileId: user.id,
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Live Meeting</DialogTitle>
          <DialogDescription>
            Enter the URL of your meeting to start recording and analyzing.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="meetingUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://meet.google.com/..."
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </motion.div>
                )}
                Launch Bot
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
