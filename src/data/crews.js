/**
 * Бригады на маркетплейсе ОМА.
 * isOma: true — собственная бригада ОМА («ОМА Сервис»), всегда первая в своём городе.
 * Остальные — партнёры, зарегистрированные на ОМА как продавцы услуг
 * (по модели продавцов на Ozon / Wildberries): свой рейтинг, цена, специализации.
 */

export const CITIES = ['Минск', 'Брест', 'Витебск', 'Гомель', 'Гродно', 'Могилёв']

/** Специализации совпадают с id сценариев ИИ-помощника (src/lib/ai.js) */
export const SPECIALTIES = [
  { id: 'floors', label: 'Полы и стяжка' },
  { id: 'bath', label: 'Ванная' },
  { id: 'electric', label: 'Электрика' },
  { id: 'walls', label: 'Стены' },
  { id: 'heating', label: 'Отопление' },
  { id: 'furniture', label: 'Мебель' },
  { id: 'garden', label: 'Участок' },
]

export const specialtyLabel = (id) => SPECIALTIES.find((s) => s.id === id)?.label ?? id

export const CREWS = [
  {
    id: 'oma-service',
    phone: '+375 17 300-00-00',
    telegram: 'oma_service_demo',
    instagram: 'oma.service.demo',
    name: 'ОМА Сервис',
    isOma: true,
    cities: ['Минск', 'Брест', 'Гомель', 'Гродно'],
    rating: 4.9,
    reviews: 1240,
    rate: 38,
    startDays: 1,
    done: 3100,
    years: 8,
    team: 6,
    guarantee: 3,
    responseMin: 10,
    specialties: ['floors', 'bath', 'electric', 'walls', 'heating', 'furniture'],
    about:
      'Собственная бригада ОМА. Материалы со склада магазина без наценки, фиксированная смета, приёмка работ с представителем ОМА.',
    perks: ['Гарантия ОМА 3 года', 'Смета не меняется', 'Материалы со склада ОМА'],
    reviewsList: [
      { author: 'Ирина, Минск', rating: 5, text: 'Сделали ванную за 9 дней, смета не выросла ни на рубль. Мусор вывезли сами.' },
      { author: 'Павел, Гомель', rating: 5, text: 'Стяжка и ламинат в двух комнатах. Пришли вовремя, приёмка с менеджером ОМА.' },
    ],
  },
  {
    id: 'masterok',
    phone: '+375 29 101-11-01',
    telegram: 'masterok_brigada',
    instagram: 'masterok.remont',
    name: 'МастерОК',
    cities: ['Минск', 'Гродно'],
    rating: 4.8,
    reviews: 214,
    rate: 35,
    startDays: 3,
    done: 420,
    years: 5,
    team: 4,
    guarantee: 2,
    responseMin: 25,
    specialties: ['floors', 'walls', 'bath'],
    about: 'Отделка под ключ: стяжка, выравнивание стен, плитка. Работаем по договору.',
    perks: ['Договор', 'Гарантия 2 года'],
    reviewsList: [
      { author: 'Ольга, Минск', rating: 5, text: 'Аккуратные ребята, стены ровные, всё по уровню.' },
      { author: 'Сергей, Гродно', rating: 4, text: 'Хорошо, но на день задержали старт.' },
    ],
  },
  {
    id: 'bylbuilder',
    phone: '+375 33 202-22-02',
    telegram: 'bylbuilder_by',
    name: 'БылБилдер',
    cities: ['Минск', 'Брест', 'Витебск'],
    rating: 4.6,
    reviews: 156,
    rate: 28,
    startDays: 5,
    done: 260,
    years: 4,
    team: 5,
    guarantee: 1,
    responseMin: 40,
    specialties: ['floors', 'walls', 'furniture'],
    about: 'Черновые и чистовые работы по доступной цене. Сборка мебели.',
    perks: ['Низкая цена', 'Сборка мебели'],
    reviewsList: [
      { author: 'Денис, Витебск', rating: 5, text: 'Дешевле всех, качество нормальное.' },
      { author: 'Анна, Минск', rating: 4, text: 'Сделали, но пришлось напоминать про мелочи.' },
    ],
  },
  {
    id: 'profirem',
    phone: '+375 29 303-33-03',
    telegram: 'profirem_minsk',
    instagram: 'profi.rem',
    name: 'Проф и Рем',
    cities: ['Минск'],
    rating: 4.9,
    reviews: 89,
    rate: 45,
    startDays: 1,
    done: 140,
    years: 6,
    team: 3,
    guarantee: 2,
    responseMin: 15,
    specialties: ['bath', 'heating', 'electric'],
    about: 'Сантехника и отопление премиум-уровня. Монтаж котлов и тёплых полов.',
    perks: ['Старт завтра', 'Премиум-сантехника'],
    reviewsList: [
      { author: 'Максим, Минск', rating: 5, text: 'Поставили котёл и развели отопление за 2 дня.' },
    ],
  },
  {
    id: 'tok-plus',
    phone: '+375 44 404-44-04',
    telegram: 'tokplus_electro',
    name: 'Ток+',
    cities: ['Минск', 'Могилёв', 'Гомель'],
    rating: 4.7,
    reviews: 302,
    rate: 22,
    startDays: 2,
    done: 610,
    years: 7,
    team: 2,
    guarantee: 2,
    responseMin: 20,
    specialties: ['electric'],
    about: 'Электромонтаж в квартирах и домах: проводка, щитки, освещение. Допуск по электробезопасности.',
    perks: ['Допуск по электробезопасности', 'Узкий профиль'],
    reviewsList: [
      { author: 'Виктор, Могилёв', rating: 5, text: 'Поменяли проводку во всей квартире, всё подписано в щитке.' },
    ],
  },
  {
    id: 'aqua-brest',
    phone: '+375 29 505-55-05',
    telegram: 'aquadom_brest',
    instagram: 'aquadom.brest',
    name: 'АкваДом',
    cities: ['Брест', 'Гродно'],
    rating: 4.5,
    reviews: 74,
    rate: 32,
    startDays: 4,
    done: 120,
    years: 3,
    team: 3,
    guarantee: 1,
    responseMin: 60,
    specialties: ['bath', 'heating'],
    about: 'Ванные комнаты и санузлы под ключ, разводка труб.',
    perks: ['Ванная под ключ'],
    reviewsList: [{ author: 'Елена, Брест', rating: 4, text: 'Плитку положили красиво, по срокам чуть затянули.' }],
  },
  {
    id: 'sad-master',
    phone: '+375 33 606-66-06',
    telegram: 'zeleny_dvor',
    instagram: 'zeleny.dvor.by',
    name: 'Зелёный двор',
    cities: ['Минск', 'Гомель', 'Могилёв', 'Витебск'],
    rating: 4.8,
    reviews: 131,
    rate: 12,
    startDays: 2,
    done: 380,
    years: 5,
    team: 4,
    guarantee: 1,
    responseMin: 30,
    specialties: ['garden'],
    about: 'Благоустройство участков: газон, полив, дорожки, мангальные зоны.',
    perks: ['Газон под ключ', 'Выезд за город'],
    reviewsList: [{ author: 'Наталья, Гомель', rating: 5, text: 'Сделали газон и капельный полив, всё прижилось.' }],
  },
  {
    id: 'remstroy-vit',
    phone: '+375 29 707-77-07',
    telegram: 'remstroy_sever',
    name: 'РемСтрой Север',
    cities: ['Витебск', 'Могилёв'],
    rating: 4.4,
    reviews: 58,
    rate: 26,
    startDays: 3,
    done: 95,
    years: 2,
    team: 4,
    guarantee: 1,
    responseMin: 45,
    specialties: ['floors', 'walls', 'bath', 'electric'],
    about: 'Универсальная бригада: ремонт квартир от черновых до чистовых работ.',
    perks: ['Ремонт под ключ'],
    reviewsList: [{ author: 'Игорь, Витебск', rating: 4, text: 'Нормально сделали ремонт комнаты, цена адекватная.' }],
  },
  {
    id: 'teplo-gomel',
    phone: '+375 44 808-88-08',
    telegram: 'teplomontazh_by',
    name: 'ТеплоМонтаж',
    cities: ['Гомель', 'Брест'],
    rating: 4.7,
    reviews: 112,
    rate: 40,
    startDays: 2,
    done: 230,
    years: 9,
    team: 3,
    guarantee: 3,
    responseMin: 20,
    specialties: ['heating'],
    about: 'Отопление, котельные, тёплые полы. Сервисное обслуживание котлов.',
    perks: ['Гарантия 3 года', 'Сервис котлов'],
    reviewsList: [{ author: 'Андрей, Гомель', rating: 5, text: 'Котёл работает идеально уже второй сезон.' }],
  },
  {
    id: 'mebel-sborka',
    phone: '+375 29 909-99-09',
    telegram: 'sborkapro_by',
    instagram: 'sborkapro',
    name: 'СборкаПро',
    cities: ['Минск', 'Брест', 'Гомель', 'Гродно', 'Витебск', 'Могилёв'],
    rating: 4.6,
    reviews: 540,
    rate: 9,
    startDays: 1,
    done: 2100,
    years: 4,
    team: 8,
    guarantee: 1,
    responseMin: 15,
    specialties: ['furniture'],
    about: 'Сборка и установка мебели из ОМА в день доставки.',
    perks: ['В день доставки', 'Все города'],
    reviewsList: [{ author: 'Юлия, Гродно', rating: 5, text: 'Собрали шкаф-купе за 3 часа сразу после доставки.' }],
  },
]

