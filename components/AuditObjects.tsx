import type { ReactNode } from 'react';
import { ArrowRight, CalendarCheck2, Check as CheckIcon, ListChecks, MessageSquare, Plus } from 'lucide-react';

const stroke = '#c1c1c1';
const ink = '#242424';
const paper = '#ffffff';
const soft = '#efefef';

function ObjectCanvas({
  children,
  className = '',
  viewBox = '0 0 300 150',
}: {
  children: ReactNode;
  className?: string;
  viewBox?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={`audit-object ${className}`}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

function Check({ x, y, light = false }: { x: number; y: number; light?: boolean }) {
  return (
    <path
      d={`M ${x - 4} ${y} l 3 3 6 -7`}
      stroke={light ? paper : ink}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={light ? 'object-light-stroke' : 'object-ink-stroke'}
    />
  );
}

export function JourneyObject() {
  return (
    <div className="journey-object" aria-hidden="true">
      <ol className="journey-canvas">
        <li className="journey-node journey-node-enquiry">
          <div className="journey-node-heading">
            <span className="journey-icon"><Plus size={24} strokeWidth={1.5} /></span>
            <span className="journey-node-title">New enquiry</span>
          </div>
          <div className="journey-skeleton"><span /><span /></div>
          <span className="journey-connector journey-connector-enquiry"><ArrowRight size={24} strokeWidth={1.3} /></span>
        </li>
        <li className="journey-node journey-node-response">
          <div className="journey-node-heading">
            <span className="journey-icon"><MessageSquare size={24} strokeWidth={1.5} /></span>
            <span className="journey-node-title">First response</span>
          </div>
          <div className="journey-skeleton"><span /><span /></div>
          <span className="journey-connector journey-connector-response"><ArrowRight size={24} strokeWidth={1.3} /></span>
        </li>
        <li className="journey-node journey-node-followup">
          <div className="journey-node-heading">
            <span className="journey-icon"><ListChecks size={24} strokeWidth={1.5} /></span>
            <span className="journey-node-title">Agent follow-up</span>
          </div>
          <div className="journey-checks">
            {[1, 2, 3].map((item) => <span key={item}><CheckIcon size={16} strokeWidth={1.6} /><i /></span>)}
          </div>
          <span className="journey-connector journey-connector-followup"><ArrowRight size={24} strokeWidth={1.3} /></span>
        </li>
        <li className="journey-node journey-node-viewing">
          <div className="journey-node-heading">
            <span className="journey-icon"><CalendarCheck2 size={24} strokeWidth={1.5} /></span>
            <span className="journey-node-title">Viewing arranged</span>
          </div>
          <div className="journey-viewing-confirmation"><CheckIcon size={20} strokeWidth={1.6} /><i /></div>
        </li>
      </ol>
    </div>
  );
}

export function ResponseObject() {
  return (
    <ObjectCanvas className="response-object" viewBox="18 18 264 120">
      <path d="M98 65H197Q218 65 218 86V95" stroke={stroke} strokeWidth="1.2" className="object-line" />
      <rect x="30" y="28" width="150" height="58" rx="12" fill={paper} stroke={stroke} className="object-paper" />
      <path d="M52 48H142M52 61H114" stroke={stroke} strokeWidth="4" strokeLinecap="round" className="object-line" />
      <path d="M47 86V97L61 86" fill={paper} stroke={stroke} strokeLinejoin="round" className="object-paper" />
      <rect x="121" y="84" width="150" height="43" rx="12" fill={ink} className="object-ink" />
      <path d="M143 105H211" stroke={paper} strokeWidth="3" strokeLinecap="round" className="object-light-stroke" />
      <circle cx="246" cy="105" r="10" stroke="#7b7b7b" />
      <path d="M242 105H250M247 102L250 105 247 108" stroke={paper} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </ObjectCanvas>
  );
}

export function FollowupObject() {
  return (
    <ObjectCanvas className="followup-object" viewBox="43 14 230 120">
      <path d="M72 35V113" stroke={stroke} strokeWidth="1.3" className="object-line" />
      {[34, 75, 116].map((y) => (
        <g key={y}>
          <circle cx="72" cy={y} r="12" fill={paper} stroke={stroke} className="object-paper" />
          <Check x={72} y={y} />
        </g>
      ))}
      <path d="M84 75H122" stroke={stroke} strokeWidth="1.3" strokeDasharray="3 4" className="object-line" />
      <rect x="122" y="42" width="137" height="69" rx="10" fill={paper} stroke={stroke} className="object-paper" />
      <circle cx="146" cy="66" r="9" fill={soft} className="object-soft" />
      <path d="M143 64A3 3 0 0 1 149 64V68L151 70H141L143 68V64ZM145 73H147" stroke={ink} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M166 65H235M143 91H218" stroke={stroke} strokeWidth="3" strokeLinecap="round" className="object-line" />
    </ObjectCanvas>
  );
}

export function ViewingObject() {
  return (
    <ObjectCanvas className="viewing-object" viewBox="28 10 245 132">
      <circle cx="47" cy="100" r="9" fill={ink} className="object-ink" />
      <circle cx="47" cy="100" r="3" fill={paper} />
      <path d="M56 100H110Q126 100 126 84V66Q126 52 141 52H155" stroke={stroke} strokeWidth="1.3" strokeDasharray="3 4" className="object-line" />
      <rect x="154" y="25" width="105" height="104" rx="12" fill={paper} stroke={stroke} className="object-paper" />
      <path d="M154 53H259M181 19V33M231 19V33" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" className="object-line" />
      {[176, 207, 238].map((x) => <circle key={x} cx={x} cy="72" r="2" fill={stroke} className="object-muted" />)}
      <circle cx="207" cy="100" r="13" fill={ink} className="object-ink" />
      <Check x={207} y={100} light />
      <circle cx="176" cy="100" r="2" fill={stroke} className="object-muted" />
      <circle cx="238" cy="100" r="2" fill={stroke} className="object-muted" />
    </ObjectCanvas>
  );
}

export function ReportObject() {
  return (
    <ObjectCanvas className="report-object" viewBox="23 28 311 190">
      {[40, 99, 158].map((y, i) => (
        <g key={y}>
          <rect x={36 + i * 7} y={y} width="274" height="46" rx="8" fill={paper} stroke={stroke} className="object-paper" />
          <circle cx={61 + i * 7} cy={y + 23} r="5" fill={ink} className="object-ink" />
          <path d={`M${87 + i * 7} ${y + 23}H${223 - i * 11}`} stroke={stroke} strokeWidth="4" strokeLinecap="round" className="object-line" />
          <circle cx={286 + i * 7} cy={y + 23} r="10" fill={soft} className="object-soft" />
          <Check x={286 + i * 7} y={y + 23} />
        </g>
      ))}
    </ObjectCanvas>
  );
}

export default JourneyObject;
