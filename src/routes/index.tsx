import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import heroCar from "@/assets/hero-car.jpg";
import mtgLogo from "@/assets/mtg-logo.png";
import airportImg from "@/assets/service-airport.jpg";
import weddingImg from "@/assets/service-wedding.jpg";
import corporateImg from "@/assets/service-corporate.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Master Travel Group — Luxury Chauffeur Service in Ireland" },
      {
        name: "description",
        content:
          "Executive chauffeur services designed for seamless travel across Ireland. Airport transfers, corporate travel, weddings, private tours and luxury delivery.",
      },
      { property: "og:title", content: "Master Travel Group — Luxury Chauffeur Service in Ireland" },
      {
        property: "og:description",
        content: "Where luxury meets the road. Seamless chauffeured travel across Ireland.",
      },
    ],
  }),
  component: Home,
});

const services = [
  {
    tag: "Airport & Terminal",
    title: "Airport Transfers",
    body:
      "Seamless door-to-terminal service with flight monitoring and meet-and-greet. Stress-free travel begins the moment you land.",
    image: airportImg,
  },
  {
    tag: "Premium Fleet",
    title: "Luxury Transport",
    body:
      "A curated fleet of prestige vehicles delivers an unrivalled travel experience, whether for city journeys or long-distance trips.",
    image: heroCar,
  },
  {
    tag: "Business Travel",
    title: "Corporate & Business",
    body:
      "Premier transportation for executives and teams — punctual, professional, and tailored to your corporate schedule.",
    image: corporateImg,
  },
  {
    tag: "Special Occasions",
    title: "Luxury Wedding Transport",
    body:
      "Make your most cherished day unforgettable. Impeccably presented vehicles and discreet, seamless service for the entire wedding party.",
    image: weddingImg,
  },
];

