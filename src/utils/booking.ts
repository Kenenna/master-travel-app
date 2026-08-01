import { createServerFn } from "@tanstack/react-start";
import { Agent } from "undici";

export type BookingPayload = {
  trip_type: "one-way" | "hourly";
  first_name: string;
  last_name: string;
  phone_number: string;
  email_address: string;
  car_class: string;
  select_date: string;
  select_time: string;
  pickup_address: string;
  dropoff_address: string;
  pickup_lat?: number;
  pickup_lon?: number;
  dropoff_lat?: number;
  dropoff_lon?: number;
  adults: number;
  notes?: string;
};

export type BookingResult = {
  reference: string;
  distance: string;
  duration: string;
  total_amount: number;
};

function assertValidPayload(data: unknown): BookingPayload {
  if (typeof data !== "object" || data === null) {
    throw new Error("Booking payload must be an object");
  }

  const d = data as Record<string, unknown>;

  const requiredStrings: (keyof BookingPayload)[] = [
    "first_name",
    "last_name",
    "phone_number",
    "email_address",
    "car_class",
    "select_date",
    "select_time",
    "pickup_address",
    "dropoff_address",
  ];

  const missing = requiredStrings.filter(
    (key) => typeof d[key] !== "string" || (d[key] as string).trim() === ""
  );

  if (missing.length > 0) {
    throw new Error(`Missing required booking fields: ${missing.join(", ")}`);
  }

  if (d.trip_type !== "one-way" && d.trip_type !== "hourly") {
    throw new Error(`Invalid trip_type: ${String(d.trip_type)}`);
  }

  if (typeof d.adults !== "number" || d.adults < 1) {
    throw new Error("adults must be a number >= 1");
  }

  return d as unknown as BookingPayload;
}

// CHANGED: quick check for whether a response is actually Cloudflare's bot
// challenge page rather than a real reply from WordPress, so the fallback
// logic below can tell "origin IP is stale/blocked" apart from "WordPress
// itself returned an error".
function looksLikeCloudflareChallenge(status: number, bodyText: string): boolean {
  if (status !== 403 && status !== 503) return false;
  return (
    bodyText.includes("Just a moment") ||
    bodyText.includes("cf-mitigated") ||
    bodyText.includes("challenges.cloudflare.com")
  );
}

// CHANGED: builds a fetch call that connects directly to the WordPress
// origin server's IP (bypassing Cloudflare's proxy, which blocks
// server-to-server requests from cloud IP ranges like Vercel's with a bot
// challenge) while still sending the correct SNI and Host header so the
// server's TLS cert and virtual-host routing both resolve correctly.
async function fetchViaOriginIp(
  hostname: string,
  originIp: string,
  path: string,
  body: string,
  apiKey: string
): Promise<Response> {
  const agent = new Agent({
    connect: {
      // Force TLS to present the real hostname for SNI + cert validation,
      // even though we're dialing the IP directly.
      servername: hostname,
    },
  });

  return fetch(`https://${originIp}${path}`, {
    method: "POST",
    // @ts-expect-error - dispatcher is an undici/Node fetch extension, not
    // part of the standard fetch() type signature.
    dispatcher: agent,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      // Without this, the server would try to match the virtual host by
      // the raw IP instead of by mastertravelgroup.com and likely 404 or
      // hit the wrong site.
      Host: hostname,
    },
    body,
  });
}

export const submitBooking = createServerFn({ method: "POST" })
  .validator((data: BookingPayload) => assertValidPayload(data))
  .handler(async ({ data }): Promise<BookingResult> => {
    const baseUrl = process.env.WORDPRESS_API_URL;
    const apiKey = process.env.WORDPRESS_API_KEY;
    // CHANGED: optional — if set, direct-IP requests are tried first,
    // bypassing Cloudflare's proxy. Get this from cPanel's "Shared IP
    // Address" field. If it's ever stale, requests simply fall back to the
    // normal proxied URL below instead of failing outright — but a stale
    // IP does mean you're back to hitting the Cloudflare challenge until
    // this value is updated.
    const originIp = process.env.WORDPRESS_ORIGIN_IP;

    if (!baseUrl || !apiKey) {
      console.error("Booking config error:", {
        WORDPRESS_API_URL: baseUrl ? "set" : "MISSING",
        WORDPRESS_API_KEY: apiKey ? "set" : "MISSING",
      });
      throw new Error("Server missing WORDPRESS_API_URL or WORDPRESS_API_KEY");
    }

    const hostname = new URL(baseUrl).hostname;
    const path = "/wp-json/mastercabs/v1/bookings";
    const body = JSON.stringify(data);

    // Try the direct-IP path first, if configured.
    if (originIp) {
      try {
        const res = await fetchViaOriginIp(hostname, originIp, path, body, apiKey);
        const text = await res.text();

        if (res.ok) {
          return JSON.parse(text);
        }

        if (!looksLikeCloudflareChallenge(res.status, text)) {
          // A real error from WordPress (validation, DB error, etc.) —
          // don't mask it by silently falling back and retrying.
          throw new Error(`Booking failed (${res.status}): ${text || "unknown error"}`);
        }

        console.warn(
          "Direct-IP booking request hit a Cloudflare challenge anyway — falling back to proxied URL. The origin IP may be stale."
        );
      } catch (err) {
        console.warn(
          "Direct-IP booking request failed, falling back to proxied URL:",
          err instanceof Error ? err.message : err
        );
      }
    }

    // Fallback: normal request through the proxied domain. This is what
    // ran before, and will still hit Cloudflare's challenge if that's not
    // yet resolved — but keeps behavior predictable if WORDPRESS_ORIGIN_IP
    // is unset or stale.
    let res: Response;
    try {
      res = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body,
      });
    } catch (networkErr) {
      const message = networkErr instanceof Error ? networkErr.message : String(networkErr);
      throw new Error(`Could not reach booking server at ${baseUrl}: ${message}`);
    }

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(`Booking failed (${res.status}): ${errorText || "unknown error"}`);
    }

    return res.json();
  });