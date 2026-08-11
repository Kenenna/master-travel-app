import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter, WhatsAppBubble } from "@/components/site-footer";

export const Route = createFileRoute("/driver-portal - Copy")({
  head: () => ({
    meta: [
      { title: "Driver Portal — Master Travel Group" },
      { name: "description", content: "Sign in to the Master Travel Group driver portal for jobs, schedules and payments." },
      { property: "og:title", content: "Driver Portal — Master Travel Group" },
      { property: "og:description", content: "Chauffeur sign-in for jobs, schedules and payments." },
    ],
  }),
  component: DriverPortal,
});

function DriverPortal() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--ink)] text-white">
      <SiteHeader />
      <section className="flex min-h-[calc(100vh-96px)] items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          <div className="text-center">
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.3em]" style={{ color: "var(--gold)" }}>
              Chauffeur Access
            </span>
            <h1 className="mt-4 font-serif text-4xl">Driver Portal</h1>
            <span className="gold-divider mx-auto mt-6" />
            <p className="mt-6 text-white/70">
              Sign in to view your assigned jobs, weekly schedule and payment history.
            </p>
          </div>

          {submitted ? (
            <div className="mt-10 rounded-lg border border-white/15 bg-white/5 p-8 text-center">
              <p className="text-white/80">
                Portal access is coming soon. Your details have been noted — the team will contact you when your account is ready.
              </p>
              <Link to="/" className="btn-gold mt-8">Return Home</Link>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
              className="mt-10 space-y-5 rounded-lg border border-white/15 bg-white/5 p-8"
            >
              <div>
                <label className="block text-[0.65rem] font-medium uppercase tracking-[0.25em] text-white/60">Email</label>
                <input required type="email" name="email" className="mt-2 w-full rounded border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[var(--gold)] focus:outline-none" />
              </div>
              <div>
                <label className="block text-[0.65rem] font-medium uppercase tracking-[0.25em] text-white/60">Password</label>
                <input required type="password" name="password" className="mt-2 w-full rounded border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[var(--gold)] focus:outline-none" />
              </div>
              <button type="submit" className="btn-gold w-full">Sign In</button>
              <p className="text-center text-xs text-white/50">
                Not registered yet? <Link to="/contact" className="underline" style={{ color: "var(--gold)" }}>Contact the team</Link>
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
