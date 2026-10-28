import {
  Archive,
  ArrowUpDown,
  Baby,
  Bath,
  BedDouble,
  Briefcase,
  Car,
  CookingPot,
  DoorOpen,
  Dumbbell,
  Fence,
  Flame,
  House,
  Shirt,
  Sofa,
  Sun,
  Thermometer,
  Toilet,
  Trees,
  Utensils,
  Warehouse,
} from 'lucide-react'

/** Тип жилья: от него зависит список типов комнат */
export const DWELLINGS = [
  { id: 'apartment', label: 'Квартира' },
  { id: 'house', label: 'Дом' },
]

/**
 * Типы комнат. scope: 'all' — есть и в квартире, и в доме; 'house' — только в доме.
 * work — вид работ для ИИ и бригад (src/lib/ai.js, src/data/crews.js).
 */
export const ROOM_TYPES = [
  { id: 'kitchen', label: 'Кухня', Icon: CookingPot, scope: 'all', work: 'floors' },
  { id: 'kitchen-living', label: 'Кухня-гостиная', Icon: Utensils, scope: 'all', work: 'floors' },
  { id: 'living', label: 'Гостиная', Icon: Sofa, scope: 'all', work: 'walls' },
  { id: 'bedroom', label: 'Спальня', Icon: BedDouble, scope: 'all', work: 'walls' },
  { id: 'kids', label: 'Детская', Icon: Baby, scope: 'all', work: 'walls' },
  { id: 'study', label: 'Кабинет', Icon: Briefcase, scope: 'all', work: 'walls' },
  { id: 'bath', label: 'Ванная', Icon: Bath, scope: 'all', work: 'bath' },
  { id: 'wc', label: 'Санузел', Icon: Toilet, scope: 'all', work: 'bath' },
  { id: 'hall', label: 'Прихожая', Icon: DoorOpen, scope: 'all', work: 'floors' },
  { id: 'corridor', label: 'Коридор / холл', Icon: DoorOpen, scope: 'all', work: 'floors' },
  { id: 'wardrobe', label: 'Гардеробная', Icon: Shirt, scope: 'all', work: 'furniture' },
  { id: 'storage', label: 'Кладовая', Icon: Archive, scope: 'all', work: 'walls' },
  { id: 'balcony', label: 'Балкон / лоджия', Icon: Sun, scope: 'all', work: 'walls' },
  { id: 'gym', label: 'Спортзал', Icon: Dumbbell, scope: 'all', work: 'floors' },
  { id: 'attic', label: 'Мансарда', Icon: House, scope: 'house', work: 'walls' },
  { id: 'stairs', label: 'Лестница', Icon: ArrowUpDown, scope: 'house', work: 'floors' },
  { id: 'terrace', label: 'Терраса / веранда', Icon: Fence, scope: 'house', work: 'garden' },
  { id: 'boiler', label: 'Котельная', Icon: Flame, scope: 'house', work: 'heating' },
  { id: 'sauna', label: 'Баня / сауна', Icon: Thermometer, scope: 'house', work: 'bath' },
  { id: 'garage', label: 'Гараж', Icon: Car, scope: 'house', work: 'floors' },
  { id: 'basement', label: 'Подвал / погреб', Icon: Warehouse, scope: 'house', work: 'walls' },
  { id: 'yard', label: 'Двор / участок', Icon: Trees, scope: 'house', work: 'garden' },
]

export const roomType = (id) => ROOM_TYPES.find((t) => t.id === id) ?? ROOM_TYPES[2]

export const roomTypesFor = (dwelling) =>
  ROOM_TYPES.filter((t) => t.scope === 'all' || dwelling === 'house')

/** Состояние ремонта комнаты */
export const ROOM_STATUSES = [
  { id: 'free', label: 'Свободно' },
  { id: 'rough', label: 'Черновой' },
  { id: 'work', label: 'В работе' },
  { id: 'done', label: 'Готово' },
]

export const statusLabel = (id) => ROOM_STATUSES.find((s) => s.id === id)?.label ?? 'Свободно'

/* ---------- Расчёты ---------- */

const num = (v) => {
  const n = parseFloat(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? n : 0
}
export const toNum = num
const r1 = (n) => Math.round(n * 10) / 10

export const perimeter = (room) => r1((room.walls ?? []).reduce((s, w) => s + num(w), 0))

/** Площадь по стенам: прямоугольник (4 стены a, b, a, b) или пара сторон */
export function areaFromWalls(walls = []) {
  const w = walls.map(num).filter(Boolean)
  if (w.length === 2) return r1(w[0] * w[1])
  if (w.length === 4) return r1(((w[0] + w[2]) / 2) * ((w[1] + w[3]) / 2))
  return 0
}

/** Площадь стен (под покраску, обои, плитку) — периметр × высота */
export const wallArea = (room) => r1(perimeter(room) * num(room.height))

export const roomArea = (room) => num(room.area) || areaFromWalls(room.walls)

/* ---------- Демо-планировка: 2-комн. квартира 64 м² ---------- */

let seq = 0
const rid = () => `r${Date.now().toString(36)}${(seq++).toString(36)}`
export const newId = rid

export function demoLayout() {
  const floor = { id: 'f1', name: '1 этаж' }
  const room = (name, type, area, walls, status, items = [], height = 2.7) => ({
    id: rid(),
    floorId: floor.id,
    name,
    type,
    area,
    height,
    walls,
    status,
    items,
    note: '',
  })
  return {
    name: '2-комн. квартира',
    dwelling: 'apartment',
    floors: [floor],
    rooms: [
      room('Гостиная', 'living', 18, [4.5, 4, 4.5, 4], 'free', [{ id: 'laminate-sunfloor', qty: 9 }, { id: 'dekor-living-2-1', qty: 1 }]),
      room('Спальня', 'bedroom', 14, [4, 3.5, 4, 3.5], 'rough'),
      room('Кухня', 'kitchen', 12, [4, 3, 4, 3], 'work', [
        { id: 'stol-obedenny', qty: 1 },
        { id: 'smesitel-grohe', qty: 1 },
        { id: 'plitka-30x30', qty: 6 },
      ]),
      room('Холл', 'corridor', 10, [5, 2, 5, 2], 'free'),
      room('Балкон', 'balcony', 6, [4, 1.5, 4, 1.5], 'free', [], 2.6),
      room('Ванная', 'bath', 4, [2, 2, 2, 2], 'done', [
        { id: 'klej-plitochny', qty: 2 },
        { id: 'plitka-30x30', qty: 8 },
        { id: 'smesitel-vanna', qty: 1 },
      ], 2.5),
    ],
  }
}

export const emptyLayout = (dwelling = 'apartment') => ({
  name: dwelling === 'house' ? 'Мой дом' : 'Моя квартира',
  dwelling,
  floors: [{ id: 'f1', name: '1 этаж' }],
  rooms: [],
})
