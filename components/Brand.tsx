export default function Brand({ light = false }: { light?: boolean }) {
  return <a className={`brand${light ? " brand-light" : ""}`} href="https://www.zykken.com" aria-label="Zykken home">
    <span className="brand-icon"><img src="/assets/zykken-monogram-transparent.png" alt="" width="1254" height="1254" /></span>
    <span className="brand-wordmark"><img src="/assets/zykken-wordmark-transparent.png" alt="Zykken" width="2172" height="724" /></span>
  </a>;
}
