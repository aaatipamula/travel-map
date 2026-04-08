import type { Metadata } from "next";
import WorldMap from "@/components/map/WorldMap";

export const metadata: Metadata = { title: "Map — Mom's Travels" };

export default function MapPage() {
  return (
    <div className="flex flex-1 flex-col" style={{ minHeight: "calc(100vh - 56px)" }}>
      <WorldMap />
    </div>
  );
}
