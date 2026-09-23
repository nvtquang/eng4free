"use client";

import { useEffect } from "react";

/** Creates one durable anonymous learner identity before the first activity. */
export function GuestSessionBootstrap() {
  useEffect(() => {
    void fetch("/api/session/guest", { method: "POST", cache: "no-store" });
  }, []);
  return null;
}
