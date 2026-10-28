/**
 * Squarified treemap: раскладывает прямоугольники с площадью ∝ value
 * так, чтобы плитки были как можно ближе к квадрату.
 * items: [{ value, ...any }] → [{ ...item, x, y, w, h }] в долях контейнера (0..1).
 */
export function squarify(items, W = 1, H = 1) {
  const total = items.reduce((s, i) => s + i.value, 0)
  if (!total) return []
  const scale = (W * H) / total
  const nodes = [...items].sort((a, b) => b.value - a.value).map((i) => ({ ...i, a: i.value * scale }))
  const out = []
  let x = 0
  let y = 0
  let w = W
  let h = H

  const worst = (row, side) => {
    const s = row.reduce((t, n) => t + n.a, 0)
    const max = Math.max(...row.map((n) => n.a))
    const min = Math.min(...row.map((n) => n.a))
    return Math.max((side * side * max) / (s * s), (s * s) / (side * side * min))
  }

  const layoutRow = (row) => {
    const s = row.reduce((t, n) => t + n.a, 0)
    if (w >= h) {
      // строка — вертикальная колонка слева
      const cw = s / h
      let cy = y
      for (const n of row) {
        const nh = n.a / cw
        out.push({ ...n, x, y: cy, w: cw, h: nh })
        cy += nh
      }
      x += cw
      w -= cw
    } else {
      const rh = s / w
      let cx = x
      for (const n of row) {
        const nw = n.a / rh
        out.push({ ...n, x: cx, y, w: nw, h: rh })
        cx += nw
      }
      y += rh
      h -= rh
    }
  }

  let row = []
  for (const n of nodes) {
    const side = Math.min(w, h)
    if (!row.length || worst([...row, n], side) <= worst(row, side)) row.push(n)
    else {
      layoutRow(row)
      row = [n]
    }
  }
  if (row.length) layoutRow(row)
  return out
}
