export type FeedbackVariant = "success" | "error" | "warning" | "info";

export type FeedbackMessage = {
  variant: FeedbackVariant;
  message: string;
};
