import { Link } from "@tanstack/react-router";
import { useState } from "react";
import mtgLogo from "@/assets/mtg-logo.png";

const nav = [
  { to: "/", label: "Home" },
  { to: "/our-story", label: "Our Story" },
  { to: "/services", label: "Services" },
  { to: "/book", label: "Book" },
  { to: "/special-services", label: "Special Services" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const [open, setOpen] = useState(false);

  const wrapClass = transparent
    ? "absolute top-0 left-0 right-0 z-30"
    : "sticky top-0 z-30 bg-[var(--ink)]";

  return (
    <header className={wrapClass}>
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-6 md:px-10">
        <Link to="/" className="flex items-center gap-3">
          <img src={mtgLogo} alt="" width={44} height={44} className="h-11 w-11" />
          <div className="hidden text-white sm:block">
            <div className="font-serif text-lg leading-none tracking-wide" style={{ color: "var(--gold)" }}>
              MASTER TRAVEL GROUP
            </div>
            <div className="mt-1 text-[0.6rem] tracking-[0.3em]" style={{ color: "var(--gold-soft)" }}>
              YOUR JOURNEY, OUR PRIORITY
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-[0.78rem] tracking-[0.18em] uppercase text-white lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              activeProps={{ style: { color: "var(--gold)" } }}
              className="hover:text-[var(--gold)] transition"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <Link to="/driver-portal" className="hidden btn-outline-light lg:inline-flex">
          Driver Portal
        </Link>

        <button
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden text-white"
        >
          <div className="space-y-1.5">
            <span className="block h-px w-7 bg-white" />
            <span className="block h-px w-7 bg-white" />
            <span className="block h-px w-7 bg-white" />
          </div>
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-black/95 text-white px-6 py-6 space-y-4 text-sm tracking-[0.18em] uppercase">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="block"
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/driver-portal"
            onClick={() => setOpen(false)}
            className="block"
            style={{ color: "var(--gold)" }}
          >
            Driver Portal
          </Link>
        </div>
      )}
    </header>
  );
}
