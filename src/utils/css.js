const hslToHex = (hsl) => {
  const match = hsl.match(/hsl\(\s*(\d+),\s*(\d+)%?,\s*(\d+)%?\s*\)/i);
  if (!match) return hsl;

  let [_, h, s, l] = match;
  h = Number(h);
  s = Number(s) / 100;
  l = Number(l) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (v) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const cssVar = (name) => {
	const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
	return value.startsWith('hsl') ? hslToHex(value) : value;
}
