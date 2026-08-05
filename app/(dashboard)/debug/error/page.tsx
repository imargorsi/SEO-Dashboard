"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

function BrokenRender(): never {
  throw new Error("Debug render error — testing AppErrorScreen.");
}

export default function DebugErrorPage() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (process.env.NODE_ENV === "production") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <p className="type-body text-text-muted">Not Available In Production.</p>
      </div>
    );
  }

  if (shouldThrow) {
    return <BrokenRender />;
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="type-body text-text-muted">
        Use These Buttons To Preview The Branded Error Screen.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" variant="gradient" onClick={() => setShouldThrow(true)}>
          Trigger Render Error
        </Button>
        <Button
          type="button"
          variant="outlined"
          onClick={() => {
            throw new Error("Debug event error — testing AppErrorScreen.");
          }}
        >
          Trigger Click Error
        </Button>
      </div>
    </div>
  );
}
