"use client";

import { memo } from "react";
import { Geographies, Geography } from "react-simple-maps";
import { getAlpha2FromNumeric } from "@/lib/country-codes";

interface Props {
  visitedCodes: Set<string>;
  onCountryClick: (code: string, name: string) => void;
}

const GEO_URL = "/world-110m.json";

function CountryLayer({ visitedCodes, onCountryClick }: Props) {
  return (
    <Geographies geography={GEO_URL}>
      {({ geographies }) =>
        geographies.map((geo) => {
          const numericId = Number(geo.id);
          const code = getAlpha2FromNumeric(numericId);
          const isVisited = code ? visitedCodes.has(code) : false;
          const name: string = (geo.properties?.name as string | undefined) ?? code ?? String(numericId);

          return (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              onClick={() => {
                if (code) onCountryClick(code, name);
              }}
              style={{
                default: {
                  fill: isVisited ? "#3b82f6" : "#d1d5db",
                  stroke: "#ffffff",
                  strokeWidth: 0.5,
                  outline: "none",
                },
                hover: {
                  fill: isVisited ? "#2563eb" : "#9ca3af",
                  stroke: "#ffffff",
                  strokeWidth: 0.5,
                  outline: "none",
                  cursor: "pointer",
                },
                pressed: {
                  fill: isVisited ? "#1d4ed8" : "#6b7280",
                  outline: "none",
                },
              }}
            />
          );
        })
      }
    </Geographies>
  );
}

export default memo(CountryLayer);
