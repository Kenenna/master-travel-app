import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter, WhatsAppBubble } from "@/components/site-footer";
import { registerDriver, loginDriver } from "@/utils/driver-portal";

export const Route = createFileRoute("/driver-portal")({
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

const vehicleTypes = [
  { value: "sedan", label: "Luxury Sedan" },
  { value: "suv", label: "Luxury SUV" },
  { value: "stretch", label: "Stretch Limo" },
  { value: "minibus", label: "Executive Minibus" },
  { value: "van", label: "Cargo Van" },
];

/**
 * Compress images via canvas before base64 encoding.
 * PDFs pass through unchanged.
 */
function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === "application/pdf") {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not compress image"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for compression"));
    };
    img.src = url;
  });
}

function DriverPortal() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const result = await loginDriver({
        data: {
          email: String(formData.get("email") || ""),
          password: String(formData.get("password") || ""),
        },
      });
      localStorage.setItem("driver_token", result.token);
      localStorage.setItem("driver", JSON.stringify(result.driver));
      setLoggedIn(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const files: Record<string, File | null> = {
        doc_driving_licence: formData.get("doc_driving_licence") as File,
        doc_nta_licence: formData.get("doc_nta_licence") as File,
        doc_profile_photo: formData.get("doc_profile_photo") as File,
        doc_spsv_licence: formData.get("doc_spsv_licence") as File,
        doc_insurance: formData.get("doc_insurance") as File,
        doc_bank_statement: formData.get("doc_bank_statement") as File,
        vehicle_photo_1: formData.get("vehicle_photo_1") as File,
        vehicle_photo_2: formData.get("vehicle_photo_2") as File,
        vehicle_photo_3: formData.get("vehicle_photo_3") as File,
        vehicle_photo_4: formData.get("vehicle_photo_4") as File,
        doc_logbook: formData.get("doc_logbook") as File,
      };

      const base64Files: Record<string, string> = {};
      for (const [key, file] of Object.entries(files)) {
        if (!file || file.size === 0) {
          throw new Error(`Please upload ${key.replace(/_/g, " ")}`);
        }
        base64Files[key] = await compressImage(file);
      }

      const result = await registerDriver({
        data: {
          email: String(formData.get("email") || ""),
          password: String(formData.get("password") || ""),
          password_confirm: String(formData.get("password_confirm") || ""),
          first_name: String(formData.get("first_name") || ""),
          last_name: String(formData.get("last_name") || ""),
          license: String(formData.get("license") || ""),
          vehicle_type: String(formData.get("vehicle_type") || ""),
          years_experience: Number(formData.get("years_experience") || 0),
          year_of_manufacture: Number(formData.get("year_of_manufacture") || 0),
          vehicle_model: String(formData.get("vehicle_model") || ""),
          vehicle_reg_number: String(formData.get("vehicle_reg_number") || ""),
          driver_address: String(formData.get("driver_address") || ""),
          driver_phone: String(formData.get("driver_phone") || ""),
          ...base64Files,
        },
      });

      setSuccess(result.message || "Application submitted! Our team will review and contact you within 48 hours.");
      form.reset();
      setMode("login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loggedIn) {
    return (
      <div className="min-h-screen bg-[var(--ink)] text-white">
        <SiteHeader />
        <section className="flex min-h-[calc(100vh-96px)] items-center justify-center px-6 py-20">
          <div className="w-full max-w-md text-center">
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.3em]" style={{ color: "var(--gold)" }}>
              Welcome Back
            </span>
            <h1 className="mt-4 font-serif text-3xl">Driver Dashboard</h1>
            <span className="gold-divider mx-auto mt-6" />
            <p className="mt-6 text-white/70">
              You are signed in. The driver dashboard will be available here soon.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem("driver_token");
                localStorage.removeItem("driver");
                setLoggedIn(false);
              }}
              className="btn-gold mt-8"
            >
              Sign Out
            </button>
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
      <section className="px-6 py-20">
        <div className="mx-auto w-full max-w-2xl">
          <div className="text-center">
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.3em]" style={{ color: "var(--gold)" }}>
              Chauffeur Access
            </span>
            <h1 className="mt-4 font-serif text-4xl">Driver Portal</h1>
            <span className="gold-divider mx-auto mt-6" />
          </div>

          <div className="mt-10 flex gap-2">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(null); setSuccess(null); }}
              className={`flex-1 rounded border px-4 py-2 text-sm font-medium transition-colors ${
                mode === "login"
                  ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
                  : "border-white/20 bg-transparent text-white/60 hover:bg-white/5"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(null); setSuccess(null); }}
              className={`flex-1 rounded border px-4 py-2 text-sm font-medium transition-colors ${
                mode === "register"
                  ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
                  : "border-white/20 bg-transparent text-white/60 hover:bg-white/5"
              }`}
            >
              Apply to Drive
            </button>
          </div>

          {error && (
            <div className="mt-6 rounded border border-red-400/50 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-6 rounded border border-green-400/50 bg-green-500/10 p-3 text-sm text-green-200">
              {success}
            </div>
          )}

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="mt-6 space-y-5 rounded-lg border border-white/15 bg-white/5 p-8">
              <div>
                <label className="block text-[0.65rem] font-medium uppercase tracking-[0.25em] text-white/60">Email</label>
                <input required type="email" name="email" className="mt-2 w-full rounded border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[var(--gold)] focus:outline-none" />
              </div>
              <div>
                <label className="block text-[0.65rem] font-medium uppercase tracking-[0.25em] text-white/60">Password</label>
                <input required type="password" name="password" className="mt-2 w-full rounded border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[var(--gold)] focus:outline-none" />
              </div>
              <button type="submit" disabled={submitting} className="btn-gold w-full disabled:opacity-50">
                {submitting ? "Signing in…" : "Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="mt-6 space-y-6 rounded-lg border border-white/15 bg-white/5 p-8">
              <h3 className="text-lg font-semibold text-white/90">Personal Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="First Name" name="first_name" required />
                <Field label="Last Name" name="last_name" required />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Email" name="email" type="email" required />
                <Field label="Phone" name="driver_phone" type="tel" required />
              </div>
              <div>
                <label className="block text-[0.65rem] font-medium uppercase tracking-[0.25em] text-white/60">Residential Address</label>
                <textarea name="driver_address" required rows={3} className="mt-2 w-full rounded border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[var(--gold)] focus:outline-none" placeholder="Street, City, County, Eircode" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Password" name="password" type="password" required />
                <Field label="Confirm Password" name="password_confirm" type="password" required />
              </div>

              <h3 className="pt-4 text-lg font-semibold text-white/90">Driving Details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Licence Number" name="license" required />
                <Field label="Years of Experience" name="years_experience" type="number" defaultValue="0" />
              </div>
              <FileField label="Valid Driving Licence (JPG/PDF, max 2MB)" name="doc_driving_licence" required accept="image/*,.pdf" />
              <FileField label="NTA/SPSV Driver Licence (JPG/PDF, max 2MB)" name="doc_nta_licence" required accept="image/*,.pdf" />
              <FileField label="Profile Photo – clear headshot (JPG/PNG, max 2MB)" name="doc_profile_photo" required accept="image/*" />

              <h3 className="pt-4 text-lg font-semibold text-white/90">Vehicle & Licensing</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[0.65rem] font-medium uppercase tracking-[0.25em] text-white/60">Vehicle Type</label>
                  <select name="vehicle_type" required className="mt-2 w-full rounded border border-white/20 bg-transparent px-3 py-2 text-sm text-white focus:border-[var(--gold)] focus:outline-none [&>option]:text-black">
                    <option value="">Please select…</option>
                    {vehicleTypes.map((v) => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <Field label="Year of Manufacture" name="year_of_manufacture" type="number" required />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Vehicle Model" name="vehicle_model" required />
                <Field label="Registration Number" name="vehicle_reg_number" required />
              </div>
              <FileField label="SPSV Vehicle Licence (JPG/PDF, max 2MB)" name="doc_spsv_licence" required accept="image/*,.pdf" />
              <FileField label="Vehicle Insurance Certificate (JPG/PDF, max 2MB)" name="doc_insurance" required accept="image/*,.pdf" />
              <FileField label="Vehicle Log Book – Proof of Ownership (JPG/PDF, max 2MB)" name="doc_logbook" required accept="image/*,.pdf" />

              <h3 className="pt-4 text-lg font-semibold text-white/90">Vehicle Photos</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FileField label="Vehicle Photo 1" name="vehicle_photo_1" required accept="image/*" />
                <FileField label="Vehicle Photo 2" name="vehicle_photo_2" required accept="image/*" />
                <FileField label="Vehicle Photo 3" name="vehicle_photo_3" required accept="image/*" />
                <FileField label="Vehicle Photo 4" name="vehicle_photo_4" required accept="image/*" />
              </div>

              <h3 className="pt-4 text-lg font-semibold text-white/90">Bank Details</h3>
              <FileField label="Bank Statement / Bank Details (JPG/PDF, max 2MB)" name="doc_bank_statement" required accept="image/*,.pdf" />

              <div className="flex items-start gap-2 pt-2">
                <input type="checkbox" name="terms" required className="mt-1 h-4 w-4 rounded border-white/30 text-[var(--gold)] focus:ring-[var(--gold)]" />
                <label className="text-xs text-white/60">
                  I agree to the <Link to="/" className="underline" style={{ color: "var(--gold)" }}>terms & conditions</Link> and privacy policy.
                </label>
              </div>

              <button type="submit" disabled={submitting} className="btn-gold w-full disabled:opacity-50">
                {submitting ? "Submitting Application…" : "Submit Application"}
              </button>
            </form>
          )}
        </div>
      </section>
      <SiteFooter />
      <WhatsAppBubble />
    </div>
  );
}

function Field({ label, name, type = "text", required = false, defaultValue }: {
  label: string; name: string; type?: string; required?: boolean; defaultValue?: string;
}) {
  return (
    <div>
      <label className="block text-[0.65rem] font-medium uppercase tracking-[0.25em] text-white/60">{label}</label>
      <input name={name} type={type} required={required} defaultValue={defaultValue} className="mt-2 w-full rounded border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[var(--gold)] focus:outline-none" />
    </div>
  );
}

function FileField({ label, name, required = false, accept }: {
  label: string; name: string; required?: boolean; accept?: string;
}) {
  return (
    <div>
      <label className="block text-[0.65rem] font-medium uppercase tracking-[0.25em] text-white/60">{label}</label>
      <input
        type="file"
        name={name}
        required={required}
        accept={accept}
        className="mt-2 block w-full text-sm text-white/70 file:mr-4 file:rounded file:border-0 file:bg-[var(--gold)] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[var(--ink)] hover:file:bg-[var(--gold)]/80"
      />
    </div>
  );
}