function Home() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="absolute top-0 left-0 right-0 z-30">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-6 md:px-10">
          <Link to="/" className="flex items-center gap-3">
            <img src={mtgLogo} alt="" width={44} height={44} className="h-11 w-11" />
            <div className="hidden text-white sm:block">
              <div className="font-serif text-lg leading-none tracking-wide" style={{ color: "var(--gold)" }}>
                MASTER TRAVEL GROUP
              </div>
              <div
                className="mt-1 text-[0.6rem] tracking-[0.3em]"
                style={{ color: "var(--gold-soft)" }}
              >
                YOUR JOURNEY, OUR PRIORITY
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-9 text-[0.78rem] tracking-[0.18em] uppercase text-white lg:flex">
            <a href="#home" className="hover:text-[var(--gold)] transition">Home</a>
            <a href="#story" className="hover:text-[var(--gold)] transition">Our Story</a>
            <a href="#services" className="hover:text-[var(--gold)] transition">Services</a>
            <a href="#book" className="hover:text-[var(--gold)] transition">Book</a>
            <a href="#special" className="hover:text-[var(--gold)] transition">Special Services</a>
            <a href="#contact" className="hover:text-[var(--gold)] transition">Contact</a>
          </nav>

          <a href="#driver" className="hidden btn-outline-light lg:inline-flex">Driver Portal</a>

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
            <a href="#story" className="block">Our Story</a>
            <a href="#services" className="block">Services</a>
            <a href="#book" className="block">Book</a>
            <a href="#special" className="block">Special Services</a>
            <a href="#contact" className="block">Contact</a>
            <a href="#driver" className="block" style={{ color: "var(--gold)" }}>Driver Portal</a>
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="home" className="relative min-h-[92vh] w-full overflow-hidden">
        <img
          src={heroCar}
          alt="Luxury chauffeur car outside a stately estate"
          width={1920}
          height={1200}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/40" />
        <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-[1400px] flex-col items-center justify-center px-6 text-center">
          <h1 className="font-serif text-5xl leading-[1.05] text-white sm:text-6xl md:text-7xl lg:text-[5.5rem]">
            Where luxury meets<br />the road.
          </h1>
          <span className="gold-divider mt-8" />
          <p className="mt-6 max-w-xl text-base text-white/90 md:text-lg">
            Executive chauffeur services designed for seamless travel across Ireland.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a href="#special" className="btn-gold">Special Services</a>
            <a href="#book" className="btn-gold">Book A Ride</a>
            <a href="#book" className="btn-gold">Book A Delivery</a>
          </div>
        </div>
      </section>

      {/* COMMITTED */}
      <section id="story" className="py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="eyebrow">Committed to Excellence</span>
          <h2 className="mt-6 font-serif text-4xl md:text-5xl">
            Every journey, distinguished.
          </h2>
          <span className="gold-divider mx-auto mt-8" />
          <p className="mt-8 text-base leading-relaxed text-muted-foreground md:text-lg">
            Our commitment to excellence and attention to detail ensures a seamless, comfortable and
            distinguished experience for every client. Whether you&rsquo;re stepping out for an
            important corporate event, making a grand entrance at your wedding, or ensuring the safe
            delivery of your treasured possessions — Master Travel Group is at your service.
          </p>
          <p className="mt-6 font-serif text-lg italic text-foreground">
            We offer a price-match guarantee. We promise to match any quote given to you by another company.
          </p>
          <a href="#contact" className="btn-gold mt-10">Contact Us</a>
        </div>
      </section>

      {/* AWARD */}
      <section className="relative bg-[var(--ink)] py-24 text-white md:py-32">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-6 md:grid-cols-[280px_1fr] md:items-center">
          <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-full border border-[var(--gold)]/40 md:mx-0">
            <div className="text-center">
              <div className="font-serif text-xs tracking-[0.4em]" style={{ color: "var(--gold)" }}>
                PRESTIGE
              </div>
              <div className="mt-2 font-serif text-5xl" style={{ color: "var(--gold)" }}>
                2025<span className="text-white/60">/</span>26
              </div>
              <div className="mt-2 text-[0.6rem] tracking-[0.4em] text-white/60">AWARDS</div>
              <div className="mx-auto mt-4 h-px w-16 bg-[var(--gold)]" />
              <div className="mt-3 text-[0.65rem] tracking-[0.3em] text-white/70">WINNER</div>
            </div>
          </div>
          <div>
            <span className="eyebrow">Prestige Awards 2025/26</span>
            <h3 className="mt-4 font-serif text-3xl md:text-4xl">
              Awarded <em style={{ color: "var(--gold)" }}>Luxury Travel Company of the Year</em>
            </h3>
            <span className="gold-divider mt-6" />
            <p className="mt-6 text-white/75 leading-relaxed">
              Master Travel Group has been recognised as the Luxury Travel Company of the Year in the
              Republic of Ireland — a testament to our unwavering commitment to excellence, luxury,
              and bespoke service. We are proud to deliver an unparalleled experience to every client
              and every journey.
            </p>
            <p className="mt-4 text-xs tracking-[0.25em] uppercase text-white/50">
              Republic of Ireland · Prestige Awards 2025/26
            </p>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 md:py-32">
        <div className="mx-auto max-w-[1300px] px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Our Services</span>
            <h2 className="mt-6 font-serif text-4xl md:text-5xl">A fleet at your service.</h2>
            <span className="gold-divider mx-auto mt-8" />
          </div>

          <div className="mt-16 grid gap-10 md:grid-cols-2">
            {services.map((s) => (
              <article key={s.title} className="group">
                <div className="relative overflow-hidden">
                  <img
                    src={s.image}
                    alt={s.title}
                    loading="lazy"
                    width={1200}
                    height={900}
                    className="h-[320px] w-full object-cover transition-transform duration-700 group-hover:scale-105 md:h-[380px]"
                  />
                  <div className="absolute inset-0 bg-black/25 transition-opacity duration-500 group-hover:bg-black/15" />
                  <div className="absolute left-0 right-0 top-6 text-center text-[0.65rem] tracking-[0.35em] uppercase text-white/85">
                    {s.tag}
                  </div>
                </div>
                <div className="pt-6">
                  <h3 className="font-serif text-2xl md:text-3xl">{s.title}</h3>
                  <span className="gold-divider mt-4" />
                  <p className="mt-5 text-muted-foreground leading-relaxed">{s.body}</p>
                  <a
                    href="#book"
                    className="mt-6 inline-flex items-center gap-3 text-[0.72rem] font-medium uppercase tracking-[0.25em]"
                    style={{ color: "var(--gold)" }}
                  >
                    Explore Service
                    <span aria-hidden>→</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section
        id="book"
        className="relative overflow-hidden bg-[var(--ink)] py-24 text-center text-white"
      >
        <div className="mx-auto max-w-3xl px-6">
          <span className="eyebrow">Reserve Your Journey</span>
          <h2 className="mt-6 font-serif text-4xl md:text-5xl">
            Travel, refined to the last detail.
          </h2>
          <span className="gold-divider mx-auto mt-8" />
          <p className="mt-6 text-white/75">
            Request a quote or reserve a chauffeur for your next journey across Ireland.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="#book" className="btn-gold">Book A Ride</a>
            <a href="#contact" className="btn-outline-light">Request A Quote</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="bg-black py-16 text-white/70">
        <div className="mx-auto grid max-w-[1300px] gap-10 px-6 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <img src={mtgLogo} alt="" width={40} height={40} className="h-10 w-10" />
              <div>
                <div className="font-serif text-sm tracking-wide" style={{ color: "var(--gold)" }}>
                  MASTER TRAVEL GROUP
                </div>
                <div className="text-[0.55rem] tracking-[0.3em]" style={{ color: "var(--gold-soft)" }}>
                  YOUR JOURNEY, OUR PRIORITY
                </div>
              </div>
            </div>
            <p className="mt-6 text-sm leading-relaxed">
              Executive chauffeur services across the Republic of Ireland.
            </p>
          </div>
          <div>
            <div className="mb-4 text-[0.7rem] tracking-[0.3em] uppercase" style={{ color: "var(--gold)" }}>
              Services
            </div>
            <ul className="space-y-2 text-sm">
              <li>Airport Transfers</li>
              <li>Luxury Transport</li>
              <li>Corporate Travel</li>
              <li>Wedding Transport</li>
              <li>Private Tours</li>
              <li>Luxury Delivery</li>
            </ul>
          </div>
          <div>
            <div className="mb-4 text-[0.7rem] tracking-[0.3em] uppercase" style={{ color: "var(--gold)" }}>
              Company
            </div>
            <ul className="space-y-2 text-sm">
              <li>Our Story</li>
              <li>Driver Portal</li>
              <li>Careers</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <div className="mb-4 text-[0.7rem] tracking-[0.3em] uppercase" style={{ color: "var(--gold)" }}>
              Contact
            </div>
            <ul className="space-y-2 text-sm">
              <li>Ireland</li>
              <li>+353 (0) 00 000 0000</li>
              <li>hello@mastertravelgroup.com</li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-[1300px] border-t border-white/10 px-6 pt-6 text-xs text-white/40">
          © {new Date().getFullYear()} Master Travel Group. All rights reserved.
        </div>
      </footer>

      {/* WhatsApp bubble */}
      <a
        href="#contact"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
      >
        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden>
          <path d="M20.52 3.48A11.86 11.86 0 0 0 12.02 0C5.42 0 .06 5.36.06 11.96c0 2.1.55 4.16 1.6 5.98L0 24l6.22-1.63a11.9 11.9 0 0 0 5.8 1.48h.01c6.6 0 11.96-5.36 11.96-11.96 0-3.2-1.25-6.2-3.47-8.41ZM12.03 21.3h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.22-3.7.97.99-3.6-.24-.37a9.86 9.86 0 0 1-1.5-5.25c0-5.47 4.46-9.93 9.94-9.93 2.66 0 5.15 1.04 7.03 2.92a9.86 9.86 0 0 1 2.9 7.02c0 5.48-4.46 9.94-9.94 9.94Zm5.45-7.44c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.8-1.49-1.78-1.66-2.08-.17-.3-.02-.46.13-.6.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.11 3.22 5.11 4.51.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z" />
        </svg>
      </a>
    </div>
  );
}
