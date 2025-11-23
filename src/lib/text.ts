/** Obfuscate character name for challenge display (e.g., "Tung Tung ..." -> "Tu……"). */
export function obfuscateName(name: string): string {
  const w = name.split(/\s+/)[0] || name; // first word
  const firstTwo = w.slice(0, 2);
  return `${firstTwo}……`;
}
