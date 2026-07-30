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

export const submitBooking = createServerFn({ method: "POST" })
  .validator((data: BookingPayload) => data)
  .handler(async ({ data }): Promise<BookingResult> => {
    const baseUrl = process.env.WORDPRESS_API_URL;
    const apiKey = process.env.WORDPRESS_API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error("Server missing WORDPRESS_API_URL or WORDPRESS_API_KEY");
    }

    const res = await fetch(`${baseUrl}/wp-json/mastercabs/v1/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(`Booking failed (${res.status}): ${errorText || "unknown error"}`);
    }

    return res.json();
  });