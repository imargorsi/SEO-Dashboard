"use client";

import { Icons } from "@/lib/frontend/icons/app-icons";


import SelectDropdownArrowIcon from "@/components/icons/input-select-dropdown-arrow";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formFieldControlClass } from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

type TIntegrationPropertySelectProps = {
  id: string;
  value: string;
  options: Array<{ id: string; name: string }>;
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
};

export function IntegrationPropertySelect({
  id,
  value,
  options,
  placeholder,
  disabled,
  onChange,
  onOpenChange,
}: TIntegrationPropertySelectProps) {
  const selected = options.find((option) => option.id === value) ?? null;

  return (
    <DropdownMenu className="w-full" onOpenChange={onOpenChange}>
      <DropdownMenuTrigger
        id={id}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-xl px-3 type-body text-start text-text-primary outline-none transition-[border-color,box-shadow]",
          formFieldControlClass,
          "hover:border-brand focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/25",
          !selected && "text-text-placeholder",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <span className="min-w-0 truncate">{selected?.name ?? placeholder}</span>
        <SelectDropdownArrowIcon className="shrink-0 text-brand" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="top-full mt-2 w-full min-w-full border-brand/45">
        <div className="themed-scrollbar max-h-45 overflow-y-auto">
          <DropdownMenuItem
            onSelect={() => onChange("")}
            className={cn(
              "text-text-muted",
              !value && "bg-brand/12 text-text-primary",
            )}
          >
            <span className="min-w-0 flex-1 truncate text-start">{placeholder}</span>
            {!value ? <Icons.tick className="size-3.5 shrink-0 text-brand" aria-hidden /> : null}
          </DropdownMenuItem>
          {options.map((option) => {
            const isSelected = option.id === value;
            return (
              <DropdownMenuItem
                key={option.id}
                onSelect={() => onChange(option.id)}
                className={cn(isSelected && "bg-brand/15 text-text-primary")}
              >
                <span className="min-w-0 flex-1 truncate text-start">{option.name}</span>
                {isSelected ? (
                  <Icons.tick className="size-3.5 shrink-0 text-brand" aria-hidden />
                ) : null}
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
