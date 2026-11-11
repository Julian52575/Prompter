export interface KeepColor {
  hue: number;
  saturation: number;
  lightness: number;
}

/**
 * Maps a project name to a colour. FNV-1a over every UTF-16 unit, then an
 * avalanche mix, so order matters (anagrams differ) and length does not
 * drive the result. Hue takes most of the entropy; saturation and lightness
 * take the rest to spread names whose hues land close. Lightness stays dark
 * enough for white text (contrast >= 4.5). Distinct names can still collide:
 * there are fewer colours than strings.
 */
export function keepColor(name: string): KeepColor {
  let h = 0x811c9dc5;
  for (let i = 0; i < name.length; i++) h = Math.imul(h ^ name.charCodeAt(i), 0x01000193);
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  h >>>= 0;
  return {
    hue: h % 360,
    saturation: [45, 55, 65][Math.floor(h / 360) % 3],
    lightness: [20, 24, 28][Math.floor(h / 1080) % 3],
  };
}
