import { getProduct, products } from './catalog'

/**
 * Живой ИИ-планировщик: настоящий LLM через OpenAI-совместимый API
 * (по умолчанию https://api.hcnsec.cn/v1). Ключ и модель — в .env.
 * При отсутствии ключа или ошибке сети вызывающий код откатывается
 * на детерминированный скрипт из src/lib/ai.js.
 */

const BASE_URL = import.meta.env.VITE_LLM_BASE_URL || 'https://api.hcnsec.cn/v1'
const API_KEY = import.meta.env.VITE_LLM_API_KEY || ''
const MODEL = import.meta.env.VITE_LLM_MODEL || 'gpt-4o-mini'

export const hasLiveAI = () => Boolean(API_KEY)

/** Компактная выжимка каталога для промпта: id | название | цена | ед. | категория */
const catalogList = () =>
  products
    .map((p) => `${p.id} | ${p.name} | ${p.price} р./${p.unit} | ${p.cat}`)
    .join('\n')

const SYSTEM_PROMPT = `Ты — ИИ-помощник магазина стройматериалов «ОМА» (Беларусь). Твоя задача — помочь пользователю собрать закупку материалов для ремонта.

КАТАЛОГ ОМА (формат: id | название | цена | единица | категория):
${catalogList()}

ПРАВИЛА:
1. Прочитай сообщение пользователя. Извлеки: площадь (м²), объём/тип работ, стиль/цветовую гамму, бюджет.
2. Если ключевых данных не хватает (нет площади ИЛИ непонятно, какие работы нужны) — задай уточняющие вопросы. Максимум 3 вопроса за раз, коротко и по делу. К каждому вопросу предложи 2–4 готовых варианта ответа.
3. Когда данных достаточно — собери пакет материалов. Количество рассчитывай по площади с разумным запасом (например, клей и смеси — с запасом 10–20%).
4. id товаров бери СТРОГО из каталога выше. Не выдумывай id. Не включай бригады и услуги — только товары.
5. Пакет — 6–15 позиций: основные материалы, расходники и крепёж. Не дублируй одинаковые по смыслу товары.

ОТВЕТ — ТОЛЬКО JSON, без markdown, ровно в одном из двух форматов:

Уточняющие вопросы:
{"type":"questions","intro":"короткая фраза, что понял задачу","questions":[{"text":"какая площадь?","options":["20 м²","6 м²","40+ м²"]}]}

Готовый пакет:
{"type":"package","summary":"одно предложение о подобранном пакете","area":20,"items":[{"id":"cement-cem-42","qty":12}]}
где area — площадь в м² (число, если не названа — поставь 0), items — товары из каталога.`

/** Один ход диалога: история [{role, content}], возвращает разобранный JSON-ответ LLM */
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
      max_tokens: 1600,
    }),
    signal: AbortSignal.timeout(45000),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`LLM ${res.status}: ${text.slice(0, 200)}`)
  }
  const data = await res.json()
  const raw = data.choices?.[0]?.message?.content ?? ''
  return parseLlmJson(raw)
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
