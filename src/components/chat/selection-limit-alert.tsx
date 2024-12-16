import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export function SelectionLimitAlert() {
  return (
    <Alert variant="destructive" className="mb-2">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Selection Limit Reached</AlertTitle>
      <AlertDescription>
        You can select up to 5 items total. Please remove some selections to add
        more.
      </AlertDescription>
    </Alert>
  );
}
