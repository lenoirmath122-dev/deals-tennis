const eurFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatPrice(value: number): string {
  return eurFormatter.format(value);
}

export function formatDiscountBadge(percentage: number): string {
  return `-${percentage}%`;
}

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function formatFreshnessLabel(createdAt: string, expiresAt: string | null): string {
  return expiresAt ? `Jusqu'au ${formatDate(expiresAt)}` : `Ajouté le ${formatDate(createdAt)}`;
}
