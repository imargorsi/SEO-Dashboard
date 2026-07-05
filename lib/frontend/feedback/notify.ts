import { toast } from "sonner";

import { capitalizeFeedbackText } from "@/lib/frontend/feedback/format";
import type { FeedbackMessage } from "@/lib/frontend/feedback/types";

function showToast({ variant, message }: FeedbackMessage) {
  const title = capitalizeFeedbackText(message);

  switch (variant) {
    case "success":
      return toast.success(title);
    case "error":
      return toast.error(title);
    case "warning":
      return toast.warning(title);
    case "info":
      return toast.info(title);
  }
}

export const notify = {
  success: (message: string) => showToast({ variant: "success", message }),
  error: (message: string) => showToast({ variant: "error", message }),
  warning: (message: string) => showToast({ variant: "warning", message }),
  info: (message: string) => showToast({ variant: "info", message }),
  show: (message: FeedbackMessage) => showToast(message),
};
