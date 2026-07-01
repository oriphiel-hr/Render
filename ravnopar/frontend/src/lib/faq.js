export function getFaqItems(catalog) {
  const base = catalog?.faq?.items ?? [];
  const extra = catalog?.faq?.seoExtraItems ?? [];
  return [...base, ...extra];
}
