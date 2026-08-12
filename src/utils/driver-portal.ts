import { createServerFn } from "@tanstack/react-start";

function wpUrl(path: string): string {
  let base = (process.env.WORDPRESS_API_URL || "")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/wp-json$/, "");
  return `${base}${path}`;
}

export type DriverRegisterPayload = {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  license: string;
  vehicle_type: string;
  years_experience: number;
  year_of_manufacture: number;
  vehicle_model: string;
  vehicle_reg_number: string;
  driver_address: string;
  driver_phone: string;
  doc_driving_licence: string;
  doc_nta_licence: string;
  doc_profile_photo: string;
  doc_spsv_licence: string;
  doc_insurance: string;
  doc_bank_statement: string;
  vehicle_photo_1: string;
  vehicle_photo_2: string;
  vehicle_photo_3: string;
  vehicle_photo_4: string;
  doc_logbook: string;
};

export type DriverRegisterResult = {
  success: boolean;
  message: string;
};

export type DriverLoginPayload = {
  email: string;
  password: string;
};

export type DriverAuthResult = {
  token: string;
  driver: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    status: string;
  };
};

function assertValidRegister(data: unknown): DriverRegisterPayload {
  if (typeof data !== "object" || data === null) {
    throw new Error("Registration payload must be an object");
  }
  const d = data as Record<string, unknown>;

  const requiredStrings = [
    "email", "password", "password_confirm", "first_name", "last_name",
    "license", "vehicle_type", "vehicle_model", "vehicle_reg_number",
    "driver_address", "driver_phone",
    "doc_driving_licence", "doc_nta_licence", "doc_profile_photo",
    "doc_spsv_licence", "doc_insurance", "doc_bank_statement",
    "vehicle_photo_1", "vehicle_photo_2", "vehicle_photo_3", "vehicle_photo_4",
    "doc_logbook",
  ];

  const missing = requiredStrings.filter(
    (key) => typeof d[key] !== "string" || (d[key] as string).trim() === ""
  );

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }

  if ((d.password as string).length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  if (d.password !== d.password_confirm) {
    throw new Error("Passwords do not match");
  }

  const years = Number(d.years_experience ?? 0);
  const yearMfr = Number(d.year_of_manufacture ?? 0);

  if (yearMfr < 1990 || yearMfr > new Date().getFullYear()) {
    throw new Error("Please enter a valid year of manufacture");
  }

  return {
    ...d,
    years_experience: years,
    year_of_manufacture: yearMfr,
  } as unknown as DriverRegisterPayload;
}

function assertValidLogin(data: unknown): DriverLoginPayload {
  if (typeof data !== "object" || data === null) {
    throw new Error("Login payload must be an object");
  }
  const d = data as Record<string, unknown>;
  if (!d.email || !d.password) {
    throw new Error("Email and password are required");
  }
  return d as unknown as DriverLoginPayload;
}

function extractWpErrorMessage(status: number, bodyText: string, fallbackAction: string): string {
  if (!bodyText) return `${fallbackAction} failed (${status})`;
  try {
    const parsed = JSON.parse(bodyText);
    if (parsed && typeof parsed.message === "string" && parsed.message.trim() !== "") {
      return parsed.message;
    }
  } catch {
    // not JSON
  }
  return `${fallbackAction} failed (${status}): ${bodyText}`;
}

export const registerDriver = createServerFn({ method: "POST" })
  .validator((data: DriverRegisterPayload) => assertValidRegister(data))
  .handler(async ({ data }): Promise<DriverRegisterResult> => {
    const baseUrl = process.env.WORDPRESS_API_URL;
    const apiKey = process.env.WORDPRESS_API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error(
        `Server env missing. WORDPRESS_API_URL=${baseUrl ?? "UNDEFINED"}, WORDPRESS_API_KEY=${apiKey ? "SET" : "UNDEFINED"}`
      );
    }

    const url = wpUrl("/wp-json/mastercabs/v1/drivers/register");

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(data),
      });
    } catch (networkErr) {
      const message = networkErr instanceof Error ? networkErr.message : String(networkErr);
      throw new Error(`Network error reaching ${url}: ${message}`);
    }

    const bodyText = await res.text().catch(() => "");

    if (!res.ok) {
      throw new Error(
        `URL: ${url} | Status: ${res.status} | Response: ${bodyText.slice(0, 800)}`
      );
    }

    return JSON.parse(bodyText);
  });

export const loginDriver = createServerFn({ method: "POST" })
  .validator((data: DriverLoginPayload) => assertValidLogin(data))
  .handler(async ({ data }): Promise<DriverAuthResult> => {
    const baseUrl = process.env.WORDPRESS_API_URL;
    const apiKey = process.env.WORDPRESS_API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error(
        `Server env missing. WORDPRESS_API_URL=${baseUrl ?? "UNDEFINED"}, WORDPRESS_API_KEY=${apiKey ? "SET" : "UNDEFINED"}`
      );
    }

    const url = wpUrl("/wp-json/mastercabs/v1/drivers/login");

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(data),
      });
    } catch (networkErr) {
      const message = networkErr instanceof Error ? networkErr.message : String(networkErr);
      throw new Error(`Network error reaching ${url}: ${message}`);
    }

    const bodyText = await res.text().catch(() => "");

    if (!res.ok) {
      throw new Error(
        `URL: ${url} | Status: ${res.status} | Response: ${bodyText.slice(0, 800)}`
      );
    }

    return JSON.parse(bodyText);
  });