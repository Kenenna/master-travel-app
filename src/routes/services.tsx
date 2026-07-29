import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter, WhatsAppBubble, PageHero } from "@/components/site-footer";
import heroCar from "@/assets/hero-car.jpg";
import airportImg from "@/assets/service-airport.jpg";
import weddingImg from "@/assets/service-wedding.jpg";
import corporateImg from "@/assets/service-corporate.jpg";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Master Travel Group" },
      { name: "description", content: "Airport transfers, corporate travel, luxury transport and wedding chauffeur services across Ireland." },
      { property: "og:title", content: "Services — Master Travel Group" },
      { property: "og:description", content: "A fleet at your service — bespoke chauffeur services across Ireland." },
    ],
  }),
  component: ServicesPage,
});

const services = [
  { title: "Airport Transfers", image: airportImg, body: "Door-to-terminal service with real-time flight monitoring, meet-and-greet, and complimentary refreshments. We handle luggage, timing and the entire arrival experience.", features: ["Flight tracking", "Meet & greet", "Luggage assistance", "Flexible pickup windows"] },
  { title: "Luxury Transport", image: heroCar, body: "A curated fleet of prestige saloons and SUVs for city journeys, long-distance travel and everything between. Impeccably maintained and driven by trained chauffeurs.", features: ["Executive saloons", "Luxury SUVs", "Long-distance travel", "City & inter-city"] },
  { title: "Corporate & Business", image: corporateImg, body: "Reliable, discreet transportation for executives, teams and visiting clients. Account-based billing, scheduled recurring travel and dedicated chauffeurs available.", features: ["Executive travel", "Roadshows", "Account billing", "Priority booking"] },
  { title: "Wedding Transport", image: weddingImg, body: "Immaculately presented vehicles and discreet, seamless service for the entire wedding party. Ribbons, red carpet arrival and a dedicated coordinator on the day.", features: ["Bridal car", "Party transfers", "Red carpet arrival", "On-the-day coordination"] },
];

function ServicesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader transparent />
      <PageHero
        eyebrow="Our Services"
        title="A fleet at your service."
        subtitle="Bespoke chauffeur services designed around your journey — from arrivals to occasions."
        image={heroCar}
      />

      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-[1200px] px-6 space-y-24">
          {services.map((s, i) => (
            <article key={s.title} className={`grid gap-10 md:grid-cols-2 md:items-center ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
              <div className="overflow-hidden">
                <img src={s.image} alt={s.title} loading="lazy" className="h-[380px] w-full object-cover" />
              </div>
              <div>
                <span className="eyebrow">0{i + 1}</span>
                <h2 className="mt-4 font-serif text-3xl md:text-4xl">{s.title}</h2>
                <span className="gold-divider mt-6" />
                <p className="mt-6 text-muted-foreground leading-relaxed">{s.body}</p>
                <ul className="mt-6 grid grid-cols-2 gap-2 text-sm">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span aria-hidden style={{ color: "var(--gold)" }}>◆</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/book" className="btn-gold mt-8">Book This Service</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
      <WhatsAppBubble />
    </div>
  );
}
