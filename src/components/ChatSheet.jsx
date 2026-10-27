import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HardHat, Phone, SendHorizontal } from 'lucide-react'
import { telHref } from '../data/crews'
import { QUICK_QUESTIONS, crewReply, greeting } from '../lib/crewChat'
import { cn } from '../lib/cn'
import { useStore } from '../store/StoreContext'
import Sheet from './Sheet.jsx'

/**
 * Чат с бригадой «до связи» — можно написать до оформления проекта.
 * История сохраняется; бригада «печатает» и отвечает (демо-ответы).
 */
export default function ChatSheet({ crew, onClose }) {
  const { chats, addMessage } = useStore()
  const messages = chats[crew.id] ?? []
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef(null)
  const timer = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, typing])

  useEffect(() => () => clearTimeout(timer.current), [])

  const send = (raw) => {
    const t = raw.trim()
    if (!t || typing) return
    addMessage(crew.id, 'me', t)
    setText('')
    setTyping(true)
    timer.current = setTimeout(() => {
      addMessage(crew.id, 'crew', crewReply(crew, t))
      setTyping(false)
    }, 1100)
  }

  const footer = (
    <div>
      {messages.length < 2 && (
        <div className="no-scrollbar -mx-4 mb-2.5 flex gap-1.5 overflow-x-auto px-4">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="h-8 shrink-0 rounded-full border border-brand-600/30 bg-brand-50/60 px-3 text-[12px] font-semibold text-brand-700 active:bg-brand-50"
            >
              {q}
            </button>
          ))}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(text)
        }}
        className="flex items-center gap-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Сообщение бригаде…"
          className="h-11 min-w-0 flex-1 rounded-full bg-panel px-4 text-[14px] text-navy placeholder:text-muted"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="submit"
          aria-label="Отправить"
          disabled={!text.trim() || typing}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white disabled:opacity-40"
        >
          <SendHorizontal size={18} />
        </motion.button>
      </form>
    </div>
  )

  return (
    <Sheet
      maxH="88dvh"
      onClose={onClose}
      title={
        <span className="flex items-center gap-2.5">
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-black text-white',
              crew.isOma ? 'bg-brand-600' : 'bg-navy',
            )}
          >
            {crew.isOma ? <HardHat size={18} /> : crew.name.slice(0, 1)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[17px] leading-tight">{crew.name}</span>
            <span className="flex items-center gap-1 text-[11.5px] font-semibold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> на связи · ответ ~{crew.responseMin} мин
            </span>
          </span>
          <a
            href={telHref(crew)}
            aria-label="Позвонить"
            className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 active:bg-brand-100"
          >
            <Phone size={16} />
          </a>
        </span>
      }
      footer={footer}
    >
      <div className="flex min-h-[38dvh] flex-col gap-2 pt-1 pb-1">
        <p className="mx-auto my-1 rounded-full bg-panel px-3 py-1 text-[11px] text-muted">
          Переписка через ОМА · номер телефона не обязателен
        </p>
        <Bubble from="crew" text={greeting(crew)} />
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <Bubble key={m.ts + m.from} from={m.from} text={m.text} animate />
          ))}
          {typing && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex w-fit gap-1 rounded-2xl rounded-bl-md bg-panel px-3.5 py-3"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-muted"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={endRef} />
      </div>
    </Sheet>
  )
}

function Bubble({ from, text, animate = false }) {
  const mine = from === 'me'
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 8, scale: 0.97 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      className={cn(
        'max-w-[82%] px-3.5 py-2.5 text-[13.5px] leading-snug',
        mine
          ? 'self-end rounded-2xl rounded-br-md bg-brand-600 text-white'
          : 'self-start rounded-2xl rounded-bl-md bg-panel text-navy',
      )}
    >
      {text}
    </motion.div>
  )
}
