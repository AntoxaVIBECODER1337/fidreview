import { Bath, Flame, Hammer, Layers, PaintRoller, Sofa, Sprout, Zap } from 'lucide-react'
import { getProduct } from './catalog'

/**
 * ИИ-помощник ОМА (логика из вкладки «Главное» репозитория oma-ozon,
 * переведённая на каталог products.json).
 * Распознаёт сценарий по ключевым словам, площадь — по числу «м²»,
 * и собирает 3 комплекта: Минимальный / Стандарт / Профессиональный.
 */

/* Бригады-партнёры ОМА */
export const CREWS = [
  { id: 'masterok', name: 'МастерОК', rating: 4.8, reviews: 214, rate: 35, term: 'старт через 3 дня' },
  { id: 'bylBuilder', name: 'БылБилдер', rating: 4.6, reviews: 156, rate: 28, term: 'старт через 5 дней' },
  { id: 'profiRem', name: 'Проф и Рем', rating: 4.9, reviews: 89, rate: 45, term: 'старт завтра' },
]

/**
 * Сценарии. qty — на базовую площадь 20 м²; perArea: true — количество
 * масштабируется по площади, иначе берётся как есть (инструмент, сантехника).
 */
export const SCENARIOS = [
  {
    id: 'floors',
    name: 'Стяжка и полы',
    Icon: Layers,
    task: 'Залить стяжку в комнате 20 м² под ламинат',
    keys: ['стяжк', 'пол', 'ламинат', 'линолеум', 'цемент', 'бетон'],
    kits: {
      min: [['cement-cem-42', 10, true], ['pesok-50', 14, true], ['uroven-60', 1]],
      std: [['cement-cem-42', 12, true], ['pesok-50', 16, true], ['laminate-sunfloor', 10, true], ['uroven-60', 1], ['uroven-lazerny', 1]],
      pro: [['cement-cem-42', 12, true], ['pesok-50', 16, true], ['laminate-sunfloor', 10, true], ['uroven-lazerny', 1], ['perforator-bosch', 1], ['nabor-burov', 1], ['dyubeli-8x60', 2]],
    },
  },
  {
    id: 'bath',
    name: 'Ванная',
    Icon: Bath,
    task: 'Ремонт ванной 6 м²: плитка, смеситель, раковина',
    keys: ['ванн', 'плитк', 'душ', 'санузел', 'туалет', 'унитаз', 'раковин', 'смесит'],
    base: 6,
    kits: {
      min: [['plitka-30x30', 7, true], ['klej-plitochny', 2, true], ['smesitel-grohe', 1], ['sifon-rakoviny', 1]],
      std: [['plitka-30x30', 8, true], ['klej-plitochny', 3, true], ['rakovina-55', 1], ['smesitel-grohe', 1], ['sifon-rakoviny', 1], ['smesitel-vanna', 1]],
      pro: [['plitka-30x30', 8, true], ['klej-plitochny', 3, true], ['rakovina-55', 1], ['smesitel-grohe', 1], ['sifon-rakoviny', 1], ['dushevaya-sistema', 1], ['unitaz-cersanit', 1], ['zerkalo-70x90', 1]],
    },
  },
  {
    id: 'electric',
    name: 'Электрика',
    Icon: Zap,
    task: 'Электрика в комнате 18 м²: кабель, розетки, свет',
    keys: ['электр', 'розетк', 'кабел', 'провод', 'свет', 'выключат', 'автомат', 'щиток'],
    kits: {
      min: [['reditel-kabel-2x2', 1], ['rozetka-legrand', 4, true], ['vyklyuchatel-2', 2], ['avtomat-16a', 2]],
      std: [['reditel-kabel-2x2', 1], ['rozetka-legrand', 6, true], ['vyklyuchatel-2', 3], ['avtomat-16a', 4], ['svetilnik-led-36', 2, true], ['lampa-led-9', 6]],
      pro: [['reditel-kabel-2x2', 2], ['rozetka-legrand', 8, true], ['vyklyuchatel-2', 3], ['avtomat-16a', 4], ['svetilnik-led-36', 3, true], ['perforator-bosch', 1], ['nabor-burov', 1], ['udlinitel-5', 1]],
    },
  },
  {
    id: 'walls',
    name: 'Стены',
    Icon: PaintRoller,
    task: 'Выровнять стены гипсокартоном в комнате 15 м²',
    keys: ['стен', 'гипсокартон', 'шпакл', 'перегород', 'выровн', 'покрас'],
    kits: {
      min: [['gipsokarton-12', 10, true], ['shpaklevka-finish', 3, true], ['samorezy-derevo', 2]],
      std: [['gipsokarton-12', 12, true], ['shpaklevka-finish', 4, true], ['samorezy-derevo', 3], ['dyubeli-8x60', 2], ['uroven-60', 1]],
      pro: [['gipsokarton-12', 12, true], ['shpaklevka-finish', 4, true], ['teplolux-izolyaciya', 4, true], ['samorezy-derevo', 3], ['dyubeli-8x60', 2], ['shurupovert-makita', 1], ['uroven-lazerny', 1]],
    },
  },
  {
    id: 'heating',
    name: 'Отопление',
    Icon: Flame,
    task: 'Поменять батареи и трубы отопления',
    keys: ['отоплен', 'батаре', 'радиатор', 'котёл', 'котел', 'труб', 'бойлер', 'водонагрев'],
    kits: {
      min: [['radiator-10', 2], ['truba-pp-25', 4]],
      std: [['radiator-10', 3], ['truba-pp-25', 6], ['nasos-tsirk', 1], ['filtr-vody-3', 1]],
      pro: [['radiator-10', 4], ['truba-pp-25', 8], ['nasos-tsirk', 1], ['kotel-24', 1], ['filtr-vody-3', 1]],
    },
  },
  {
    id: 'furniture',
    name: 'Мебель',
    Icon: Sofa,
    task: 'Обставить спальню: кровать, комод, шкаф',
    keys: ['мебел', 'спальн', 'шкаф', 'кроват', 'диван', 'комод', 'стол', 'гостин'],
    kits: {
      min: [['krovat-palermo', 1], ['komod-4', 1]],
      std: [['krovat-palermo', 1], ['komod-4', 1], ['shtory-blackout', 1], ['zerkalo-70x90', 1]],
      pro: [['krovat-palermo', 1], ['komod-4', 1], ['shkaf-kupe', 1], ['shtory-blackout', 1], ['podushka-dekor', 2], ['shurupovert-makita', 1]],
    },
  },
  {
    id: 'garden',
    name: 'Сад',
    Icon: Sprout,
    task: 'Привести в порядок участок: газон и полив',
    keys: ['сад', 'участ', 'газон', 'полив', 'дач', 'косил', 'трав', 'мангал'],
    kits: {
      min: [['shlang-sadovy', 1], ['poliv-kapelnyy', 1]],
      std: [['gazonokosilka', 1], ['shlang-sadovy', 1], ['poliv-kapelnyy', 2]],
      pro: [['gazonokosilka', 1], ['trimmer-benzin', 1], ['shlang-sadovy', 1], ['poliv-kapelnyy', 2], ['mangal', 1]],
    },
  },
  {
    id: 'repair',
    name: 'Инструмент',
    Icon: Hammer,
    task: 'Собрать набор инструментов для ремонта',
    keys: ['инструмент', 'дрел', 'шуруп', 'перфорат', 'болгар'],
    kits: {
      min: [['nabor-instrumentov', 1], ['uroven-60', 1]],
      std: [['shurupovert-makita', 1], ['nabor-instrumentov', 1], ['uroven-60', 1], ['samorezy-derevo', 1]],
      pro: [['shurupovert-makita', 1], ['perforator-bosch', 1], ['ugloshlifmashina', 1], ['nabor-burov', 1], ['uroven-lazerny', 1], ['nabor-instrumentov', 1]],
    },
  },
]

