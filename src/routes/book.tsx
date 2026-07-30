import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter, WhatsAppBubble, PageHero } from "@/components/site-footer";
import { AddressAutocomplete, type AddressValue } from "@/components/address-autocomplete";
import heroCar from "@/assets/hero-car.jpg";
import { submitBooking, type BookingPayload } from "@/utils/booking";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book A Ride — Master Travel Group" },
      { name: "description", content: "Reserve a chauffeur for airport transfers, corporate travel, weddings and luxury delivery across Ireland." },
      { property: "og:title", content: "Book A Ride — Master Travel Group" },
      { property: "og:description", content: "Reserve your journey. We will confirm within one hour." },
    ],
  }),
  component: BookPage,
});

const serviceTypes = ["Airport Transfer", "Corporate Travel", "Wedding", "Private Tour", "Luxury Delivery", "Other"];
const vehicles = ["Executive Saloon", "Luxury SUV", "Executive People Carrier"];

function BookPage() {
  const [submitted, setSubmitted] = useState(false);
  const [pickup, setPickup] = useState<AddressValue>({ formatted: "" });
  const [dropoff, setDropoff] = useState<AddressValue>({ formatted: "" });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader transparent />
      <PageHero
        eyebrow="Reserve Your Journey"
        title="Book a chauffeur."
        subtitle="Share a few details and we will confirm your booking within one hour."
        image={heroCar}
      />

      <section className="py-24">
        <div className="mx-auto max-w-2xl px-6">
          {submitted ? (
            <div className="rounded-lg border border-[var(--gold)]/40 bg-white p-10 text-center shadow-sm">
              <span className="eyebrow">Received</span>
              <h2 className="mt-4 font-serif text-3xl">Thank you.</h2>
              <span className="gold-divider mx-auto mt-6" />
              <p className="mt-6 text-muted-foreground">
                Your request has been received. A member of our team will be in touch within the hour to confirm your journey.
              </p>
              <button onClick={() => setSubmitted(false)} className="btn-gold mt-8">Make Another Booking</button>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
              className="space-y-6 rounded-lg border border-border bg-white p-8 shadow-sm"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Full name" name="name" required />
                <Field label="Phone" name="phone" type="tel" required />
              </div>
              <Field label="Email" name="email" type="email" required />

              <div className="grid gap-4 md:grid-cols-2">
                <SelectField label="Service type" name="service" options={serviceTypes} />
                <SelectField label="Preferred vehicle" name="vehicle" options={vehicles} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Pickup date" name="date" type="date" required />
                <Field label="Pickup time" name="time" type="time" required />
              </div>

              <AddressAutocomplete
                label="Pickup location"
                name="from"
                required
                value={pickup}
                onChange={setPickup}
              />
              <AddressAutocomplete
                label="Destination"
                name="to"
                required
                value={dropoff}
                onChange={setDropoff}
              />

              <div>
                <label className="block text-[0.7rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">Notes</label>
                <textarea name="notes" rows={4} className="mt-2 w-full rounded border border-input bg-white px-3 py-2 text-sm focus:border-[var(--gold)] focus:outline-none" placeholder="Flight number, passengers, luggage, special requests…" />
              </div>

              <input type="hidden" name="pickup_lat" value={pickup.lat ?? ""} />
              <input type="hidden" name="pickup_lon" value={pickup.lon ?? ""} />
              <input type="hidden" name="dropoff_lat" value={dropoff.lat ?? ""} />
              <input type="hidden" name="dropoff_lon" value={dropoff.lon ?? ""} />

              <button type="submit" className="btn-gold w-full">Request Booking</button>
              <p className="text-center text-xs text-muted-foreground">
                We reply within one hour, seven days a week.
              </p>
            </form>
          )}
        </div>
      </section>

      <SiteFooter />
      <WhatsAppBubble />
    </div>
  );
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-[0.7rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
      <input name={name} type={type} required={required} className="mt-2 w-full rounded border border-input bg-white px-3 py-2 text-sm focus:border-[var(--gold)] focus:outline-none" />
    </div>
  );
}

function SelectField({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <div>
      <label className="block text-[0.7rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
      <select name={name} className="mt-2 w-full rounded border border-input bg-white px-3 py-2 text-sm focus:border-[var(--gold)] focus:outline-none">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

