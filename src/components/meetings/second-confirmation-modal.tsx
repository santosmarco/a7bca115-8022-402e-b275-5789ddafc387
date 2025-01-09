import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";

interface SecondConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

const CONFIRMATION_TEXT = "delete the meeting and all associated resources";

export function SecondConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: SecondConfirmationModalProps) {
  const [inputText, setInputText] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isDeleting && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Final Confirmation
          </DialogTitle>
          <DialogDescription>
            This is your last chance to cancel. This action will permanently
            delete the meeting and all associated data.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm">
            To confirm, please type:
            <br />
            <strong className="select-none">{CONFIRMATION_TEXT}</strong>
          </p>
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type the confirmation text here"
            disabled={isDeleting}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={
              inputText.toLowerCase() !== CONFIRMATION_TEXT || isDeleting
            }
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Permanently Delete Meeting"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
