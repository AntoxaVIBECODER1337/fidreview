import {
  BadgePercent,
  Baby,
  BrickWall,
  Box,
  Car,
  Dumbbell,
  Drill,
  Flame,
  Flower2,
  Gift,
  Layers,
  HeartPulse,
  House,
  Lightbulb,
  MonitorSmartphone,
  Nut,
  Paintbrush,
  ShowerHead,
  Sofa,
  Sparkles,
  Sprout,
  TreePine,
  UtensilsCrossed,
  WashingMachine,
  Wrench,
} from 'lucide-react'

/**
 * Линейные иконки категорий — фолбэк, когда у карточки раздела
 * не задана картинка (поле `image` в categories.json) или она не загрузилась.
 */
const MAP = {
  akcii: BadgePercent,
  'paket-dekora': Gift,
  dekor: Flower2,
  interier: Paintbrush,
  blagoustroystvo: Sprout,
  stroymaterialy: BrickWall,
  instrument: Drill,
  mebel: Sofa,
  'bytovaya-tehnika': WashingMachine,
  'tovary-dlya-doma': House,
  santehnika: ShowerHead,
  electrika: Lightbulb,
  'inzhenernye-sistemy': Wrench,
  'sport-i-otdyh': Dumbbell,
  'novyy-god': TreePine,
  krepesh: Nut,
  avtotovary: Car,
  elektronika: MonitorSmartphone,
  'tovary-dlya-detey': Baby,
  'krasota-i-zdorove': HeartPulse,
  posuda: UtensilsCrossed,
  sezonnnye: Sparkles,
}

export const getCatIcon = (id) => MAP[id] ?? Box

/**
 * Виды работ (сценарии ИИ, специализации бригад) — из того же набора,
 * что и категории: ванная = сантехника, электрика = электрика и т.д.
 */
const WORK = {
  floors: Layers,
  bath: ShowerHead,
  electric: Lightbulb,
  walls: Paintbrush,
  heating: Flame,
  furniture: Sofa,
  garden: Sprout,
  cleaning: Sparkles,
  repair: Drill,
}

export const getWorkIcon = (id) => WORK[id] ?? Wrench
