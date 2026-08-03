"use client";

import { forwardRef } from "react";

import { Input, type ReusableInputProps } from "@/components/input";
import { authFieldControlClass } from "@/lib/frontend/layout/auth-chrome";
import { cn } from "@/lib/utils";

type ControlElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

/** Auth forms — glass field surfaces matched to the active theme. */
export const AuthInput = forwardRef<ControlElement, ReusableInputProps>(function AuthInput(
  { controlClassName, ...props },
  ref,
) {
  return (
    <Input
      {...props}
      ref={ref}
      controlClassName={cn(authFieldControlClass, controlClassName)}
    />
  );
});

AuthInput.displayName = "AuthInput";
