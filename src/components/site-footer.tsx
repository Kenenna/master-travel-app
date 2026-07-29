import { Link } from "@tanstack/react-router";
import mtgLogo from "@/assets/mtg-logo.png";

export function SiteFooter() {
  return (
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
            <li><Link to="/services" className="hover:text-white">Airport Transfers</Link></li>
            <li><Link to="/services" className="hover:text-white">Luxury Transport</Link></li>
            <li><Link to="/services" className="hover:text-white">Corporate Travel</Link></li>
            <li><Link to="/services" className="hover:text-white">Wedding Transport</Link></li>
            <li><Link to="/special-services" className="hover:text-white">Private Tours</Link></li>
            <li><Link to="/special-services" className="hover:text-white">Luxury Delivery</Link></li>
          </ul>
        </div>
        <div>
          <div className="mb-4 text-[0.7rem] tracking-[0.3em] uppercase" style={{ color: "var(--gold)" }}>
            Company
          </div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/our-story" className="hover:text-white">Our Story</Link></li>
            <li><Link to="/driver-portal" className="hover:text-white">Driver Portal</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
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
          <Link to="/book" className="btn-gold mt-6">Book A Ride</Link>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-[1300px] border-t border-white/10 px-6 pt-6 text-xs text-white/40">
        © {new Date().getFullYear()} Master Travel Group. All rights reserved.
      </div>
    </footer>
  );
}

export function WhatsAppBubble() {
  return (
    <a
      href="https://wa.me/353000000000"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
    >
      <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden>
        <path d="M20.52 3.48A11.86 11.86 0 0 0 12.02 0C5.42 0 .06 5.36.06 11.96c0 2.1.55 4.16 1.6 5.98L0 24l6.22-1.63a11.9 11.9 0 0 0 5.8 1.48h.01c6.6 0 11.96-5.36 11.96-11.96 0-3.2-1.25-6.2-3.47-8.41ZM12.03 21.3h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.22-3.7.97.99-3.6-.24-.37a9.86 9.86 0 0 1-1.5-5.25c0-5.47 4.46-9.93 9.94-9.93 2.66 0 5.15 1.04 7.03 2.92a9.86 9.86 0 0 1 2.9 7.02c0 5.48-4.46 9.94-9.94 9.94Zm5.45-7.44c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.8-1.49-1.78-1.66-2.08-.17-.3-.02-.46.13-.6.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.11 3.22 5.11 4.51.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z" />
      </svg>
    </a>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  image: string;
}) {
  return (
    <section className="relative min-h-[60vh] w-full overflow-hidden">
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/60" />
      <div className="relative z-10 mx-auto flex min-h-[60vh] max-w-[1200px] flex-col items-center justify-center px-6 pt-28 pb-16 text-center">
        <span className="text-[0.7rem] font-medium uppercase tracking-[0.3em]" style={{ color: "var(--gold)" }}>
          {eyebrow}
        </span>
        <h1 className="mt-6 font-serif text-4xl leading-tight text-white sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <span className="gold-divider mt-8" />
        {subtitle && (
          <p className="mt-6 max-w-2xl text-base text-white/85 md:text-lg">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
