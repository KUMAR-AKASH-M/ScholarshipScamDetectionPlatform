"use client";

import type * as React from "react";
import { InkProvider } from "@/lib/ink/react";

export function LooseleafProvider({ children }: { children: React.ReactNode }) {
  return (
    <InkProvider textures defs>
      {children}
    </InkProvider>
  );
}

