export function getFaqItems(catalog) {
  const base = catalog?.faq?.items ?? [];
  const extra = catalog?.faq?.seoExtraItems ?? [];
  const discovery = catalog?.faq?.seoDiscoveryItems ?? [];
  return [...base, ...extra, ...discovery];
}
