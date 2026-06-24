export function normalizeSku(sku: string): string {
  return String(sku).trim().toUpperCase().replace(/\s+/g, '');
}
