import { getProduct, products } from './catalog'

/**
 * Живой ИИ-планировщик: настоящий LLM через OpenAI-совместимый API
 * (по умолчанию https://api.hcnsec.cn/v1). Ключ и модель — в .env.
 * При отсутствии ключа или ошибке сети вызывающий код откатывается
 * на детерминированный скрипт из src/lib/ai.js.
 */

/**
 * Базовый URL LLM API. По умолчанию — относительный путь через dev-прокси
 * Vite (/llm-api → https://open.bigmodel.cn/api/paas/v4): браузер не может
 * ходить на bigmodel.cn напрямую из-за CORS. Можно переопределить в .env.
 */
const BASE_URL = import.meta.env.VITE_LLM_BASE_URL || '/llm-api'
const API_KEY = import.meta.env.VITE_LLM_API_KEY || ''
const MODEL = import.meta.env.VITE_LLM_MODEL || 'glm-5.3-flash'

export const hasLiveAI = () => Boolean(API_KEY)

/** Компактная выжимка каталога для промпта: id | название | цена | ед. | категория */
const catalogList = () =>
  products
    .map((p) => `${p.id} | ${p.name} | ${p.price} р./${p.unit} | ${p.cat}`)
    .join('\n')

const SYSTEM_PROMPT = `Ты — ИИ-помощник магазина стройматериалов «ОМА» (Беларусь). Твоя задача — помочь пользователю собрать закупку материалов для ремонта. Все цены и суммы — в белорусских рублях (р.), никогда не используй ₽ или $.

КАТАЛОГ ОМА (формат: id | название | цена | единица | категория):
${catalogList()}

ПРАВИЛА:
1. Прочитай сообщение пользователя. Твоя цель — собрать ДЕТАЛЬНЫЙ пакет материалов, поэтому сначала собери анкету.
2. АНКЕТА — максимум 2 раунда вопросов, не больше:
   РАУНД 1 (первый твой ответ — всегда вопросы, 3–4 штуки из базы):
   - Площадь работ (м²)
   - Объём работ: косметический / капитальный / одна зона / только замена материалов
   - Стиль и цветовая гамма: светлые / тёмные / нейтральные / конкретный стиль
   - Бюджет: эконом / стандарт / премиум / не ограничен
   РАУНД 2 (2–3 вопроса — только то, чего не хватает, приоритет сверху):
   - Аренда оборудования: включить инструмент в пакет (перфоратор, лазерный уровень, болгарка) или у пользователя всё есть
   - Кто делает работы: сам пользователь (тогда в пакет идёт инструмент) / бригада (только материалы и расходники) / ещё не решил
   - Качество и бренды: эконом-сегмент / средний / топ-бренды (Makita, Bosch, Legrand) / без разницы
   - Особые условия помещения: влажное (санузел — влагостойкие материалы) / дети и питомцы (безопасные покрытия) / ничего особенного
   - Сроки: всё сразу / поэтапно
   - Что уже куплено: ничего / часть материалов (не дублировать в пакете)
3. Если пользователь ответил «не важно», «на твой выбор» или уже дал достаточно данных — НЕ переспрашивай, сразу собирай пакет. Третий раунд вопросов запрещён.
4. id товаров бери СТРОГО из каталога выше. Не выдумывай id. Не включай бригады и услуги — только товары.
5. Пакет — 8–20 позиций: основные материалы, расходники, крепёж, при необходимости инструмент (если пользователь выбрал аренду/сам делает). Количество рассчитывай по площади с разумным запасом (смеси, клей, краска — +10–20%). Не дублируй одинаковые по смыслу товары.

ОТВЕТ — ТОЛЬКО JSON, без markdown, ровно в одном из двух форматов:

Уточняющие вопросы:
{"type":"questions","intro":"короткая фраза, что понял задачу","questions":[{"text":"какая площадь?","options":["20 м²","6 м²","40+ м²"]}]}

Готовый пакет:
{"type":"package","summary":"одно предложение о подобранном пакете","area":20,"items":[{"id":"cement-cem-42","qty":12}]}
где area — площадь в м² (число, если не названа — поставь 0), items — товары из каталога.`

/**
 * Один ход диалога: история [{role, content}], возвращает разобранный JSON-ответ LLM.
 * GLM API отдаёт потоковый ответ (SSE), читаем стрим и склеиваем
 * дельты content в полный текст.
 */
export async function runTurn(history) {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
      temperature: 0.4,
      max_tokens: 2000,
      stream: true,
      /* Zhipu glm-5.3-flash всегда думает — ставим минимальный бюджет размышлений */
      reasoning_effort: 'low',
    }),
    signal: AbortSignal.timeout(60000),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`LLM ${res.status}: ${text.slice(0, 200)}`)
  }
  const raw = await readSseContent(res)
  if (!raw.trim()) throw new Error('LLM вернул пустой ответ')
  return parseLlmJson(raw)
}

/** Читает SSE-стрим OpenAI-формата и собирает полный текст ответа */
async function readSseContent(res) {
  /* Fallback на обычный JSON, если стрим недоступен */
  if (!res.body || typeof res.body.getReader !== 'function') {
    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? ''
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  let out = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop()
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const payload = trimmed.slice(5).trim()
      if (!payload || payload === '[DONE]') continue
      try {
        const json = JSON.parse(payload)
        const delta = json.choices?.[0]?.delta
        if (delta?.content) out += delta.content
      } catch {
        /* неполный чанк — игнорируем */
      }
    }
  }
  return out
}

/** Достаём JSON из ответа (LLM иногда оборачивает в ```json) */
function parseLlmJson(raw) {
  const cleaned = raw.replace(/```json|```/g, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('LLM вернул не JSON')
  return JSON.parse(cleaned.slice(start, end + 1))
}

/** Валидация пакета: только существующие товары, qty >= 1 */
export function sanitizePackage(pkg) {
  const items = (pkg.items ?? [])
    .map((i) => ({ id: i.id, qty: Math.max(1, Math.round(Number(i.qty) || 1)), product: getProduct(i.id) }))
    .filter((i) => i.product)
  return { ...pkg, items }
}

/**
 * Пакет от LLM → форма результата для AIResultSheet (как у scripted analyzeTask,
 * но с одним комплектом «Подборка ИИ»). area=0 заменяем на 20 — дефолт шторки.
 */
export function buildLiveResult(pkg) {
  const area = Number(pkg.area) > 0 ? Math.round(Number(pkg.area) * 10) / 10 : 20
  const summary = pkg.summary || 'Подобрал материалы под твою задачу'
  return {
    live: true,
    summary,
    area,
    scenario: { id: 'live', name: 'Живой ИИ', Icon: null },
    recognized: true,
    kits: [
      {
        id: 'live',
        name: 'Подборка ИИ',
        desc: summary,
        badge: 'Живой ИИ',
        items: pkg.items,
      },
    ],
  }
}
