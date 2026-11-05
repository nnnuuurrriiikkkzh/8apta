import Link from "next/link";
import { Icon } from "@/components/icon";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="shell py-8 sm:py-12">
      <Link href="/" className="mb-7 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <Icon name="arrow" className="size-4 rotate-180" /> На главную
      </Link>
      <div className="grid overflow-hidden rounded-3xl border border-line bg-white lg:grid-cols-[0.9fr_1fr]">
        <aside className="hero-grid relative flex flex-col justify-between overflow-hidden bg-[#edf2e3] p-7 sm:p-10 lg:p-12">
          <div className="relative z-10">
            <p className="eyebrow text-[#647649]">ТВОЙ СЛЕДУЮЩИЙ ШАГ</p>
            <h2 className="mt-5 max-w-sm text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Возможности начинаются со знакомства.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-[#64705d]">
              Найди команду, в которой хочется расти. Или людей, с которыми получится больше.
            </p>
          </div>
          <div className="relative z-10 mt-12 hidden space-y-5 lg:block">
            {[
              ["search", "Работа под твои условия", "Выбирай направление, город и формат."],
              ["bookmark", "Важное всегда под рукой", "Сохраняй интересные вакансии."],
              ["people", "Люди с общими целями", "Знакомься с командами и кандидатами."],
            ].map(([icon, title, description]) => (
              <div key={title} className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/80"><Icon name={icon} /></span>
                <div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs leading-5 text-[#64705d]">{description}</p></div>
              </div>
            ))}
          </div>
          <span aria-hidden="true" className="absolute -bottom-12 -right-8 text-[220px] leading-none text-[#d9e5c7]">↗</span>
        </aside>
        <section className="min-w-0 p-6 sm:p-10 lg:p-12" aria-label="Форма доступа">
          <div className="mx-auto max-w-md">{children}</div>
        </section>
      </div>
      <p className="mt-5 text-center text-xs leading-5 text-muted">Учебный интерфейс JobHub · Используйте тестовые данные</p>
    </main>
  );
}
