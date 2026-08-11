import { createServerFn } from "@tanstack/react-start";
import { request as httpsRequest } from "node:https";

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

function looksLikeCloudflareChallenge(status: number, bodyText: string): boolean {
  if (status !== 403 && status !== 503) return false;
  return (
    bodyText.includes("Just a moment") ||
    bodyText.includes("cf-mitigated") ||
    bodyText.includes("challenges.cloudflare.com")
  );
}

// CHANGED: uses node:https directly instead of fetch()/undici's Agent.
// fetch() implementations vary by runtime (Bun's fetch does not appear to
// honor undici's `dispatcher` option for connection/SNI overrides), but
// node:https.request gives explicit, low-level control over exactly which
// IP the TCP connection targets while independently controlling the TLS
// SNI (`servername`) and the HTTP `Host` header — this is what actually
// lets the request reach the origin server directly, bypassing
// Cloudflare's proxy, regardless of which fetch implementation the
// current JS runtime ships with.
function requestViaOriginIp(
  hostname: string,
  originIp: string,
  path: string,
  body: string,
  apiKey: string
): Promise<{ status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const req = httpsRequest(
      {
        hostname: originIp,
        port: 443,
        path,
        method: "POST",
        // TLS SNI: tells the server (and Node's own cert hostname check)
        // to treat this connection as if it were made to `hostname`, even
        // though we dialed a raw IP.
        servername: hostname,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          "x-api-key": apiKey,
          // Without this, the server would route by IP instead of by
          // mastertravelgroup.com and likely serve the wrong site or 404.
          Host: hostname,
        },
        timeout: 15000,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({ status: res.statusCode ?? 0, text: data });
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error("Direct-IP request timed out"));
    });
    req.on("error", reject);

    req.write(body);
    req.end();
  });
}

export const submitBooking = createServerFn({ method: "POST" })
  .validator((data: BookingPayload) => assertValidPayload(data))
  .handler(async ({ data }): Promise<BookingResult> => {
    const baseUrl = process.env.WORDPRESS_API_URL;
    const apiKey = process.env.WORDPRESS_API_KEY;
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

    if (originIp) {
      try {
        const { status, text } = await requestViaOriginIp(hostname, originIp, path, body, apiKey);

        if (status >= 200 && status < 300) {
          return JSON.parse(text);
        }

        if (!looksLikeCloudflareChallenge(status, text)) {
          throw new Error(`Booking failed (${status}): ${text || "unknown error"}`);
        }

        console.warn(
          "Direct-IP booking request hit a Cloudflare challenge anyway — falling back to proxied URL. The origin IP may be stale, or this network path is also proxied."
        );
      } catch (err) {
        console.warn(
          "Direct-IP booking request failed, falling back to proxied URL:",
          err instanceof Error ? err.message : err
        );
      }
    }

    // Fallback: normal proxied request. Will hit Cloudflare's challenge if
    // that's not otherwise resolved, but keeps behavior predictable if
    // WORDPRESS_ORIGIN_IP is unset, stale, or blocked.
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