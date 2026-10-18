import { ArrowRight, ArrowUpRight, Check, Clock3, MessageSquare, Plus, ScanLine, UserRound, ListChecks, GitBranch } from "lucide-react";
import AuditForm from "../components/AuditForm";
import Brand from "../components/Brand";
import PageInteractions from "../components/PageInteractions";
import { JourneyObject, ResponseObject, FollowupObject, ViewingObject, ReportObject } from "../components/AuditObjects";
import WorkflowComparison from "../components/WorkflowComparison";

const faqs = [
  ["Is the audit really free?", "Yes. The initial 3-point audit is free, with no obligation to work with Zykken afterward."],
  ["Do I need to book a call first?", "No. Request the audit through the form. We can arrange a separate discussion if it would be useful."],
  ["What if we already use a CRM?", "That’s fine. We review how enquiries move toward viewings, not whether you need to replace your tools."],
  ["Can you promise more booked viewings?", "No. We identify potential improvements and explain why they may help. Measurable objectives are agreed before any paid work."],
  ["What happens after the audit?", "Use the recommendations yourself, or ask Zykken to scope a custom implementation project."],
  ["Is this only for Dubai brokerages?", "It’s designed for brokerages across the UAE, with an initial focus on Dubai."],
];

function CTA({ className = "", hero = false }: { className?: string; hero?: boolean }) {
  return <a href="#audit-form" className={`button button-dark ${className}`} data-event={hero ? "hero_cta_click" : "section_cta_click"}>Get My Free Lead Audit <ArrowUpRight size={17} aria-hidden="true" /></a>;
}
function Label({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export default function Home() {
  return <>
    <a href="#main" className="skip-link">Skip to content</a>
    <header className="site-header"><div className="header-inner container">
      <Brand />
      <nav aria-label="Page navigation"><a className="header-link" href="#audit-includes">The audit <ArrowUpRight size={13} aria-hidden="true" /></a><CTA className="header-cta" /><a className="button button-dark header-mobile-cta" href="#audit-form">Free Audit <ArrowUpRight size={15} aria-hidden="true" /></a></nav>
    </div></header>
    <main id="main">
      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero-copy">
          <Label>Free audit for UAE brokerages</Label>
          <h1 id="hero-title">Your brokerage<br className="desktop-break" /> gets enquiries.<br /><span className="hero-question">How many turn<br className="desktop-break" /> into <em>viewings?</em></span></h1>
          <p className="hero-description">A free, personalized 3-point audit of what happens between the first enquiry and a booked viewing.</p>
          <div className="hero-actions"><CTA hero /><a className="text-link" href="#audit-includes">See what’s included <ArrowRight size={15} aria-hidden="true" /></a></div>
          <p className="reassurance">Free to request. Personalized. No obligation.</p>
        </div>
        <div className="hero-object" role="img" aria-label="Illustrative journey from a new enquiry through first response and agent follow-up to a viewing. A dashed connection represents a possible gap."><JourneyObject /><p className="illustration-caption">Illustrative enquiry journey</p></div>
      </section>

      <div className="context-strip"><div className="container context-inner"><span>Made for UAE brokerages</span><span>Enquiry → viewing</span><span>Actionable, not generic</span></div></div>

      <section className="section problem-section" aria-labelledby="problem-title"><div className="container problem-grid">
        <div className="section-intro"><h2 id="problem-title">A new enquiry isn’t<br />a booked <em>viewing.</em></h2><p>Momentum can slip between the two.</p></div>
        <div className="friction-list">{[
          { icon: Clock3, title: "Slow first responses", text: "Interested buyers or tenants may move on before anyone responds." },
          { icon: MessageSquare, title: "Follow-ups left to memory", text: "Promising conversations can stall without a consistent next step." },
          { icon: ScanLine, title: "Outcomes you can’t see", text: "It’s hard to improve conversion when enquiry outcomes aren’t tracked." },
        ].map(({ icon: Icon, title, text }) => <details className="friction-item" key={title}><summary><span className="friction-icon"><Icon size={21} strokeWidth={1.4} aria-hidden="true" /></span><span>{title}</span><Plus size={15} aria-hidden="true" /></summary><p>{text}</p></details>)}<p className="problem-note"><ArrowUpRight size={14} aria-hidden="true" />Your audit looks for the gaps that matter to your brokerage.</p></div>
      </div></section>

      <section className="section audit-section" id="audit-includes" aria-labelledby="audit-title"><div className="container">
        <div className="section-heading"><div><h2 id="audit-title">Three checks.<br />One clearer <em>next step.</em></h2></div><p>Focused on your enquiry journey.<br /> Personalized to your brokerage.</p></div>
        <div className="audit-cards">{[
          { Visual: ResponseObject, title: "First-response experience", text: "How easy is it to enquire — and get a response?" },
          { Visual: FollowupObject, title: "Follow-up consistency", text: "What keeps qualified conversations moving?" },
          { Visual: ViewingObject, title: "Viewing conversion", text: "What makes the next step easier to book?" },
        ].map(({ Visual, title, text }) => <article className="audit-card" key={title}><div className="audit-card-visual"><Visual /></div><div className="audit-card-copy"><h3>{title}</h3><p>{text}</p></div></article>)}</div>
        <div className="report-deliverable"><div className="report-object"><ReportObject /></div><div className="report-copy"><h3>Clarity you can <em>use.</em></h3><ul className="check-list"><li><Check size={15} aria-hidden="true" />Three prioritized observations</li><li><Check size={15} aria-hidden="true" />Practical, tailored recommendations</li><li><Check size={15} aria-hidden="true" />A next step, with or without Zykken</li></ul></div><a className="report-cta" href="#audit-form" data-event="section_cta_click" aria-label="Get My Free Lead Audit"><ArrowUpRight size={24} strokeWidth={1.4} aria-hidden="true" /></a></div>
        <p className="audit-caveat">Based on public information and the details you share. Private systems are reviewed only if you choose to share access.</p>
      </div></section>

      <section className="section process-section" id="how-it-works" aria-labelledby="process-title"><div className="container">
        <div className="section-heading"><div><h2 id="process-title">From enquiry<br />to <em>clarity.</em></h2></div><p>No sales call required.</p></div>
        <div className="process-grid">{[
          { icon: UserRound, label: "REQUEST", title: "Tell us about your brokerage", text: "A few details about your lead process." },
          { icon: ScanLine, label: "REVIEW", title: "We look at the journey", text: "Your shared details and public enquiry experience." },
          { icon: ListChecks, label: "RECEIVE", title: "Get practical recommendations", text: "Prioritized opportunities. A useful next step." },
        ].map(({ icon: Icon, label, title, text }) => <article className="process-step" key={label}><div className="process-marker"><span className="process-symbol"><Icon size={21} strokeWidth={1.4} aria-hidden="true" /></span><span className="process-line" /><ArrowRight size={15} aria-hidden="true" /></div><h3>{title}</h3><p>{text}</p></article>)}</div>
      </div></section>

      <section className="section workflow-section" aria-labelledby="workflow-title"><div className="container"><div className="workflow-heading"><h2 id="workflow-title">Fewer dropped conversations.<br />A clearer path to <em>viewings.</em></h2></div><WorkflowComparison /></div></section>

      <section className="section qualifier-section" aria-labelledby="qualifier-title"><div className="container qualifier-grid"><div><h2 id="qualifier-title">For teams already<br /><em>handling enquiries.</em></h2></div><div className="qualifier-content"><ul className="fit-list"><li><Check size={16} aria-hidden="true" />You own or manage a UAE brokerage</li><li><Check size={16} aria-hidden="true" />Your team handles enquiries regularly</li><li><Check size={16} aria-hidden="true" />You want a more consistent lead process</li></ul><details className="not-fit"><summary>Probably not the right fit if… <Plus size={14} aria-hidden="true" /></summary><p>You’re looking for a property, a traffic or SEO report, or aren’t involved in brokerage operations.</p></details></div></div></section>

      <section className="section faq-section" id="faq" aria-labelledby="faq-title"><div className="container faq-grid"><div><h2 id="faq-title">Before you<br /><em>request.</em></h2></div><div className="faq-list">{faqs.map(([q,a])=><details key={q} className="faq-item" name="audit-faq"><summary><span>{q}</span><Plus size={17} strokeWidth={1.5} aria-hidden="true" /></summary><p>{a}</p></details>)}</div></div></section>

      <section className="section form-section" id="audit-form" aria-labelledby="form-section-title"><div className="container form-grid"><div className="form-section-copy"><h2 id="form-section-title">Find the leaks before<br /><em>buying more leads.</em></h2><p>Tell us about your brokerage.<br />We’ll take a closer look at the journey.</p><div className="offer-stamp"><div className="offer-stamp-symbol"><GitBranch size={23} strokeWidth={1.25} aria-hidden="true" /></div><div><strong>Free 3-point audit</strong><span>Personalized. Practical. No obligation.</span></div></div></div><AuditForm /></div></section>
    </main>
    <footer className="site-footer"><div className="container"><div className="footer-top"><div><Brand /><p>Systems built around better business outcomes.</p></div><nav aria-label="Legal and company links"><a href="https://www.zykken.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a><a href="https://www.zykken.com/terms" target="_blank" rel="noopener noreferrer">Terms</a><a href="https://www.zykken.com">zykken.com <ArrowUpRight size={13} aria-hidden="true" /></a></nav></div><p className="footer-bottom">© {new Date().getFullYear()} Zykken</p></div></footer>
    <div className="mobile-sticky-cta" id="mobile-sticky-cta"><CTA /></div><PageInteractions />
  </>;
}
