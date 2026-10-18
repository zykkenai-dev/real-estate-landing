import { ArrowRight, Check, Plus } from "lucide-react";
import AuditForm from "../components/AuditForm";
import Brand from "../components/Brand";
import PageInteractions from "../components/PageInteractions";
import { ResponseObject, FollowupObject, ViewingObject } from "../components/AuditObjects";

const faqs = [
  ["Is the audit really free?", "Yes. The initial 3-point audit is free, with no obligation to work with Zykken afterward."],
  ["Do I need to book a call first?", "No. Request the audit through the form. We can arrange a separate discussion if it would be useful."],
  ["What if we already use a CRM?", "That’s fine. We review how enquiries move toward viewings, not whether you need to replace your tools."],
  ["Can you promise more booked viewings?", "No. We identify potential improvements and explain why they may help. Measurable objectives are agreed before any paid work."],
  ["What happens after the audit?", "Use the recommendations yourself, or ask Zykken to scope a custom implementation project."],
];

function CTA({ className = "", light = false, hero = false }: { className?: string; light?: boolean; hero?: boolean }) {
  return <a href="#audit-form" className={`button ${light ? "button-light" : "button-dark"} ${className}`} data-event={hero ? "hero_cta_click" : "section_cta_click"}>Get My Free Lead Audit <ArrowRight size={23} aria-hidden="true" /></a>;
}

export default function Home() {
  return <>
    <a href="#main" className="skip-link">Skip to content</a>
    <header className="site-header"><div className="header-inner container"><Brand linked={false} /><CTA className="header-cta" /></div></header>
    <main id="main">
      <section className="conversion-hero" aria-labelledby="hero-title"><div className="container conversion-grid">
        <div className="hero-copy">
          <p className="offer-tag"><span className="offer-check"><Check size={20} aria-hidden="true" /></span>Free 3-point lead audit</p>
          <h1 id="hero-title">How many enquiries<br className="hero-break" /> become <em>viewings?</em></h1>
          <p className="hero-description">Find the gaps in your UAE brokerage’s lead process with a free, personalized 3-point audit.</p>
          <CTA light hero className="hero-primary-cta" />
          <div className="hero-reassurances"><span><Check size={18} aria-hidden="true" />No sales call required</span><span><Check size={18} aria-hidden="true" />No obligation</span></div>
          <p className="hero-fit">For owners and managers of UAE real estate brokerages already receiving property enquiries.</p>
        </div>
        <div className="hero-form" id="audit-form" aria-label="Request your free audit"><AuditForm /></div>
      </div></section>

      <section className="audit-section section" id="audit-includes" aria-labelledby="audit-title"><div className="container">
        <div className="section-heading"><h2 id="audit-title">One free audit.<br />Three clear <em>priorities.</em></h2><p>A closer look at what happens between<br className="desktop-break" /> the first message and the booked viewing.</p></div>
        <div className="audit-cards">{[
          { Visual: ResponseObject, title: "First response", text: "How easy is it to enquire — and get a response?" },
          { Visual: FollowupObject, title: "Consistent follow-up", text: "What keeps qualified conversations moving?" },
          { Visual: ViewingObject, title: "The next viewing", text: "What makes the next step easier to book?" },
        ].map(({ Visual, title, text }) => <article className="audit-card" key={title}><div className="audit-card-visual"><Visual /></div><div className="audit-card-copy"><h3>{title}</h3><p>{text}</p></div></article>)}</div>
        <div className="audit-deliverable"><div><h3>You’ll leave with a clearer next step.</h3><ul className="deliverable-list"><li><Check size={20} aria-hidden="true" />Three prioritized observations</li><li><Check size={20} aria-hidden="true" />Practical recommendations</li><li><Check size={20} aria-hidden="true" />A next step, with or without Zykken</li></ul></div><CTA /></div>
        <p className="audit-caveat">Based on public information and the details you share. Private systems are reviewed only if you choose to share access.</p>
      </div></section>

      <section className="faq-section section" id="faq" aria-labelledby="faq-title"><div className="container faq-container"><h2 id="faq-title">Before you <em>request.</em></h2><div className="faq-list">{faqs.map(([question, answer]) => <details className="faq-item" key={question} name="audit-faq"><summary><span>{question}</span><Plus size={22} aria-hidden="true" /></summary><p>{answer}</p></details>)}</div></div></section>

      <section className="closing-section" aria-labelledby="closing-title"><div className="container closing-inner"><h2 id="closing-title">Find the leaks before<br /><em>buying more leads.</em></h2><CTA light className="closing-cta" /><p>Personalized insights. Free to request. No obligation.</p></div></section>
    </main>
    <footer className="site-footer"><div className="container footer-inner"><p>© {new Date().getFullYear()} Zykken</p><nav aria-label="Legal links"><a href="https://www.zykken.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a><a href="https://www.zykken.com/terms" target="_blank" rel="noopener noreferrer">Terms</a></nav></div></footer>
    <PageInteractions />
  </>;
}
