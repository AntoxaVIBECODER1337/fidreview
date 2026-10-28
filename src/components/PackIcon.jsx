/**
 * Рисованные иконки пакетов декора — вместо эмодзи.
 * Единый линейный стиль в духе остальных иконок приложения:
 * viewBox 24×24, скруглённые штрихи, текущий цвет.
 */
const SHAPES = {
  // 🍳 кухня — кастрюля с крышкой и ушками
  '🍳': [
    '<path d="M4.5 11.5h15V15a4 4 0 0 1-4 4h-7a4 4 0 0 1-4-4z"/>',
    '<path d="M4.5 13.5h-2M19.5 13.5h2"/>',
    '<path d="M6.5 11.5a5.5 5.5 0 0 1 11 0z"/>',
    '<path d="M12 6V4.7"/>',
    '<circle cx="12" cy="3.6" r="1.1"/>',
  ].join(''),
  // 🛁 ванная — ванна с изливом и каплей
  '🛁': [
    '<path d="M3.5 13.5h17v2a5 5 0 0 1-5 5h-7a5 5 0 0 1-5-5z"/>',
    '<path d="M6.5 13.5V9a2.5 2.5 0 0 1 5 0v1.2"/>',
    '<circle cx="11.5" cy="12" r="0.7" fill="currentColor" stroke="none"/>',
  ].join(''),
  // 🚪 прихожая — дверь с филёнкой и ручкой
  '🚪': [
    '<rect x="5.5" y="3.5" width="13" height="17" rx="1.5"/>',
    '<rect x="7.5" y="5.5" width="9" height="7" rx="1"/>',
    '<circle cx="17.2" cy="15.8" r="0.9" fill="currentColor" stroke="none"/>',
    '<path d="M4 20.5h16"/>',
  ].join(''),
  // 🛋 гостиная — диван с подлокотниками и ножками
  '🛋': [
    '<path d="M4 12V9a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3"/>',
    '<rect x="3" y="12" width="18" height="6" rx="2"/>',
    '<path d="M12 12.5v5.5"/>',
    '<path d="M6 18v2M18 18v2"/>',
  ].join(''),
  // 🛏 спальня — кровать с изголовьем, подушкой и одеялом
  '🛏': [
    '<path d="M4 19.5V7"/>',
    '<rect x="4" y="13" width="16" height="5" rx="1.5"/>',
    '<rect x="6.5" y="9" width="5" height="4" rx="2"/>',
    '<path d="M15 13.5v4"/>',
    '<path d="M5 18v2M19 18v2"/>',
  ].join(''),
  // 📦 запасной вариант — посылка
  '📦': [
    '<rect x="4" y="7" width="16" height="13" rx="2"/>',
    '<path d="M4 11.5h16M12 7v4.5"/>',
  ].join(''),
}

/** Убирает вариантную последовательность (например, у «🛋️») перед поиском формы */
const norm = (emoji) => String(emoji || '').replace(/\uFE0F/g, '')

/** Внутренняя разметка формы для эмодзи пакета (fallback — посылка) */
export function glyphShape(emoji) {
  return SHAPES[norm(emoji)] || SHAPES['📦']
}

/** Готовый SVG-стринг — для анимации полёта в корзину (innerHTML) */
export function packGlyphMarkup(emoji, size = 26) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"` +
    ' fill="none" stroke="#1d5dbe" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
    `${glyphShape(emoji)}</svg>`
  )
}

/** Иконка пакета декора: рисованный SVG вместо эмодзи */
export default function PackIcon({ emoji, size = 34, className = '', strokeWidth = 1.7 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: glyphShape(emoji) }}
    />
  )
}
