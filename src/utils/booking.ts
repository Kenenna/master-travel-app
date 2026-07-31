import { createServerFn } from "@tanstack/react-start";

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

// CHANGED: the previous validator just cast the input to BookingPayload
// without checking anything at runtime, so malformed payloads (missing
// fields, wrong types) would sail through to the WordPress fetch call and
// surface as an opaque 400/500 from the REST API instead of a clear
// client-side error. This does a minimal shape check before sending.
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

export const submitBooking = createServerFn({ method: "POST" })
  .validator((data: BookingPayload) => assertValidPayload(data))
  .handler(async ({ data }): Promise<BookingResult> => {
    const baseUrl = process.env.WORDPRESS_API_URL;
    const apiKey = process.env.WORDPRESS_API_KEY;

    // CHANGED: log which var is missing (server-side only — never sent to
    // the client) so a misconfigured deploy is obvious in the platform's
    // function logs instead of just "one of these two is missing".
    if (!baseUrl || !apiKey) {
      console.error("Booking config error:", {
        WORDPRESS_API_URL: baseUrl ? "set" : "MISSING",
        WORDPRESS_API_KEY: apiKey ? "set" : "MISSING",
      });
      throw new Error("Server missing WORDPRESS_API_URL or WORDPRESS_API_KEY");
    }

    let res: Response;
    try {
      res = await fetch(`${baseUrl}/wp-json/mastercabs/v1/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(data),
      });
    } catch (networkErr) {
      // CHANGED: distinguish "couldn't reach WordPress at all" (DNS, TLS,
      // firewall, wrong URL) from "WordPress responded with an error",
      // since these need different fixes.
      const message = networkErr instanceof Error ? networkErr.message : String(networkErr);
      throw new Error(`Could not reach booking server at ${baseUrl}: ${message}`);
    }

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(`Booking failed (${res.status}): ${errorText || "unknown error"}`);
    }

    return res.json();
  });