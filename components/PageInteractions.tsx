"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function trackEvent(event: string) {
  (window.dataLayer ??= []).push({ event });
}

export default function PageInteractions() {
  useEffect(() => {
    trackEvent("page_view");

    const onClick = (e: MouseEvent) => {
      const target = e.target instanceof Element ? e.target.closest("[data-event]") : null;
      const event = target?.getAttribute("data-event");
      if (event) trackEvent(event);
    };

    const onFormEvent = (e: Event) => {
      const event = (e as CustomEvent<{ event?: string }>).detail?.event;
      if (event && ["form_start", "form_step1_complete", "lead_submit_success"].includes(event)) {
        trackEvent(event);
      }
    };

    window.addEventListener("zykken:analytics", onFormEvent);
    document.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("zykken:analytics", onFormEvent);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
