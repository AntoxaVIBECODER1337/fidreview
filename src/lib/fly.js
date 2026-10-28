/**
 * Микроанимация «полёта» товара в иконку корзины (нижнее меню).
 * Рисуем копию (иконку товара) поверх всего и ведём её по дуге
 * от кнопки к иконке корзины; по прилёту иконка «подпрыгивает».
 */
import { packGlyphMarkup } from '../components/PackIcon.jsx'

export function flyToCart(fromEl, glyph = packGlyphMarkup('📦'), image = null) {
  if (typeof document === 'undefined' || !fromEl) return
  const target = document.querySelector('[data-cart-target]')
  if (!target) return
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    bump(target)
    return
  }

  const a = fromEl.getBoundingClientRect()
  const b = target.getBoundingClientRect()
  const x0 = a.left + a.width / 2
  const y0 = a.top + a.height / 2
  const dx = b.left + b.width / 2 - x0
  const dy = b.top + b.height / 2 - y0

  const el = document.createElement('div')
  if (image) {
    el.style.backgroundImage = `url("${image}")`
    el.style.backgroundSize = 'cover'
    el.style.backgroundPosition = 'center'
  } else el.innerHTML = glyph
  el.setAttribute('aria-hidden', 'true')
  Object.assign(el.style, {
    position: 'fixed',
    left: `${x0 - 22}px`,
    top: `${y0 - 22}px`,
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px',
    borderRadius: '9999px',
    background: '#fff',
    boxShadow: '0 8px 24px rgb(30 58 92 / 0.25)',
    zIndex: '9999',
    pointerEvents: 'none',
  })
  document.body.appendChild(el)

  // Дуга: сначала вверх, потом вниз к корзине
  const lift = Math.min(-60, dy * 0.25 - 80)
  const anim = el.animate(
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.45}px, ${lift}px) scale(0.9)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0.6 },
    ],
    { duration: 650, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' },
  )
  anim.onfinish = () => {
    el.remove()
    bump(target)
  }
}

function bump(target) {
  target.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(0.92)' }, { transform: 'scale(1)' }],
    { duration: 420, easing: 'ease-out' },
  )
  window.dispatchEvent(new CustomEvent('cart:bump'))
}
