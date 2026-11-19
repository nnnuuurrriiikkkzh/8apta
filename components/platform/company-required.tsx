"use client";
import { employerCompany } from "@/lib/employer-company";
import { usePlatform } from "./store";
import { Empty } from "./ui";

export function CompanyRequired() {
  const { data } = usePlatform();
  const company = employerCompany(data);
  return <Empty title={company?.blocked ? "Публикация вакансий недоступна" : "Сначала зарегистрируй компанию"} text={company?.blocked ? "Профиль компании скрыт модератором. Обратись в поддержку, чтобы уточнить причину." : "Заполни название, описание деятельности, город и контакты компании. После сохранения ты сможешь создавать и сразу публиковать вакансии."} href={company?.blocked ? "/support" : "/dashboard/employer/company"} label={company?.blocked ? "Служба поддержки" : "Заполнить профиль компании"} />;
}
