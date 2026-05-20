export function demoImageUrl(seed: string): string {
  const colors: Record<string, { bg: string; fg: string; icon: string }> = {
    playground: { bg: '#ffb800', fg: '#fff', icon: '🎠' },
    outdoor: { bg: '#44aa44', fg: '#fff', icon: '🏕️' },
    coding: { bg: '#0066cc', fg: '#fff', icon: '💻' },
    reading: { bg: '#8844cc', fg: '#fff', icon: '📚' },
    cooking: { bg: '#ee8833', fg: '#fff', icon: '🍳' },
  };
  const c = colors[seed] || { bg: '#4488ff', fg: '#fff', icon: '📷' };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="${c.bg}" rx="8"/>
  <text x="100" y="110" text-anchor="middle" font-size="60">${c.icon}</text>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}