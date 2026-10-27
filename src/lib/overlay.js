/**
 * Куда рендерить шторки и оверлеи: внутрь «экрана телефона»
 * (#overlay-root в App), а если его нет — в body.
 */
export const overlayRoot = () =>
  (typeof document !== 'undefined' && document.getElementById('overlay-root')) || document.body
