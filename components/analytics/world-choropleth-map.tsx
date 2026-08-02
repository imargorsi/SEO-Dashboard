"use client";

import { geoMercator, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { useEffect, useMemo, useState } from "react";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";

import { normalizeIsoNumericId } from "@/lib/frontend/analytics/country-iso.utils";
import { cn } from "@/lib/utils";

type TWorldChoroplethMapProps = {
  /** ISO numeric id → fill color (CSS color / token). */
  fillsByIsoNumeric: Record<string, string>;
  selectedIsoNumeric?: string | null;
  onSelectIsoNumeric?: (isoNumeric: string | null) => void;
  unavailableLabel: string;
  ariaLabel: string;
  className?: string;
  width?: number;
  height?: number;
};

type TCountryFeature = Feature<Geometry> & {
  id?: string | number;
  properties?: { id?: string | number } | null;
};

/** Antarctica stretches into a flat band under Mercator — exclude from fit + render. */
const EXCLUDED_ISO_NUMERIC = new Set(["010"]);

let cachedCollection: FeatureCollection<Geometry> | null = null;
let cachedPromise: Promise<FeatureCollection<Geometry>> | null = null;

/** Bust stale module cache that still included Antarctica. */
const MAP_CACHE_VERSION = 2;
let cacheVersion = 0;

function featureIso(geoFeature: TCountryFeature): string | null {
  return normalizeIsoNumericId(geoFeature.id ?? geoFeature.properties?.id);
}

function withoutExcludedCountries(
  collection: FeatureCollection<Geometry>,
): FeatureCollection<Geometry> {
  return {
    type: "FeatureCollection",
    features: collection.features.filter((geoFeature) => {
      const iso = featureIso(geoFeature as TCountryFeature);
      return iso != null && !EXCLUDED_ISO_NUMERIC.has(iso);
    }),
  };
}

async function loadCountries(): Promise<FeatureCollection<Geometry>> {
  if (cacheVersion !== MAP_CACHE_VERSION) {
    cachedCollection = null;
    cachedPromise = null;
    cacheVersion = MAP_CACHE_VERSION;
  }
  if (cachedCollection) return cachedCollection;
  if (!cachedPromise) {
    cachedPromise = fetch("/maps/countries-110m.json")
      .then((response) => {
        if (!response.ok) throw new Error("World map load failed");
        return response.json() as Promise<unknown>;
      })
      .then((topology) => {
        const topo = topology as {
          objects: { countries: Parameters<typeof feature>[1] };
        };
        const collection = feature(
          topology as never,
          topo.objects.countries,
        ) as unknown as FeatureCollection<Geometry>;
        cachedCollection = withoutExcludedCountries(collection);
        return cachedCollection;
      })
      .catch((error) => {
        cachedPromise = null;
        throw error;
      });
  }
  return cachedPromise;
}

export function WorldChoroplethMap({
  fillsByIsoNumeric,
  selectedIsoNumeric,
  onSelectIsoNumeric,
  unavailableLabel,
  ariaLabel,
  className,
  width = 960,
  height = 480,
}: TWorldChoroplethMapProps) {
  const [collection, setCollection] = useState<FeatureCollection<Geometry> | null>(
    cachedCollection,
  );
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadCountries()
      .then((data) => {
        if (!cancelled) setCollection(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fittedPath = useMemo(() => {
    if (!collection || collection.features.length === 0) {
      return geoPath(geoMercator().fitSize([width, height], { type: "Sphere" }).precision(0.5));
    }
    const projection = geoMercator()
      .fitExtent(
        [
          [8, 8],
          [width - 8, height - 8],
        ],
        collection,
      )
      .precision(0.5);
    return geoPath(projection);
  }, [collection, height, width]);

  const hasSelection = Boolean(selectedIsoNumeric);

  const orderedFeatures = useMemo(() => {
    const features = (collection?.features ?? []) as TCountryFeature[];
    if (!selectedIsoNumeric) return features;
    return [...features].sort((a, b) => {
      const aSelected = featureIso(a) === selectedIsoNumeric ? 1 : 0;
      const bSelected = featureIso(b) === selectedIsoNumeric ? 1 : 0;
      return aSelected - bSelected;
    });
  }, [collection, selectedIsoNumeric]);

  if (loadError) {
    return (
      <div
        className={cn(
          "flex h-full min-h-72 items-center justify-center rounded-2xl bg-bg-card/20",
          className,
        )}
      >
        <p className="type-caption text-text-muted">{unavailableLabel}</p>
      </div>
    );
  }

  if (!collection) {
    return (
      <div
        className={cn(
          "flex h-full min-h-72 items-center justify-center rounded-2xl bg-bg-card/20",
          className,
        )}
      >
        <div className="h-52 w-[90%] animate-pulse rounded-xl bg-bg-hover/50" />
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-full w-full", className)}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={ariaLabel}
    >
      {orderedFeatures.map((geoFeature, index) => {
        const iso = featureIso(geoFeature);
        if (!iso) return null;
        const fill =
          fillsByIsoNumeric[iso] ?? "color-mix(in srgb, var(--text-muted) 18%, transparent)";
        const isSelected = selectedIsoNumeric === iso;
        const isDimmed = hasSelection && !isSelected;
        const d = fittedPath(geoFeature as unknown as GeoPermissibleObjects);
        if (!d) return null;

        return (
          <path
            key={`${iso}-${index}`}
            d={d}
            fill={fill}
            stroke="color-mix(in srgb, var(--bg-main) 55%, transparent)"
            strokeWidth={0.35}
            opacity={isDimmed ? 0.28 : 1}
            style={
              isSelected
                ? {
                    filter:
                      "drop-shadow(0 2px 6px color-mix(in srgb, var(--color-contrast) 35%, transparent))",
                  }
                : undefined
            }
            className={cn(
              "cursor-pointer transition-[opacity,filter] duration-200 ease-out",
              !hasSelection && "hover:opacity-90",
              isDimmed && "hover:opacity-45",
            )}
            onClick={() => onSelectIsoNumeric?.(isSelected ? null : iso)}
          />
        );
      })}
    </svg>
  );
}
