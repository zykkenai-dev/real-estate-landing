import type { ReactNode } from 'react';

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

function Arrow({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M ${x - 4} ${y - 5} l 4 5 4 -5`}
      className="object-line"
      stroke={stroke}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function Calendar({ x, y, dark = false }: { x: number; y: number; dark?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="24" height="24" rx="5" stroke={dark ? paper : ink} strokeWidth="1.4" />
      <path d="M0 8H24 M7 -2V3 M17 -2V3" stroke={dark ? paper : ink} strokeWidth="1.4" strokeLinecap="round" />
      <Check x={12} y={16} light={dark} />
    </g>
  );
}

export function JourneyObject() {
  return (
    <ObjectCanvas className="journey-object" viewBox="0 0 460 460">
      <path
        d="M115 80V108Q115 119 104 119H94Q82 119 82 131V135 M174 230V255Q174 269 188 269H231Q245 269 245 283 M332 335V352Q332 367 317 367H210V370"
        className="object-line"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <Arrow x={82} y={135} />
      <Arrow x={245} y={283} />
      <Arrow x={210} y={370} />

      <rect x="30" y="30" width="170" height="50" rx="25" className="object-paper" fill={paper} stroke={stroke} />
      <circle cx="57" cy="55" r="10" className="object-soft" fill={soft} />
      <path d="M53 55H61M57 51V59" stroke={ink} strokeWidth="1.3" strokeLinecap="round" />
      <text x="76" y="60" fill={ink} className="object-label" fontSize="13" fontFamily="inherit">New enquiry</text>

      <rect x="40" y="135" width="170" height="95" rx="12" className="object-paper" fill={paper} stroke={stroke} />
      <path d="M60 155H75V166H66L61 170V166H60V155Z" stroke={ink} strokeWidth="1.3" strokeLinejoin="round" />
      <text x="84" y="166" fill={ink} className="object-label" fontSize="12" fontFamily="inherit">First response</text>
      <path d="M60 190H173M60 203H141" className="object-line" stroke={stroke} strokeWidth="4" strokeLinecap="round" />

      <path d="M210 181H285Q300 181 300 196V222" stroke={stroke} strokeWidth="1.3" strokeDasharray="3 5" className="object-line" />
      <circle cx="300" cy="203" r="12" fill="#f8f9f6" className="object-soft" />
      <text x="300" y="207" textAnchor="middle" fontSize="13" fontFamily="inherit" fill={ink}>?</text>

      <rect x="245" y="230" width="175" height="105" rx="12" className="object-paper" fill={paper} stroke={stroke} />
      <text x="265" y="255" fill={ink} className="object-label" fontSize="12" fontFamily="inherit">Agent follow-up</text>
      {[277, 295, 313].map((y, i) => (
        <g key={y}>
          <circle cx="270" cy={y} r="6" fill={soft} className="object-soft" />
          <path d={`M267 ${y}l2 2 4-4`} stroke={ink} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M287 ${y}H${i === 1 ? 377 : 393}`} stroke={stroke} strokeWidth="3" strokeLinecap="round" className="object-line" />
        </g>
      ))}

      <rect x="90" y="370" width="240" height="64" rx="12" fill={ink} className="object-ink" />
      <Calendar x={111} y={390} dark />
      <text x="149" y="407" fill={paper} className="object-light" fontSize="13" fontFamily="inherit">Viewing arranged</text>
      <circle cx="305" cy="402" r="9" fill="none" stroke="#656565" />
      <path d="M302 402H308M306 399L309 402 306 405" stroke={paper} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </ObjectCanvas>
  );
}

export function ResponseObject() {
  return (
    <ObjectCanvas className="response-object">
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
    <ObjectCanvas className="followup-object">
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
    <ObjectCanvas className="viewing-object">
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
    <ObjectCanvas className="report-object" viewBox="0 0 360 240">
      {[40, 99, 158].map((y, i) => (
        <g key={y}>
          <rect x={36 + i * 7} y={y} width="274" height="46" rx="8" fill={paper} stroke={stroke} className="object-paper" />
          <text x={55 + i * 7} y={y + 29} fill={ink} fontSize="12" fontFamily="inherit" className="object-label">0{i + 1}</text>
          <path d={`M${87 + i * 7} ${y + 23}H${223 - i * 11}`} stroke={stroke} strokeWidth="4" strokeLinecap="round" className="object-line" />
          <circle cx={286 + i * 7} cy={y + 23} r="10" fill={soft} className="object-soft" />
          <Check x={286 + i * 7} y={y + 23} />
        </g>
      ))}
    </ObjectCanvas>
  );
}

export function ProcessObject({ stage }: { stage: 'request' | 'review' | 'receive' }) {
  if (stage === 'request') {
    return (
      <ObjectCanvas className="process-object request-object" viewBox="0 0 180 120">
        <rect x="39" y="15" width="102" height="91" rx="8" fill={paper} stroke={stroke} className="object-paper" />
        <path d="M55 35H95M55 52H124M55 69H124" stroke={stroke} strokeWidth="3" strokeLinecap="round" className="object-line" />
        <rect x="96" y="82" width="29" height="11" rx="5.5" fill={ink} className="object-ink" />
        <path d="M106 87.5H115M112 85L115 87.5 112 90" stroke={paper} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </ObjectCanvas>
    );
  }

  if (stage === 'review') {
    return (
      <ObjectCanvas className="process-object review-object" viewBox="0 0 180 120">
        <path d="M29 43H92M29 60H103M29 77H83" stroke={stroke} strokeWidth="3" strokeLinecap="round" className="object-line" />
        <circle cx="107" cy="53" r="28" fill={paper} stroke={ink} strokeWidth="1.5" className="object-paper" />
        <circle cx="107" cy="53" r="17" stroke={stroke} strokeDasharray="2 4" className="object-line" />
        <Check x={107} y={53} />
        <path d="M128 75L148 95" stroke={ink} strokeWidth="5" strokeLinecap="round" className="object-ink-stroke" />
      </ObjectCanvas>
    );
  }

  return (
    <ObjectCanvas className="process-object receive-object" viewBox="0 0 180 120">
      <rect x="51" y="17" width="79" height="89" rx="7" fill={soft} stroke={stroke} className="object-soft" />
      <rect x="42" y="11" width="79" height="89" rx="7" fill={paper} stroke={stroke} className="object-paper" />
      <path d="M56 31H87M56 47H105M56 61H105M56 75H86" stroke={stroke} strokeWidth="3" strokeLinecap="round" className="object-line" />
      <circle cx="124" cy="87" r="17" fill={ink} className="object-ink" />
      <Check x={124} y={87} light />
    </ObjectCanvas>
  );
}

export default JourneyObject;
