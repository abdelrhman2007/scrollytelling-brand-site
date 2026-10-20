"use client";

import { useState } from "react";

/** Share sheet on phones, clipboard elsewhere. */
export function useContactCardController(name: string) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Share sheet dismissed — nothing to do.
    }
  };

  return { share, copied };
}
