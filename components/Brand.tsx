export default function Brand({
  light = false,
  linked = true,
}: {
  light?: boolean;
  linked?: boolean;
}) {
  const className = `brand${light ? " brand-light" : ""}`;
  const mark = (
    <>
      <span className="brand-icon"><img src="/assets/zykken-monogram-transparent.png" alt="" width="1254" height="1254" /></span>
      <span className="brand-wordmark"><img src="/assets/zykken-wordmark-transparent.png" alt="Zykken" width="2172" height="724" /></span>
    </>
  );

  return linked ? (
    <a className={className} href="https://www.zykken.com" aria-label="Zykken home">
      {mark}
    </a>
  ) : (
    <span className={className} role="img" aria-label="Zykken">
      {mark}
    </span>
  );
}
