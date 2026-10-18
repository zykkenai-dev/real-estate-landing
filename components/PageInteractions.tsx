"use client";
import { useEffect } from "react";

declare global { interface Window { dataLayer?: Record<string, unknown>[] } }
export function trackEvent(event: string) { (window.dataLayer ??= []).push({ event }); }

export default function PageInteractions() {
  useEffect(() => {
    trackEvent("page_view");
    const heroCTA = document.querySelector("[data-event='hero_cta_click']");
    const form = document.getElementById("audit-form");
    const footer = document.querySelector(".site-footer");
    const bar = document.getElementById("mobile-sticky-cta");
    let heroGone = false;
    let formVisible = false;
    let footerVisible = false;
    const updateBar = () => {
      const keyboardVisible = document.activeElement?.matches("input,select,textarea");
      const keyboardShrunk = window.visualViewport && window.visualViewport.height < window.innerHeight * .75;
      bar?.classList.toggle("is-visible", heroGone && !formVisible && !footerVisible && !keyboardVisible && !keyboardShrunk);
    };
    const heroObserver = new IntersectionObserver(([entry]) => { heroGone = !entry.isIntersecting && entry.boundingClientRect.bottom < 0; updateBar(); });
    const formObserver = new IntersectionObserver(([entry]) => { formVisible = entry.isIntersecting; updateBar(); });
    const footerObserver = new IntersectionObserver(([entry]) => { footerVisible = entry.isIntersecting; updateBar(); });
    if (footer) footerObserver.observe(footer);
    if (heroCTA) heroObserver.observe(heroCTA);
    if (form) formObserver.observe(form);
    const onClick = (e: MouseEvent) => {
      const target = (e.target as Element)?.closest("[data-event]");
      const event = target?.getAttribute("data-event");
      if (event) trackEvent(event);
    };
    const onFormEvent = (e: Event) => { const event = (e as CustomEvent<{event?: string}>).detail?.event; if (["form_start", "form_step1_complete", "lead_submit_success"].includes(event || "")) trackEvent(event!); };
    window.addEventListener("zykken:analytics", onFormEvent);
    document.addEventListener("click", onClick);
    document.addEventListener("focusin", updateBar);
    document.addEventListener("focusout", updateBar);
    window.visualViewport?.addEventListener("resize", updateBar);
    return () => { heroObserver.disconnect(); formObserver.disconnect(); footerObserver.disconnect(); window.removeEventListener("zykken:analytics", onFormEvent); document.removeEventListener("click", onClick); document.removeEventListener("focusin", updateBar); document.removeEventListener("focusout", updateBar); window.visualViewport?.removeEventListener("resize", updateBar); };
  }, []);
  return null;
}