export const DEFAULT_TASK = SCENARIOS[0].task

const KIT_META = [
  { id: 'min', name: 'Минимальный', desc: 'Только необходимое, своими руками' },
  { id: 'std', name: 'Стандарт', desc: 'Материалы + удобный инструмент', badge: 'Популярный' },
  { id: 'pro', name: 'Профессиональный', desc: 'С запасом и профи-инструментом' },
]

/** Площадь из текста: «20 м²», «20м2», «20 кв.м», «20 квадратов» */
export function parseArea(text) {
  const m = text.toLowerCase().match(/(\d+(?:[.,]\d+)?)\s*(?:м²|м2|кв\.?\s*м|квадрат|метр)/)
  return m ? Math.min(Math.max(parseFloat(m[1].replace(',', '.')), 1), 500) : null
}

/** Сценарий по ключевым словам (больше совпадений — выше) */
export function detectScenario(text) {
  const t = text.toLowerCase()
  let best = null
  let bestScore = 0
  for (const s of SCENARIOS) {
    const score = s.keys.reduce((n, k) => n + (t.includes(k) ? 1 : 0), 0)
    if (score > bestScore) {
      best = s
      bestScore = score
    }
  }
  return best
}

/** Главная функция: задача → { scenario, area, kits[] } */
export function analyzeTask(text) {
  const scenario = detectScenario(text) ?? SCENARIOS[0]
  const base = scenario.base ?? 20
  const area = parseArea(text) ?? base
  const k = area / base

  const kits = KIT_META.map((meta) => {
    const items = scenario.kits[meta.id]
      .map(([id, qty, perArea]) => ({
        id,
        qty: perArea ? Math.max(1, Math.ceil(qty * k)) : qty,
        product: getProduct(id),
      }))
      .filter((i) => i.product)
    return { ...meta, items }
  })

  return { scenario, area, recognized: detectScenario(text) !== null, kits }
}

export const kitTotal = (items, excluded = new Set()) =>
  items.filter((i) => !excluded.has(i.id)).reduce((s, i) => s + i.product.price * i.qty, 0)
