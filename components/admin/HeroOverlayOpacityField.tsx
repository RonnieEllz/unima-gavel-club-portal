"use client";

import { useState } from "react";

export default function HeroOverlayOpacityField({ value }: { value: number }) {
  const [opacity, setOpacity] = useState(value);

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor="hero_overlay_opacity" className="label-field">Red overlay opacity</label>
        <output htmlFor="hero_overlay_opacity" className="text-sm font-semibold text-maroon-800">{opacity}%</output>
      </div>
      <input
        id="hero_overlay_opacity"
        name="hero_overlay_opacity"
        type="range"
        min="0"
        max="100"
        step="1"
        value={opacity}
        onChange={(event) => setOpacity(Number(event.target.value))}
        className="w-full accent-maroon-700"
      />
    </div>
  );
}