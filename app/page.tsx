import { ArrowRight, ArrowUpRight, Check, CheckCheck, CircleHelp, Clock3, CornerDownRight, GitBranch, ListChecks, Mail, MessageSquare, MoveUpRight, Plus, UserRound, CalendarDays } from "lucide-react";
import AuditForm from "../components/AuditForm";
import Brand from "../components/Brand";
import PageInteractions from "../components/PageInteractions";

const faqs = [
  ["Is the audit really free?", "Yes. There’s no charge to request or receive the initial 3-point audit, and there’s no obligation to work with Zykken afterward."],
  ["Do I need to book a call first?", "No. Submit the short form, and we’ll review the information you share. If a discussion would be useful, we can arrange one separately."],
  ["What if our brokerage already uses a CRM?", "That’s fine. The audit focuses on how enquiries are handled and moved toward viewings — not on replacing your existing tools."],
  ["Can you promise more booked viewings?", "No credible provider can guarantee that from an initial audit. We identify potential improvements, explain the reasoning, and agree on measurable objectives before any paid work."],
  ["What happens after I receive the audit?", "You can use the recommendations yourself. If you’d like help implementing them, Zykken can scope a custom project and proposal."],
  ["Do you only work with Dubai brokerages?", "The audit is designed for real estate brokerages across the UAE, with an initial focus on Dubai."],
];

function CTA({ className = "", light = false, hero = false }: { className?: string; light?: boolean; hero?: boolean }) {
  return <a href="#audit-form" className={`button ${light ? "button-light" : "button-dark"} ${className}`} data-event={hero ? "hero_cta_click" : "section_cta_click"}>Get My Free Lead Audit <ArrowUpRight size={18} aria-hidden="true" /></a>;
}
function Label({ children, number }: { children: React.ReactNode; number?: string }) {
  return <div className="eyebrow">{number && <span className="section-number">{number}</span>}<span>{children}</span></div>;
}

