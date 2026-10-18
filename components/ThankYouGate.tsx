"use client";
import { useEffect, useSyncExternalStore } from "react";
import { ThankYou } from "./AuditForm";
import Brand from "./Brand";
import { trackEvent } from "./PageInteractions";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}
function readConfirmation() {
  try { return sessionStorage.getItem("zykken-audit-confirmed") === "1" ? "confirmed" : "missing"; }
  catch { return "missing"; }
}
function serverSnapshot() { return "loading"; }

export default function ThankYouGate() {
  const confirmation = useSyncExternalStore(subscribe, readConfirmation, serverSnapshot);
  useEffect(() => {
    if (confirmation === "confirmed") trackEvent("thank_you_view");
    if (confirmation === "missing") window.location.replace("/uae-real-estate-audit#audit-form");
  }, [confirmation]);
  if (confirmation !== "confirmed") return <div className="thank-you-loading" role="status">Loading…</div>;
  return <><header className="thank-you-header"><Brand /></header><ThankYou /></>;
}
