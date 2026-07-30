import { useEffect, useRef, useState } from "react";

type GeoapifyFeature = {
  properties: {
    formatted: string;
    lat: number;
    lon: number;
    place_id: string;
  };
};

export type AddressValue = {
  formatted: string;
  lat?: number;
  lon?: number;
};

type AddressAutocompleteProps = {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  value: AddressValue;
  onChange: (value: AddressValue) => void;
  /** ISO country code to bias/filter results, e.g. "ie". Omit for worldwide results. */
  country?: string;
};

const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY as string | undefined;

export function AddressAutocomplete({
  label,
  name,
  required = false,
  placeholder = "Address, airport, hotel...",
  value,
  onChange,
  country = "ie",
}: AddressAutocompleteProps) {
  const [results, setResults] = useState<GeoapifyFeature[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInputChange(text: string) {
    onChange({ formatted: text, lat: undefined, lon: undefined });

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(() => fetchSuggestions(text), 400);
  }

  async function fetchSuggestions(text: string) {
    if (!GEOAPIFY_API_KEY) {
      console.error("Missing VITE_GEOAPIFY_API_KEY — address autocomplete is disabled.");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        text,
        limit: "5",
        format: "json",
        apiKey: GEOAPIFY_API_KEY,
      });
      if (country) {
        params.set("filter", `countrycode:${country}`);
      }

      const res = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?${params.toString()}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setShowResults(true);
    } catch (err) {
      console.error("Geoapify autocomplete error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(feature: GeoapifyFeature) {
    onChange({
      formatted: feature.properties.formatted,
      lat: feature.properties.lat,
      lon: feature.properties.lon,
    });
    setResults([]);
    setShowResults(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-[0.7rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </label>
      <input
        name={name}
        type="text"
        required={required}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder={placeholder}
        value={value.formatted}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => results.length > 0 && setShowResults(true)}
        className="mt-2 w-full rounded border border-input bg-white px-3 py-2 text-sm focus:border-[var(--gold)] focus:outline-none"
      />
      {loading && (
        <span className="absolute right-3 top-[2.6rem] text-xs text-muted-foreground">…</span>
      )}
      {showResults && results.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded border border-input bg-white shadow-md">
          {results.map((feature) => (
            <li
              key={feature.properties.place_id}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(feature);
              }}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-muted"
            >
              {feature.properties.formatted}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
