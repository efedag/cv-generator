export function cvBaseFilename(fullName: string): string {
  const normalized = fullName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  if (!normalized) return 'cv';

  const parts = normalized.split(' ');
  const first = parts[0];
  const last = parts.length > 1 ? parts[parts.length - 1] : '';
  const base = last ? `${first}_${last}` : first;

  return base;
}
