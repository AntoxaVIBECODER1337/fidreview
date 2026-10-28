import { motion } from 'framer-motion'
import { PackCard } from '../components/DecorPacks.jsx'
import Header from '../components/Header.jsx'
import { staggerChild, staggerParent } from '../components/ui.jsx'
import { DECOR_PACKS } from '../lib/decor'

/** Все пакеты декора */
export default function DecorPacksPage() {
  return (
    <div className="min-h-dvh bg-bg">
      <Header back title="Пакеты декора" />
      <p className="px-5 pt-4 text-[13px] leading-snug text-[#3f4756]">
        Выберите комнату — соберём набор декора из каталога ОМА. Каждую позицию можно заменить на один из 5
        вариантов или убрать.
      </p>
      <motion.div
        variants={staggerParent}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 items-stretch gap-3 px-4 pt-4 pb-6"
      >
        {DECOR_PACKS.map((p) => (
          <motion.div key={p.id} variants={staggerChild} className="h-full">
            <PackCard pack={p} wide />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
