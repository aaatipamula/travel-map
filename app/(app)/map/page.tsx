import type { Metadata } from "next";
import WorldMap from "@/components/map/WorldMap";

export const metadata: Metadata = { title: "Map — Travel Map" };

export default function MapPage() {
  return (
    <div className="flex flex-1 flex-col min-h-0">
      <WorldMap />
    </div>
  );
}