export const startLabel = (d) => (d <= 1 ? 'старт завтра' : `старт через ${d} ${d < 5 ? 'дня' : 'дней'}`)

/** Рейтинг с учётом числа отзывов: 4.9 при 10 отзывах ниже, чем 4.8 при 400 */
const score = (c) => c.rating * 10 + Math.log10(c.reviews + 1) * 2

export const SORTS = [
  { id: 'rec', label: 'Рекомендуем', fn: (a, b) => score(b) - score(a) },
  { id: 'cheap', label: 'Дешевле', fn: (a, b) => a.rate - b.rate },
  { id: 'rating', label: 'По рейтингу', fn: (a, b) => b.rating - a.rating || b.reviews - a.reviews },
  { id: 'fast', label: 'Быстрее старт', fn: (a, b) => a.startDays - b.startDays },
]

/**
 * Бригады города: бригада ОМА (если есть в городе) всегда первая,
 * дальше партнёры по выбранной сортировке и фильтру специализации.
 */
export function crewsForCity(city, { specialty = null, sort = 'rec' } = {}) {
  const inCity = CREWS.filter((c) => c.cities.includes(city))
  const fits = (c) => !specialty || c.specialties.includes(specialty)
  const oma = inCity.find((c) => c.isOma && fits(c)) ?? null
  const sortFn = SORTS.find((s) => s.id === sort)?.fn ?? SORTS[0].fn
  const partners = inCity.filter((c) => !c.isOma && fits(c)).sort(sortFn)
  return { oma, partners, omaInCity: inCity.some((c) => c.isOma) }
}

/** Ближайшие города, где есть бригада ОМА (для подсказки) */
export const omaCities = () => CREWS.find((c) => c.isOma)?.cities ?? []

/** Ссылки для связи: звонок, Telegram, Instagram (демо-контакты) */
export const telHref = (c) => `tel:${c.phone.replace(/[^+\d]/g, '')}`
export const tgHref = (c) => `https://t.me/${c.telegram}`
export const igHref = (c) => `https://instagram.com/${c.instagram}`

export const crewById = (id) => CREWS.find((c) => c.id === id)

/** Что сохраняем в проекте — снимок бригады на момент выбора */
export const crewSnapshot = (c) => ({
  id: c.id,
  name: c.name,
  rate: c.rate,
  rating: c.rating,
  isOma: !!c.isOma,
  term: startLabel(c.startDays),
})
