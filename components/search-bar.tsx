"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buildCatalogHref } from "@/lib/catalog-url";

const SUGGESTIONS_DEBOUNCE_MS = 200;

export function SearchBar({
  defaultValue,
  category,
  sort,
}: {
  defaultValue: string;
  category: string;
  sort: "newest" | "discount";
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const abortRef = useRef<AbortController | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  function runSearch(query: string) {
    setShowSuggestions(false);
    router.push(buildCatalogHref({ category, sort, q: query }));
  }

  function handleChange(next: string) {
    setValue(next);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    if (next.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const controller = new AbortController();
      abortRef.current = controller;
      fetch(`/api/products/suggest?q=${encodeURIComponent(next.trim())}`, {
        signal: controller.signal,
      })
        .then((response) => response.json())
        .then((data: { suggestions: string[] }) => {
          setSuggestions(data.suggestions);
          setShowSuggestions(data.suggestions.length > 0);
        })
        .catch(() => {
          // Requête annulée (nouvelle frappe) ou erreur réseau : pas de suggestions à afficher.
        });
    }, SUGGESTIONS_DEBOUNCE_MS);
  }

  function handleSuggestionClick(suggestion: string) {
    setValue(suggestion);
    runSearch(suggestion);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          runSearch(value);
        }}
        className="flex items-center gap-2 rounded-md border border-card-border bg-white px-3 py-1.5"
      >
        <input
          type="search"
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          placeholder="Rechercher un modèle ou une marque…"
          aria-label="Rechercher un bon plan par modèle ou marque"
          className="w-full bg-transparent text-sm text-zinc-900 outline-none"
        />
        <button
          type="submit"
          aria-label="Lancer la recherche"
          className="shrink-0 text-zinc-500 hover:text-zinc-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
      </form>

      {showSuggestions && (
        <ul className="absolute z-10 mt-1 w-full rounded-md border border-card-border bg-white py-1 shadow-md">
          {suggestions.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="block w-full px-3 py-1.5 text-left text-sm text-zinc-900 hover:bg-zinc-100"
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
