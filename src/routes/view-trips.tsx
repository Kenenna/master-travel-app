import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter, WhatsAppBubble } from "@/components/site-footer";
import {
  getDriverProfile,
  getDriverBookings,
  acceptDriverBooking,
  type DriverBooking,
} from "@/utils/driver-portal";

export const Route = createFileRoute("/view-trips")({
  head: () => ({
    meta: [
      { title: "Available Trips — Master Travel Group" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ViewTrips,
});

function formatDate(d: string | null) {
  if (!d) return "—";
  const parts = d.split("-");
  if (parts.length !== 3) return d;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parts[2]} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
}

function formatTime(t: string | null) {
  if (!t) return "";
  const [hStr, mStr] = t.split(":");
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${mStr || "00"} ${ampm}`;
}

function ViewTrips() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [driverId, setDriverId] = useState<number | null>(null);
  const [driverStatus, setDriverStatus] = useState<string | null>(null);
  const [bookings, setBookings] = useState<DriverBooking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [tripTypeFilter, setTripTypeFilter] = useState("all");
  const [carClassFilter, setCarClassFilter] = useState("all");
  const [showMineOnly, setShowMineOnly] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("driver_token") : null;

  const loadBookings = async (authToken: string) => {
    try {
      const result = await getDriverBookings({ data: { token: authToken } });
      setBookings(result.bookings);
      setDriverId(result.current_driver_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load bookings");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate({ to: "/driver-portal" });
      return;
    }

    getDriverProfile({ data: { token } })
      .then(async (profile) => {
        setDriverStatus(profile.status);
        if (profile.status === "APPROVED") {
          await loadBookings(token);
        }
        setLoading(false);
      })
      .catch((err) => {
        localStorage.removeItem("driver_token");
        localStorage.removeItem("driver");
        setError(err instanceof Error ? err.message : "Session expired");
        setLoading(false);
        setTimeout(() => navigate({ to: "/driver-portal" }), 2000);
      });
  }, [navigate, token]);

  const handleRefresh = async () => {
    if (!token) return;
    setLoading(true);
    await loadBookings(token);
    setLoading(false);
  };

  const handleAccept = async (bookingId: number) => {
    if (!token) return;
    setAcceptingId(bookingId);
    setStatusMsg(null);
    try {
      await acceptDriverBooking({ data: { token, booking_id: bookingId } });
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, is_taken: "yes", driver_id: driverId } : b))
      );
      setStatusMsg({ type: "success", text: "Booking accepted." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not accept booking";
      if (msg.toLowerCase().includes("already been accepted")) {
        // Someone else took it while it was on screen — refresh so state matches the DB.
        await loadBookings(token);
      }
      setStatusMsg({ type: "error", text: msg });
    } finally {
      setAcceptingId(null);
    }
  };

  const tripTypes = useMemo(
    () => Array.from(new Set(bookings.map((b) => b.trip_type).filter(Boolean))),
    [bookings]
  );
  const carClasses = useMemo(
    () => Array.from(new Set(bookings.map((b) => b.car_class).filter(Boolean))),
    [bookings]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      if (tripTypeFilter !== "all" && b.trip_type !== tripTypeFilter) return false;
      if (carClassFilter !== "all" && b.car_class !== carClassFilter) return false;
      if (showMineOnly && !(b.is_taken === "yes" && b.driver_id === driverId)) return false;
      if (q) {
        const haystack = [
          b.booking_reference,
          b.pickup_address,
          b.dropoff_address,
          b.first_name,
          b.last_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [bookings, search, tripTypeFilter, carClassFilter, showMineOnly, driverId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--ink)] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent" />
          <p className="text-white/60">Loading trips…</p>
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

  if (driverStatus !== "APPROVED") {
    return (
      <div className="min-h-screen bg-[var(--ink)] text-white">
        <SiteHeader />
        <section className="px-6 py-20">
          <div className="mx-auto w-full max-w-2xl text-center">
            <h1 className="font-serif text-3xl">Available Trips</h1>
            <div className="mt-8 rounded border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              Your partner account must be approved before you can view or accept trips.
            </div>
          </div>
        </section>
        <SiteFooter />
        <WhatsAppBubble />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--ink)] text-white">
      <SiteHeader />
      <section className="px-6 py-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[0.7rem] font-medium uppercase tracking-[0.3em]" style={{ color: "var(--gold)" }}>
                Driver Area
              </span>
              <h1 className="mt-2 font-serif text-3xl">Available Trips</h1>
            </div>
            <button
              onClick={handleRefresh}
              className="rounded border border-white/20 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
            >
              Refresh
            </button>
          </div>

          {statusMsg && (
            <div
              className={`mt-6 rounded border p-3 text-sm ${
                statusMsg.type === "success"
                  ? "border-green-400/50 bg-green-500/10 text-green-200"
                  : "border-red-400/50 bg-red-500/10 text-red-200"
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3 rounded-lg border border-white/15 bg-white/5 p-4">
            <input
              type="text"
              placeholder="Search reference, address, or customer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-w-[220px] flex-1 rounded border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[var(--gold)] focus:outline-none"
            />
            <select
              value={tripTypeFilter}
              onChange={(e) => setTripTypeFilter(e.target.value)}
              className="rounded border border-white/20 bg-transparent px-3 py-2 text-sm text-white focus:border-[var(--gold)] focus:outline-none [&>option]:text-black"
            >
              <option value="all">All trip types</option>
              {tripTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={carClassFilter}
              onChange={(e) => setCarClassFilter(e.target.value)}
              className="rounded border border-white/20 bg-transparent px-3 py-2 text-sm text-white focus:border-[var(--gold)] focus:outline-none [&>option]:text-black"
            >
              <option value="all">All car classes</option>
              {carClasses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input
                type="checkbox"
                checked={showMineOnly}
                onChange={(e) => setShowMineOnly(e.target.checked)}
                className="h-4 w-4 rounded border-white/30 text-[var(--gold)] focus:ring-[var(--gold)]"
              />
              My trips only
            </label>
          </div>

          <div className="mt-6 overflow-x-auto rounded-lg border border-white/15 bg-white/5">
            {filtered.length === 0 ? (
              <p className="p-8 text-center text-white/50">No trips match your filters.</p>
            ) : (
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-white/15 text-left text-[0.7rem] uppercase tracking-wider text-white/50">
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Trip</th>
                    <th className="px-4 py-3">Pickup</th>
                    <th className="px-4 py-3">Dropoff</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Date &amp; Time</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Earnings</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => {
                    const takenByMe = b.is_taken === "yes" && b.driver_id === driverId;
                    const takenByOther = b.is_taken === "yes" && b.driver_id !== driverId;
                    const earnings = (0.75 * parseFloat(b.total_amount || "0")).toFixed(2);

                    return (
                      <tr key={b.id} className="border-b border-white/10 last:border-0">
                        <td className="px-4 py-3 font-medium">{b.booking_reference}</td>
                        <td className="px-4 py-3">{b.trip_type}</td>
                        <td className="px-4 py-3 max-w-[180px]">{b.pickup_address}</td>
                        <td className="px-4 py-3 max-w-[180px]">{b.dropoff_address}</td>
                        <td className="px-4 py-3">{b.car_class}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatDate(b.select_date)}<br />
                          <span className="text-white/50">{formatTime(b.select_time)}</span>
                        </td>
                        <td className="px-4 py-3">
                          {[b.first_name, b.last_name].filter(Boolean).join(" ") || "—"}
                          {b.phone_number && <><br /><span className="text-white/50">{b.phone_number}</span></>}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">€{earnings}</td>
                        <td className="px-4 py-3">
                          <button
                            disabled={takenByOther || acceptingId === b.id}
                            onClick={() => handleAccept(b.id)}
                            className={`rounded px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                              takenByMe
                                ? "bg-red-600 text-white cursor-not-allowed opacity-85"
                                : takenByOther
                                ? "bg-white/10 text-white/40 cursor-not-allowed"
                                : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                          >
                            {acceptingId === b.id
                              ? "Accepting…"
                              : takenByMe
                              ? "Taken by me"
                              : takenByOther
                              ? "Taken"
                              : "Accept"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
      <SiteFooter />
      <WhatsAppBubble />
    </div>
  );
}