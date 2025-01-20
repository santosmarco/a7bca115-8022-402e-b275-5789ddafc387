import { AlertTriangle } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface FirstConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function FirstConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
}: FirstConfirmationModalProps) {
  const [isUnderstandChecked, setIsUnderstandChecked] = useState(false);
  const [isAwareChecked, setIsAwareChecked] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Meeting and All Associated Data
          </DialogTitle>
          <DialogDescription>
            Deleting this will permanently remove the video recording, all
            associated metadata, moments, chat history, and insights. This
            action is irreversible.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="understand"
              checked={isUnderstandChecked}
              onCheckedChange={(checked) =>
                setIsUnderstandChecked(checked as boolean)
              }
            />
            <label
              htmlFor="understand"
              className="-mt-0.5 text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I understand that this action cannot be undone and the video,
              metadata, and recordings will be permanently deleted.
            </label>
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox
              id="aware"
              checked={isAwareChecked}
              onCheckedChange={(checked) =>
                setIsAwareChecked(checked as boolean)
              }
            />
            <label
              htmlFor="aware"
              className="-mt-0.5 text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I am aware that all Explore chats, moments, and resources related
              to this meeting will also be permanently deleted.
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={!isUnderstandChecked || !isAwareChecked}
          >
            Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
