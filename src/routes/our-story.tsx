import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter, WhatsAppBubble, PageHero } from "@/components/site-footer";
import heroCar from "@/assets/hero-car.jpg";

export const Route = createFileRoute("/our-story")({
  head: () => ({
    meta: [
      { title: "Our Story — Master Travel Group" },
      { name: "description", content: "The story behind Master Travel Group — Ireland's award-winning executive chauffeur service." },
      { property: "og:title", content: "Our Story — Master Travel Group" },
      { property: "og:description", content: "Committed to excellence. The people and principles behind every journey." },
    ],
  }),
  component: OurStory,
});

function OurStory() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader transparent />
      <PageHero
        eyebrow="Our Story"
        title="Committed to excellence."
        subtitle="A boutique chauffeur company built on discretion, presentation and precision."
        image={heroCar}
      />

      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 space-y-8 text-lg leading-relaxed text-muted-foreground">
          <p>
            Master Travel Group was founded on a simple belief: that travel should feel effortless.
            From the first phone call to the moment you step out at your destination, every detail
            is considered, refined and delivered with quiet precision.
          </p>
          <p>
            Our chauffeurs are professionally trained, immaculately presented and thoroughly
            vetted. Our vehicles are hand-selected, maintained to the highest standards and
            equipped with everything you need to arrive at your best.
          </p>
          <p>
            Whether you&rsquo;re a first-time client or a long-standing partner, we treat every
            journey as an opportunity to earn your trust.
          </p>
        </div>
      </section>

      <section className="bg-[var(--ink)] py-24 text-white md:py-32">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="text-center">
            <span className="eyebrow">The Principles</span>
            <h2 className="mt-6 font-serif text-4xl md:text-5xl">What we stand for.</h2>
            <span className="gold-divider mx-auto mt-8" />
          </div>
          <div className="mt-16 grid gap-10 md:grid-cols-3">
            {[
              { t: "Discretion", b: "Confidential, professional service — from private clients to corporate accounts." },
              { t: "Precision", b: "Punctuality is non-negotiable. Every journey is planned, monitored and delivered on time." },
              { t: "Presentation", b: "Immaculate vehicles and impeccably presented chauffeurs, without exception." },
            ].map((p) => (
              <div key={p.t}>
                <div className="font-serif text-3xl" style={{ color: "var(--gold)" }}>{p.t}</div>
                <span className="gold-divider mt-4" />
                <p className="mt-4 text-white/75">{p.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="font-serif text-3xl md:text-4xl">Ready to travel with us?</h2>
          <span className="gold-divider mx-auto mt-6" />
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/book" className="btn-gold">Book A Ride</Link>
            <Link to="/contact" className="btn-gold">Contact Us</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
      <WhatsAppBubble />
    </div>
  );
}
