import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter, WhatsAppBubble } from "@/components/site-footer";
import { getDriverProfile } from "@/utils/driver-portal";

export const Route = createFileRoute("/driver-dashboard")({
  head: () => ({
    meta: [
      { title: "Driver Dashboard — Master Travel Group" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DriverDashboard,
});

function DriverDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [driver, setDriver] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("driver_token");
    if (!token) {
      navigate({ to: "/driver-portal" });
      return;
    }

    getDriverProfile({ data: { token } })
      .then((data) => {
        setDriver(data);
        setLoading(false);
      })
      .catch((err) => {
        localStorage.removeItem("driver_token");
        localStorage.removeItem("driver");
        setError(err instanceof Error ? err.message : "Session expired");
        setTimeout(() => navigate({ to: "/driver-portal" }), 2000);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("driver_token");
    localStorage.removeItem("driver");
    navigate({ to: "/driver-portal" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--ink)] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent" />
          <p className="text-white/60">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--ink)] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-300">{error}</p>
          <p className="mt-2 text-white/40 text-sm">Redirecting…</p>
        </div>
      </div>
    );
  }

  const status = driver?.status || "PENDING_REVIEW";

  return (
    <div className="min-h-screen bg-[var(--ink)] text-white">
      <SiteHeader />
      <section className="px-6 py-20">
        <div className="mx-auto w-full max-w-4xl">
          <div className="text-center">
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.3em]" style={{ color: "var(--gold)" }}>
              Driver Area
            </span>
            <h1 className="mt-4 font-serif text-4xl">Welcome back, {driver.first_name}</h1>
            <span className="gold-divider mx-auto mt-6" />
          </div>

          {status === "APPROVED" && (
            <div className="mt-8 flex justify-center">
              <Link
                to="/view-trips"
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors"
                style={{ background: "var(--gold)", color: "var(--ink)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                View Available Trips
              </Link>
            </div>
          )}

          {status === "PENDING_REVIEW" && (
            <div className="mt-8 rounded border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              <strong>⏳ Application Under Review</strong> — Our team will be in touch within 48 hours.
            </div>
          )}
          {status === "REJECTED" && (
            <div className="mt-8 rounded border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
              <strong>❌ Application Not Approved</strong> — Please <a href="mailto:info@mastertravelgroup.com" className="underline">contact us</a> for more information.
            </div>
          )}
          {status === "SUSPENDED" && (
            <div className="mt-8 rounded border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
              <strong>⚠️ Account Suspended</strong> — Please <a href="mailto:info@mastertravelgroup.com" className="underline">contact us</a> to resolve this.
            </div>
          )}

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-white/15 bg-white/5 p-6">
              <h3 className="text-sm font-medium uppercase tracking-wider text-white/60">Status</h3>
              <p className="mt-2 text-lg font-semibold" style={{ color: "var(--gold)" }}>{status}</p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/5 p-6">
              <h3 className="text-sm font-medium uppercase tracking-wider text-white/60">Vehicle</h3>
              <p className="mt-2 text-lg font-semibold">{driver.vehicle_model || "—"}</p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/5 p-6">
              <h3 className="text-sm font-medium uppercase tracking-wider text-white/60">Member Since</h3>
              <p className="mt-2 text-lg font-semibold">{driver.member_since || "—"}</p>
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-white/15 bg-white/5 p-8">
            <h3 className="text-lg font-semibold text-white/90">Profile Details</h3>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-[0.65rem] font-medium uppercase tracking-[0.25em] text-white/60">Full Name</label>
                <p className="mt-1 text-sm">{driver.first_name} {driver.last_name}</p>
              </div>
              <div>
                <label className="block text-[0.65rem] font-medium uppercase tracking-[0.25em] text-white/60">Email</label>
                <p className="mt-1 text-sm">{driver.email}</p>
              </div>
              <div>
                <label className="block text-[0.65rem] font-medium uppercase tracking-[0.25em] text-white/60">Phone</label>
                <p className="mt-1 text-sm">{driver.driver_phone || "—"}</p>
              </div>
              <div>
                <label className="block text-[0.65rem] font-medium uppercase tracking-[0.25em] text-white/60">Licence Number</label>
                <p className="mt-1 text-sm">{driver.license_number || "—"}</p>
              </div>
              <div>
                <label className="block text-[0.65rem] font-medium uppercase tracking-[0.25em] text-white/60">Vehicle Type</label>
                <p className="mt-1 text-sm">{driver.vehicle_type || "—"}</p>
              </div>
              <div>
                <label className="block text-[0.65rem] font-medium uppercase tracking-[0.25em] text-white/60">Registration</label>
                <p className="mt-1 text-sm">{driver.vehicle_reg_number || "—"}</p>
              </div>
              <div>
                <label className="block text-[0.65rem] font-medium uppercase tracking-[0.25em] text-white/60">Year of Manufacture</label>
                <p className="mt-1 text-sm">{driver.year_of_manufacture || "—"}</p>
              </div>
              <div>
                <label className="block text-[0.65rem] font-medium uppercase tracking-[0.25em] text-white/60">Experience</label>
                <p className="mt-1 text-sm">{driver.years_experience || 0} years</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[0.65rem] font-medium uppercase tracking-[0.25em] text-white/60">Address</label>
                <p className="mt-1 text-sm">{driver.driver_address || "—"}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            {status === "APPROVED" && (
              <Link
                to="/view-trips"
                className="rounded border border-white/20 px-5 py-2 text-sm text-white/70 hover:bg-white/5"
              >
                View Available Trips
              </Link>
            )}
            <button onClick={handleLogout} className="btn-gold">
              Sign Out
            </button>
          </div>
        </div>
      </section>
      <SiteFooter />
      <WhatsAppBubble />
    </div>
  );
}