export default function Home() {
  return <>
    <a href="#main" className="skip-link">Skip to content</a>
    <header className="site-header"><div className="header-inner container">
      <div className="header-brand"><Brand /><span className="brand-descriptor">FOR UAE<br />REAL ESTATE</span></div>
      <nav aria-label="Page navigation"><a className="header-link" href="#audit-includes">What you’ll get <ArrowUpRight size={14} /></a><CTA className="header-cta" /><a className="button button-dark header-mobile-cta" href="#audit-form">Free Audit <ArrowUpRight size={16} /></a></nav>
    </div></header>
    <main id="main">
      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero-copy">
          <Label>FOR UAE REAL ESTATE BROKERAGES</Label>
          <h1 id="hero-title">Your brokerage<br className="desktop-break" /> gets enquiries.<br /><span className="hero-question">How many turn<br className="desktop-break" /> into <em>viewings?</em></span></h1>
          <p className="hero-description">Discover where potential clients might be slipping away between the first property enquiry and the booked viewing. Get a free, personalized 3-point audit of your lead-handling journey.</p>
          <div className="hero-actions"><CTA hero /><a className="text-link" href="#audit-includes">See what the audit covers <ArrowRight size={16} /></a></div>
          <p className="reassurance"><span className="tiny-check"><Check size={11} /></span>Free to request. Personalized insights. No obligation.</p>
        </div>
        <div className="journey-wrap">
          <div className="visual-overline"><span>01 / YOUR ENQUIRY-TO-VIEWING JOURNEY</span><Plus size={13} /></div>
          <div className="journey-panel" role="img" aria-label="Illustrative enquiry journey: new enquiry received, first response, agent follow-up, viewing arranged. Your free audit reviews potential gaps at each step.">
            <div className="journey-heading"><span className="journey-label">ENQUIRY JOURNEY</span><span className="illustration-label"><span />ILLUSTRATIVE EXAMPLE</span></div>
            <div className="journey-flow">
              <div className="journey-step"><span className="journey-number">01</span><div className="journey-stage"><span className="stage-icon"><Mail size={17} strokeWidth={1.5} /></span><h3>New enquiry received</h3><span className="stage-tag">Review routing <ArrowUpRight size={12} /></span></div></div>
              <div className="journey-step"><span className="journey-number">02</span><div className="journey-stage"><span className="stage-icon"><MessageSquare size={17} strokeWidth={1.5} /></span><h3>First response</h3><span className="stage-tag">Review response time <Clock3 size={12} /></span></div></div>
              <div className="journey-gap"><span /><span className="gap-mark">?</span><span /></div>
              <div className="journey-step journey-step-third"><span className="journey-number">03</span><div className="journey-stage"><span className="stage-icon"><UserRound size={17} strokeWidth={1.5} /></span><h3>Agent follow-up</h3><span className="stage-tag">Review consistency <ArrowUpRight size={12} /></span></div></div>
              <div className="journey-step last-step"><span className="journey-number"><Check size={15} /></span><div className="journey-stage"><span className="stage-icon"><CalendarDays size={17} strokeWidth={1.5} /></span><h3>Viewing arranged</h3><span className="stage-tag">Track outcome <CheckCheck size={13} /></span></div></div>
            </div>
            <p className="journey-note"><CornerDownRight size={16} /><span>Your free audit reviews potential gaps at each step.</span></p>
          </div>
        </div>
      </section>
      <div className="context-strip"><div className="container context-inner">
        <div><span className="context-icon"><UserRound size={17} /></span>Made for UAE brokerages</div>
        <div><span className="context-icon"><GitBranch size={17} /></span>Focused on enquiry-to-viewing conversion</div>
        <div><span className="context-icon"><ListChecks size={17} /></span>Actionable, not a generic report</div>
      </div></div>

      <section className="section problem-section" aria-labelledby="problem-title"><div className="container problem-grid">
        <div className="section-intro"><Label number="01">THE GAP</Label><h2 id="problem-title">A new enquiry isn’t the same as a new <em>viewing.</em></h2><p>Between the first message and a confirmed viewing, there are several moments where momentum can be lost. The problem isn’t always lead volume. Sometimes it’s what happens after the enquiry arrives.</p><p className="intro-footnote"><span className="small-arrow"><ArrowDownRightIcon /></span>Your audit looks for the gaps that may matter most to your brokerage.</p></div>
        <div className="friction-list">
          {[
            { icon: Clock3, title: "The first response takes too long", text: "Interested buyers or tenants may move on before anyone responds." },
            { icon: MessageSquare, title: "Follow-ups depend on memory", text: "Promising conversations can stall without a consistent next step." },
            { icon: CircleHelp, title: "No clear view of what happened", text: "It’s difficult to improve conversion when enquiry outcomes aren’t tracked in one place." },
          ].map(({ icon: Icon, title, text }, i) => <article className="friction-row" key={title}><div className="friction-icon"><Icon size={23} strokeWidth={1.4} /></div><div><span className="row-index">0{i+1}</span><h3>{title}</h3><p>{text}</p></div></article>)}
        </div>
      </div></section>

      <section className="section audit-section" id="audit-includes" aria-labelledby="audit-title"><div className="container">
        <div className="section-heading audit-heading"><div><Label number="02">THE FREE AUDIT</Label><h2 id="audit-title">Three things we’ll look at.<br />One clearer <em>next step.</em></h2></div><p>We’ll review what we can observe about your enquiry journey and what you tell us about your current process. You’ll receive a concise, personalized breakdown — not a 40-page generic PDF.</p></div>
        <div className="audit-cards">
          {[
            { icon: MessageSquare, title: "First-response experience", text: "How easy is it for a prospect to enquire, and what can be learned about the first-response experience?" },
            { icon: GitBranch, title: "Follow-up consistency", text: "Where might conversations stall, and what follow-up structure could help keep qualified interest moving?" },
            { icon: CalendarDays, title: "Viewing conversion opportunities", text: "Which practical improvements could make it easier to take an enquiry to the next step, including a viewing appointment?" },
          ].map(({ icon: Icon, title, text }, i) => <article className="audit-card" key={title}><div className="audit-card-top"><span>0{i+1}</span><Icon size={26} strokeWidth={1.25} /></div><h3>{title}</h3><p>{text}</p><div className="card-bottom-rule" /></article>)}
        </div>
        <div className="deliverables"><div className="deliverable-title"><span className="deliverable-icon"><ListChecks size={21} /></span><h3>What you’ll receive</h3></div><ul className="check-list"><li><Check size={16} />Three prioritized observations or opportunities</li><li><Check size={16} />Practical recommendations tailored to your brokerage</li><li><Check size={16} />A suggested next step, whether or not you work with Zykken</li></ul></div>
        <div className="audit-bottom"><p className="fine-print">The depth of the audit depends on publicly accessible information and the details you share. We won’t claim visibility into private systems without access or invent findings.</p><CTA /></div>
      </div></section>

      <section className="section process-section" id="how-it-works" aria-labelledby="process-title"><div className="container">
        <div className="section-heading"><div><Label number="03">SIMPLE PROCESS</Label><h2 id="process-title">From enquiry to clarity<br />in three <em>steps.</em></h2></div><p className="process-note"><span className="tiny-check"><Check size={11} /></span>No sales call is required<br />to request the audit.</p></div>
        <div className="process-grid">{[
          ["REQUEST", "Tell us about your brokerage", "Answer a few short questions about your enquiry volume and biggest lead-handling challenge."],
          ["REVIEW", "We review the journey", "We examine the details you’ve shared and the publicly visible customer enquiry experience."],
          ["RECEIVE", "Get practical recommendations", "We send you the audit with prioritized opportunities. If useful, you can discuss the findings with us."],
        ].map(([label,title,text],i)=><article className="process-step" key={label}><div className="process-top"><span className="process-index">0{i+1}</span><span className="process-line" /><ArrowRight size={16} /></div><span className="process-label">{label}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </div></section>

      <section className="section workflow-section" aria-labelledby="workflow-title"><div className="container">
        <div className="section-heading"><div><Label number="04">WHAT BETTER CAN LOOK LIKE</Label><h2 id="workflow-title">A clearer path from first<br />message to <em>booked viewing.</em></h2></div><span className="workflow-example-label"><span />ILLUSTRATIVE WORKFLOW</span></div>
        <div className="workflow-panels"><article className="workflow-card fragmented"><div className="workflow-card-heading"><span className="workflow-symbol"><GitBranch size={21} strokeWidth={1.5} /></span><h3>When the process<br />is fragmented</h3><span className="workflow-card-index">01</span></div><ul>{["Enquiry arrives in an inbox", "Agent ownership is unclear", "Follow-up relies on memory", "No clear record of next steps"].map(t=><li key={t}><span className="open-dot" />{t}</li>)}</ul></article>
        <span className="workflow-transfer"><ArrowRight size={22} /></span>
        <article className="workflow-card intentional"><div className="workflow-card-heading"><span className="workflow-symbol"><ListChecks size={21} strokeWidth={1.5} /></span><h3>When the process<br />is intentional</h3><span className="workflow-card-index">02</span></div><ul>{["New enquiry is acknowledged promptly", "An agent is clearly assigned", "Follow-up happens on a defined schedule", "Every enquiry has a visible next step"].map(t=><li key={t}><span className="closed-check"><Check size={11} /></span>{t}</li>)}</ul></article></div>
        <p className="workflow-caption">Illustrative workflow only. Recommendations depend on each brokerage’s actual tools, capacity and current process.</p>
        <p className="workflow-conclusion">The goal isn’t more software. It’s fewer dropped conversations<br className="desktop-break" /> and a more reliable path to viewings.</p>
      </div></section>

      <section className="section qualifier-section" aria-labelledby="qualifier-title"><div className="container">
        <Label number="05">WHO IT’S FOR</Label><h2 id="qualifier-title">Built for teams that already<br />handle property <em>enquiries.</em></h2>
        <div className="qualifier-grid"><div><h3>This is likely useful if…</h3><ul className="check-list">{["You own or manage a UAE real estate brokerage", "Your team receives property enquiries regularly", "You want better visibility or consistency after enquiry capture", "You’re open to improving an existing process"].map(t=><li key={t}><Check size={16} />{t}</li>)}</ul></div><div className="not-fit"><h3>Probably not the right fit if…</h3><ul>{["You’re looking for a property to buy or rent", "You only want a generic traffic or SEO report", "You aren’t involved in brokerage operations"].map(t=><li key={t}><span className="dash" />{t}</li>)}</ul></div></div>
      </div></section>

      <section className="section faq-section" id="faq" aria-labelledby="faq-title"><div className="container faq-grid"><div><Label number="06">A LITTLE MORE CLARITY</Label><h2 id="faq-title">Good questions.<br /><em>Clear answers.</em></h2></div><div className="faq-list">{faqs.map(([q,a],i)=><details key={q} className="faq-item" name="audit-faq"><summary><span className="faq-number">0{i+1}</span><span>{q}</span><Plus size={18} strokeWidth={1.5} /></summary><p>{a}</p></details>)}</div></div></section>

      <section className="section form-section" id="audit-form" aria-labelledby="form-section-title"><div className="container form-grid"><div className="form-section-copy"><Label number="07">YOUR NEXT STEP</Label><h2 id="form-section-title">Find the leaks<br /> before buying<br /> <em>more leads.</em></h2><p>Tell us a little about your brokerage. We’ll review the enquiry journey and put together a useful, personalized 3-point audit.</p><ul className="check-list form-reassurances"><li><Check size={16} />Personalized to your brokerage</li><li><Check size={16} />Focused on actionable opportunities</li><li><Check size={16} />No obligation to purchase anything</li></ul><div className="form-copy-rule"><span>FREE 3-POINT AUDIT</span><MoveUpRight size={28} strokeWidth={1} /></div></div><AuditForm /></div></section>
    </main>
    <footer className="site-footer"><div className="container"><div className="footer-top"><div><Brand /><p>Zykken — systems built around better business outcomes.</p></div><nav aria-label="Legal and company links"><a href="https://www.zykken.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy <ArrowUpRight size={13} /></a><a href="https://www.zykken.com/terms" target="_blank" rel="noopener noreferrer">Terms <ArrowUpRight size={13} /></a><a href="https://www.zykken.com">zykken.com <ArrowUpRight size={13} /></a></nav></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Zykken. All rights reserved.</span><span>FOR UAE REAL ESTATE BROKERAGES</span></div></div></footer>
    <div className="mobile-sticky-cta" id="mobile-sticky-cta"><CTA /></div>
    <PageInteractions />
  </>;
}
function ArrowDownRightIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 5l14 14M5 19h14V5" /></svg>; }
