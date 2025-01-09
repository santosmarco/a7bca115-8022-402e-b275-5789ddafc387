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
            Confirm Meeting Deletion
          </DialogTitle>
          <DialogDescription>
            This action is irreversible and will permanently delete all
            associated data.
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
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I understand that this action cannot be undone and all meeting
              data will be permanently deleted.
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
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I am aware that all insights, moments, and resources related to
              this meeting will also be permanently deleted.
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
