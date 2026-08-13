import { createServerFn } from "@tanstack/react-start";
import { request as httpsRequest } from "node:https";

// ── path helper: builds the ?rest_route= path (used for both direct-IP and proxied requests) ──
function wpRestPath(path: string): string {
  const restPath = path.replace(/^\/wp-json/, "");
  return `/?rest_route=${encodeURIComponent(restPath)}`;
}

function looksLikeCloudflareChallenge(status: number, bodyText: string): boolean {
  if (status !== 403 && status !== 503) return false;
  return (
    bodyText.includes("Just a moment") ||
    bodyText.includes("cf-mitigated") ||
    bodyText.includes("challenges.cloudflare.com")
  );
}

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
        servername: hostname,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Content-Length": Buffer.byteLength(body),
          "x-api-key": apiKey,
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

// ── Shared request runner: tries origin IP first, falls back to proxied URL ──
async function wpPost(restPath: string, payload: unknown, fallbackAction: string): Promise<string> {
  const baseUrl = process.env.WORDPRESS_API_URL;
  const apiKey = process.env.WORDPRESS_API_KEY;
  const originIp = process.env.WORDPRESS_ORIGIN_IP;

  if (!baseUrl || !apiKey) {
    throw new Error(
      `Server env missing. WORDPRESS_API_URL=${baseUrl ?? "UNDEFINED"}, WORDPRESS_API_KEY=${apiKey ? "SET" : "UNDEFINED"}`
    );
  }

  const hostname = new URL(baseUrl.replace(/\/wp-json$/, "")).hostname;
  const path = wpRestPath(restPath);
  const body = JSON.stringify(payload);

  if (originIp) {
    try {
      const { status, text } = await requestViaOriginIp(hostname, originIp, path, body, apiKey);

      if (status >= 200 && status < 300) {
        return text;
      }

      if (!looksLikeCloudflareChallenge(status, text)) {
        throw new Error(`${fallbackAction} failed (${status}): ${text || "unknown error"}`);
      }

      console.warn(
        `Direct-IP ${fallbackAction} request hit a Cloudflare challenge anyway — falling back to proxied URL.`
      );
    } catch (err) {
      console.warn(
        `Direct-IP ${fallbackAction} request failed, falling back to proxied URL:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  const url = `${baseUrl.replace(/\/+$/, "").replace(/\/wp-json$/, "")}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "x-api-key": apiKey,
      },
      body,
    });
  } catch (networkErr) {
    const message = networkErr instanceof Error ? networkErr.message : String(networkErr);
    throw new Error(`Network error reaching ${url}: ${message}`);
  }

  const bodyText = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(`URL: ${url} | Status: ${res.status} | Response: ${bodyText.slice(0, 800)}`);
  }
  return bodyText;
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

export type DriverProfile = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  license_number: string;
  vehicle_type: string;
  vehicle_model: string;
  vehicle_reg_number: string;
  year_of_manufacture: number;
  years_experience: number;
  driver_phone: string;
  driver_address: string;
  member_since: string;
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

export const registerDriver = createServerFn({ method: "POST" })
  .validator((data: DriverRegisterPayload) => assertValidRegister(data))
  .handler(async ({ data }): Promise<DriverRegisterResult> => {
    const bodyText = await wpPost("/wp-json/mastercabs/v1/drivers/register", data, "Registration");
    return JSON.parse(bodyText);
  });

export const loginDriver = createServerFn({ method: "POST" })
  .validator((data: DriverLoginPayload) => assertValidLogin(data))
  .handler(async ({ data }): Promise<DriverAuthResult> => {
    const bodyText = await wpPost("/wp-json/mastercabs/v1/drivers/login", data, "Login");
    return JSON.parse(bodyText);
  });

export const forgotPasswordDriver = createServerFn({ method: "POST" })
  .validator((data: { email: string; reset_url?: string }) => {
    if (!data.email || typeof data.email !== "string" || !data.email.includes("@")) {
      throw new Error("Valid email is required");
    }
    return data;
  })
  .handler(async ({ data }): Promise<{ success: boolean; message: string }> => {
    const bodyText = await wpPost("/wp-json/mastercabs/v1/drivers/forgot-password", data, "Forgot password");
    return JSON.parse(bodyText);
  });

export const resetPasswordDriver = createServerFn({ method: "POST" })
  .validator((data: { reset_token: string; password: string; password_confirm: string }) => {
    if (!data.reset_token) throw new Error("Reset token is required");
    if (!data.password || data.password.length < 8) throw new Error("Password must be at least 8 characters");
    if (data.password !== data.password_confirm) throw new Error("Passwords do not match");
    return data;
  })
  .handler(async ({ data }): Promise<{ success: boolean; message: string }> => {
    const bodyText = await wpPost("/wp-json/mastercabs/v1/drivers/reset-password", data, "Reset password");
    return JSON.parse(bodyText);
  });

export const getDriverProfile = createServerFn({ method: "POST" })
  .validator((data: { token: string }) => {
    if (!data.token || typeof data.token !== "string") {
      throw new Error("Token is required");
    }
    return data;
  })
  .handler(async ({ data }): Promise<DriverProfile> => {
    const bodyText = await wpPost("/wp-json/mastercabs/v1/drivers/me", { token: data.token }, "Fetch profile");
    return JSON.parse(bodyText);
  });