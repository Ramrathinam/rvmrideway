"use client";
import { useState, useEffect } from "react";

export default function LocationInput({ placeholder, onSelect }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300); // ✅ 300ms debounce

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full border rounded px-3 py-2"
      />
      {loading && <p className="absolute top-full text-xs text-gray-400">Loading...</p>}
      {suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded border bg-white shadow-lg">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onClick={() => {
                setQuery(s.shortLabel || s.label);
                setSuggestions([]);
                onSelect?.(s);
              }}
              className="cursor-pointer px-3 py-2 hover:bg-gray-100 text-sm"
            >
              <div className="font-medium">{s.shortLabel || s.label}</div>
              <div className="text-xs text-gray-500 truncate">{s.address}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
