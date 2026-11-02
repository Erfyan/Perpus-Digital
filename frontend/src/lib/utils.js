/**
 * Merge class names — lightweight alternative without external deps.
 * Filters out falsy values and joins the rest.
 */
export function cn(...inputs) {
  return inputs
    .flat(Infinity)
    .filter(Boolean)
    .join(' ');
}
