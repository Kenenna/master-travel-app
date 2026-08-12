import { createServerFn } from "@tanstack/react-start";

// ── URL helper: guarantees exactly one slash between base and path ──
function wpUrl(path: string): string {
  const base = (process.env.WORDPRESS_API_URL || "")
    .trim()
    .replace(/\/+$/, ""); // strip trailing slash(es)
  return `${base}${path}`;
}

export type DriverRegisterPayload = {
  // … (keep your existing types unchanged)
};

// … keep all your existing types & assertValidRegister / assertValidLogin …

/**
 * WP_Error responses from the REST API come back as JSON shaped like:
 *   { "code": "invalid_email", "message": "Please enter a valid email.", … }
 */
function extractWpErrorMessage(status: number, bodyText: string, fallbackAction: string): string {
  if (!bodyText) return `${fallbackAction} failed (${status})`;
  try {
    const parsed = JSON.parse(bodyText);
    if (parsed && typeof parsed.message === "string" && parsed.message.trim() !== "") {
      return parsed.message;
    }
  } catch {
    // not JSON — fall through to raw text
  }
  return `${fallbackAction} failed (${status}): ${bodyText}`;
}

export const registerDriver = createServerFn({ method: "POST" })
  .validator((data: DriverRegisterPayload) => assertValidRegister(data))
  .handler(async ({ data }): Promise<DriverRegisterResult> => {
    const apiKey = process.env.WORDPRESS_API_KEY;

    if (!apiKey) {
      throw new Error("Server missing WORDPRESS_API_KEY");
    }

    const url = wpUrl("/wp-json/mastercabs/v1/drivers/register");
    console.log("[registerDriver] POST →", url); // server-side log

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(data),
      });
    } catch (networkErr) {
      const message = networkErr instanceof Error ? networkErr.message : String(networkErr);
      throw new Error(`Could not reach server: ${message}`);
    }

    const errorText = await res.text().catch(() => "");
    console.log("[registerDriver] status:", res.status, "body:", errorText.slice(0, 500));

    if (!res.ok) {
      throw new Error(extractWpErrorMessage(res.status, errorText, "Registration"));
    }

    return JSON.parse(errorText);
  });

export const loginDriver = createServerFn({ method: "POST" })
  .validator((data: DriverLoginPayload) => assertValidLogin(data))
  .handler(async ({ data }): Promise<DriverAuthResult> => {
    const apiKey = process.env.WORDPRESS_API_KEY;

    if (!apiKey) {
      throw new Error("Server missing WORDPRESS_API_KEY");
    }

    const url = wpUrl("/wp-json/mastercabs/v1/drivers/login");
    console.log("[loginDriver] POST →", url);

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(data),
      });
    } catch (networkErr) {
      const message = networkErr instanceof Error ? networkErr.message : String(networkErr);
      throw new Error(`Could not reach server: ${message}`);
    }

    const errorText = await res.text().catch(() => "");
    console.log("[loginDriver] status:", res.status, "body:", errorText.slice(0, 500));

    if (!res.ok) {
      throw new Error(extractWpErrorMessage(res.status, errorText, "Login"));
    }

    return JSON.parse(errorText);
  });