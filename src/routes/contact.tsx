import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter, WhatsAppBubble, PageHero } from "@/components/site-footer";
import corporateImg from "@/assets/service-corporate.jpg";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Master Travel Group" },
      { name: "description", content: "Speak with the Master Travel Group team. Chauffeur bookings, quotes and account enquiries across Ireland." },
      { property: "og:title", content: "Contact — Master Travel Group" },
      { property: "og:description", content: "Get in touch — we reply within the hour." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader transparent />
      <PageHero
        eyebrow="Contact"
        title="Speak with our team."
        subtitle="Bookings, quotes, corporate accounts and bespoke enquiries."
        image={corporateImg}
      />

      <section className="py-24">
        <div className="mx-auto grid max-w-[1100px] gap-16 px-6 md:grid-cols-[1fr_1.2fr]">
          <div className="space-y-8">
            <div>
              <span className="eyebrow">Call</span>
              <div className="mt-2 font-serif text-2xl">+353 (0) 00 000 0000</div>
            </div>
            <div>
              <span className="eyebrow">Email</span>
              <div className="mt-2 font-serif text-2xl">hello@mastertravelgroup.com</div>
            </div>
            <div>
              <span className="eyebrow">Hours</span>
              <div className="mt-2 text-muted-foreground">24 hours · 7 days a week</div>
            </div>
            <div>
              <span className="eyebrow">Coverage</span>
              <div className="mt-2 text-muted-foreground">Republic of Ireland, nationwide</div>
            </div>
          </div>

          {sent ? (
            <div className="rounded-lg border border-[var(--gold)]/40 bg-white p-10 shadow-sm">
              <span className="eyebrow">Sent</span>
              <h2 className="mt-4 font-serif text-3xl">Thank you.</h2>
              <span className="gold-divider mt-6" />
              <p className="mt-6 text-muted-foreground">
                We&rsquo;ve received your message and will respond within the hour.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setSent(true); }}
              className="space-y-5 rounded-lg border border-border bg-white p-8 shadow-sm"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Name" name="name" required />
                <Input label="Phone" name="phone" type="tel" />
              </div>
              <Input label="Email" name="email" type="email" required />
              <Input label="Subject" name="subject" />
              <div>
                <label className="block text-[0.7rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">Message</label>
                <textarea name="message" rows={5} required className="mt-2 w-full rounded border border-input bg-white px-3 py-2 text-sm focus:border-[var(--gold)] focus:outline-none" />
              </div>
              <button type="submit" className="btn-gold w-full">Send Message</button>
            </form>
          )}
        </div>
      </section>

      <SiteFooter />
      <WhatsAppBubble />
    </div>
  );
}

function Input({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-[0.7rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
      <input name={name} type={type} required={required} className="mt-2 w-full rounded border border-input bg-white px-3 py-2 text-sm focus:border-[var(--gold)] focus:outline-none" />
    </div>
  );
}
