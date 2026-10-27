/**
 * Логотип ОМА — реальная картинка с oma.by (public/img/oma-logo.png).
 * Если файл не найден — рисуем точную копию в SVG.
 */
export default function Logo({ className = 'h-8 w-auto' }) {
  return (
    <img
      src="/img/oma-logo.png"
      alt="ОМА"
      className={className}
      onError={(e) => {
        // fallback: подменяем src на инлайновый SVG
        e.currentTarget.onerror = null
        e.currentTarget.src =
          'data:image/svg+xml;utf8,' +
          encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 132 64"><circle cx="28" cy="34" r="24" fill="#0b5bf5"/><path d="M44 58 L62 10 L80 58 Z" fill="#0b5bf5"/><path d="M68 58 L86 10 L104 58 Z" fill="#0b5bf5"/><path d="M92 58 L110 10 L128 58 Z" fill="#0b5bf5"/></svg>',
          )
      }}
    />
  )
}
