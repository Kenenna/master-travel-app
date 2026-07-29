import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter, WhatsAppBubble, PageHero } from "@/components/site-footer";
import weddingImg from "@/assets/service-wedding.jpg";
import heroCar from "@/assets/hero-car.jpg";
import corporateImg from "@/assets/service-corporate.jpg";

export const Route = createFileRoute("/special-services")({
  head: () => ({
    meta: [
      { title: "Special Services — Master Travel Group" },
      { name: "description", content: "Private tours, luxury delivery, red-carpet events and bespoke chauffeur services across Ireland." },
      { property: "og:title", content: "Special Services — Master Travel Group" },
      { property: "og:description", content: "Bespoke journeys and discreet delivery — designed around you." },
    ],
  }),
  component: SpecialServices,
});

const specials = [
  { title: "Private Ireland Tours", image: heroCar, body: "Bespoke multi-day tours across Ireland with a dedicated chauffeur-guide. Cliffs of Moher, Ring of Kerry, Wild Atlantic Way and beyond." },
  { title: "Luxury Delivery", image: corporateImg, body: "Discreet, insured delivery of high-value items — art, jewellery, documents and gifts — handled with executive-level care." },
  { title: "Red Carpet & Events", image: weddingImg, body: "Premieres, gala nights and private functions. Arrivals coordinated with venue and event staff for a seamless entrance." },
  { title: "VIP Concierge Travel", image: heroCar, body: "Multi-stop day itineraries with restaurant, hotel and appointment coordination handled by our concierge team." },
];

function SpecialServices() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader transparent />
      <PageHero
        eyebrow="Special Services"
        title="Bespoke, beyond the everyday."
        subtitle="For occasions that deserve more than transport. Tailored journeys, discreetly delivered."
        image={weddingImg}
      />

      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-[1200px] px-6 grid gap-10 md:grid-cols-2">
          {specials.map((s) => (
            <article key={s.title} className="group">
              <div className="overflow-hidden">
                <img src={s.image} alt={s.title} loading="lazy" className="h-[320px] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="pt-6">
                <h2 className="font-serif text-2xl md:text-3xl">{s.title}</h2>
                <span className="gold-divider mt-4" />
                <p className="mt-5 text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-20 max-w-2xl px-6 text-center">
          <h3 className="font-serif text-3xl">Something else in mind?</h3>
          <span className="gold-divider mx-auto mt-6" />
          <p className="mt-6 text-muted-foreground">
            If you have a specific requirement — even outside the list above — please get in touch. We build bespoke itineraries on request.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/contact" className="btn-gold">Request A Quote</Link>
            <Link to="/book" className="btn-gold">Book Now</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
      <WhatsAppBubble />
    </div>
  );
}
