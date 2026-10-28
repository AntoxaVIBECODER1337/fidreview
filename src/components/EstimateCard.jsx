import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Check, Minus, Pencil, Plus, ShoppingBag, ShoppingCart, Trash2 } from 'lucide-react'
import { getProduct } from '../lib/catalog'
import { rub } from '../lib/format'
import { useStore } from '../store/StoreContext'
import AddItemModal from './AddItemModal.jsx'
import ProductImage from './ProductImage.jsx'
import { Card, Tap } from './ui.jsx'

const round2 = (n) => Math.round(n * 100) / 100

/**
 * Смета проекта — карточка «Материалы ОМА».
 * Обычно: топ-5 позиций + итоги. Кнопка «Изменить» включает редактирование:
 * все позиции, изменение количества, удаление и добавление через поиск.
 * После этапа «Замер и подтверждение сметы» появляется кнопка
 * «Добавить смету в корзину».
 */
export default function EstimateCard({ project }) {
  const { addProjectItem, setProjectItemQty, addProjectToCart, showToast } = useStore()
  const [editing, setEditing] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  const lines = project.items.map((i) => ({ product: getProduct(i.id), qty: i.qty })).filter((l) => l.product)
  const total = project.itemsTotal + project.crewTotal
  /* Этап «Замер и подтверждение сметы» пройден → материалы можно сложить в корзину */
  const cartReady = project.status === 'active' && project.currentStage >= 1

  const changeQty = (id, qty, name) => {
    if (qty <= 0) {
      setProjectItemQty(project.id, id, 0)
      showToast(`«${name}» удалено из сметы`)
    } else setProjectItemQty(project.id, id, qty)
  }

  const toCart = () => {
    const n = addProjectToCart(project.id)
    if (n) showToast(`Смета в корзине — ${n} поз.`)
  }

  return (
    <Card className="p-4">
      <h2 className="mb-3 flex items-center gap-2 text-[15px] font-extrabold text-navy">
        <ShoppingBag size={16} className="shrink-0 text-brand-600" />
        <span className="min-w-0">Материалы ОМА • {lines.length} поз.</span>
        <span className="flex-1" />
        <Tap
          onClick={() => setEditing((v) => !v)}
          className="flex shrink-0 items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] font-bold text-navy transition-colors active:bg-panel"
        >
          {editing ? (
            <>
              <Check size={13} className="text-brand-600" /> Готово
            </>
          ) : (
            <>
              <Pencil size={13} /> Изменить
            </>
          )}
        </Tap>
      </h2>

      {!editing ? (
        <div className="flex flex-col gap-2">
          {lines.slice(0, 5).map((l) => (
            <div key={l.product.id} className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2 text-[12.5px] font-medium text-navy">
                <ProductImage product={l.product} size={14} rounded="rounded-md" className="h-7 w-7" />
                <span className="truncate">{l.product.name}</span>
                <span className="shrink-0 text-muted">×{l.qty}</span>
              </span>
              <span className="shrink-0 text-[12px] font-semibold text-muted">
                {rub(round2(l.product.price * l.qty))}
              </span>
            </div>
          ))}
          {lines.length > 5 && <p className="text-[11.5px] text-muted">…и ещё {lines.length - 5} поз.</p>}
          {lines.length === 0 && <p className="text-[12.5px] text-muted">Материалы уточняются на замере</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {lines.map((l) => (
            <div
              key={l.product.id}
              className="flex items-center gap-2 rounded-xl border border-line/70 bg-panel/40 p-2"
            >
              <ProductImage product={l.product} size={16} rounded="rounded-md" className="h-8 w-8" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-semibold text-navy">{l.product.name}</span>
                <span className="block text-[11px] text-muted">{rub(l.product.price)} / шт.</span>
              </span>
              <span className="flex h-8 shrink-0 items-center gap-0.5 rounded-lg border border-line bg-white px-1">
                <Tap
                  onClick={() => changeQty(l.product.id, l.qty - 1, l.product.name)}
                  aria-label="Меньше"
                  className="flex h-6 w-6 items-center justify-center rounded-md text-navy active:bg-panel"
                >
                  <Minus size={13} />
                </Tap>
                <span className="w-5 text-center text-[12.5px] font-bold text-navy">{l.qty}</span>
                <Tap
                  onClick={() => addProjectItem(project.id, l.product.id)}
                  aria-label="Больше"
                  className="flex h-6 w-6 items-center justify-center rounded-md text-navy active:bg-panel"
                >
                  <Plus size={13} />
                </Tap>
              </span>
              <Tap
                onClick={() => changeQty(l.product.id, 0, l.product.name)}
                aria-label="Удалить позицию"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors active:bg-red-50 active:text-red-600"
              >
                <Trash2 size={15} />
              </Tap>
            </div>
          ))}
          {lines.length === 0 && (
            <p className="py-1 text-[12.5px] text-muted">Смета пуста — добавьте материалы кнопкой ниже</p>
          )}
          {/* Пустое поле с плюсиком → поиск товара и добавление в смету */}
          <button
            onClick={() => setPickerOpen(true)}
            className="mt-1 flex w-full items-center gap-2.5 rounded-xl border-2 border-dashed border-brand-600/40 bg-brand-50/40 px-3 py-2.5 text-left transition-colors active:bg-brand-50"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600">
              <Plus size={15} className="text-white" />
            </span>
            <span className="text-[12.5px] font-bold text-brand-700">Добавить позицию в смету</span>
          </button>
        </div>
      )}

      <div className="mt-3 border-t border-dashed border-line pt-2.5">
        <div className="flex justify-between text-[12.5px]">
          <span className="text-muted">Материалы</span>
          <span className="font-semibold text-navy">{rub(round2(project.itemsTotal))}</span>
        </div>
        {project.crewTotal > 0 && (
          <div className="mt-1 flex justify-between text-[12.5px]">
            <span className="text-brand-600">
              Работа {project.crew?.name} • {project.area} м²
            </span>
            <span className="font-semibold text-brand-600">{rub(project.crewTotal)}</span>
          </div>
        )}
        <div className="mt-2 flex justify-between">
          <span className="text-[13px] font-bold text-navy">Итого</span>
          <span className="text-[15px] font-black text-navy">{rub(round2(total))}</span>
        </div>
        {cartReady && lines.length > 0 && (
          <Tap
            onClick={toCart}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-[13.5px] font-bold text-white transition-colors active:bg-brand-700"
          >
            <ShoppingCart size={16} /> Добавить смету в корзину
          </Tap>
        )}
      </div>

      <AnimatePresence>
        {pickerOpen && (
          <AddItemModal
            onClose={() => setPickerOpen(false)}
            onPick={(p) => {
              addProjectItem(project.id, p.id)
              showToast(`«${p.name}» — в смете`)
            }}
          />
        )}
      </AnimatePresence>
    </Card>
  )
}
