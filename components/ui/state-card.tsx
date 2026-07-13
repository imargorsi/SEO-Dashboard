import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import {
  elevatedCardMutedClass,
  elevatedCardSurfaceClass,
  elevatedCardTitleClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

type TStateCardProps = {
  title: string;
  body: string;
  className?: string;
};

export function StateCard({ title, body, className }: TStateCardProps) {
  return (
    <div className={cn(elevatedCardSurfaceClass, "rounded-3xl px-6 py-10 text-center", className)}>
      <Heading sectionTitle className={elevatedCardTitleClass}>
        {title}
      </Heading>
      <Paragraph className={cn("mt-2", elevatedCardMutedClass)}>{body}</Paragraph>
    </div>
  );
}
