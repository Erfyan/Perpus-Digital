/**
 * Merge class names — robust lightweight utility supporting strings,
 * conditionals, arrays, and object syntax { 'class-name': boolean }
 * without external dependencies.
 */
export function cn(...inputs) {
  const classes = [];

  const parse = (item) => {
    if (!item) return;
    if (typeof item === 'string' || typeof item === 'number') {
      classes.push(item);
    } else if (Array.isArray(item)) {
      item.forEach(parse);
    } else if (typeof item === 'object') {
      for (const [key, value] of Object.entries(item)) {
        if (value) classes.push(key);
      }
    }
  };

  inputs.forEach(parse);
  return classes.join(' ');
}
