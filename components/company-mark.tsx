import type { Company } from "@/lib/platform";

export function CompanyMark({ company }: { company: Company }) {
  const colors = ["#e9e1fa", "#dcecff", "#f9e7cd", "#e6edcc", "#f6dfe7"];
  const color = colors[[...company.id].reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % colors.length];
  return company.logo.startsWith("data:image/")
    ? <img src={company.logo} alt={`Логотип ${company.name}`} className="size-16 shrink-0 rounded-2xl object-cover" />
    : <span aria-hidden="true" style={{ background: color }} className="flex size-16 shrink-0 items-center justify-center rounded-2xl text-3xl font-bold">{company.name[0]}✦</span>;
}
