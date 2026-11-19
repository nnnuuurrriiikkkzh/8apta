import type { Company, Platform, Vacancy } from "./platform";

export type CompanyDetails = Pick<Company, "name" | "city" | "industry" | "size" | "email" | "website" | "description">;
export type CompanyErrors = Partial<Record<keyof CompanyDetails, string>>;
export class CompanyRegistrationError extends Error {}

export function emptyCompanyDetails(email = ""): CompanyDetails {
  return { name: "", city: "", industry: "", size: "", email, website: "", description: "" };
}
export function normalizeCompanyDetails(value: CompanyDetails): CompanyDetails {
  return { name: value.name.trim().replace(/\s+/g, " "), city: value.city.trim(), industry: value.industry.trim(), size: value.size.trim(), email: value.email.trim(), website: value.website.trim(), description: value.description.trim() };
}
export function companyErrors(value: CompanyDetails, companies: Company[] = [], editingId?: string): CompanyErrors {
  const input = normalizeCompanyDetails(value);
  const errors: CompanyErrors = {};
  if (input.name.length < 2 || input.name.length > 120) errors.name = "Название компании — от 2 до 120 символов.";
  else if (companies.some(company => company.id !== editingId && company.name.trim().replace(/\s+/g, " ").toLocaleLowerCase("ru") === input.name.toLocaleLowerCase("ru"))) errors.name = "Компания с таким названием уже есть. Укажи другое название.";
  if (input.city.length < 2 || input.city.length > 80) errors.city = "Укажи город — от 2 до 80 символов.";
  if (input.industry.length < 2 || input.industry.length > 120) errors.industry = "Укажи сферу деятельности — от 2 до 120 символов.";
  if (!input.size || input.size.length > 80) errors.size = "Укажи размер команды.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) || input.email.length > 254) errors.email = "Укажи корректный контактный email компании.";
  if (input.description.length < 30 || input.description.length > 5000) errors.description = "Расскажи о компании: от 30 до 5000 символов.";
  if (input.website) {
    try { const url = new URL(input.website); if (!["https:", "http:"].includes(url.protocol) || !url.hostname || input.website.length > 500) throw new Error(); }
    catch { errors.website = "Укажи адрес сайта с https:// или оставь поле пустым."; }
  }
  return errors;
}
export function employerCompany(data: Platform) {
  return data.companies.find(company => company.id === data.employerCompanyId);
}
export function ownsJob(data: Platform, job?: Vacancy) {
  const company = employerCompany(data);
  return Boolean(company && job && (job.companyId ? job.companyId === company.id : job.company === company.name));
}
export function employerCanPost(data: Platform) {
  const company = employerCompany(data);
  return Boolean(company && !company.blocked && !Object.keys(companyErrors(company)).length);
}
export function createEmployerCompany(data: Platform, details: CompanyDetails) {
  const input = normalizeCompanyDetails(details);
  const errors = companyErrors(input, data.companies);
  if (Object.keys(errors).length) throw new CompanyRegistrationError(Object.values(errors)[0]);
  const company: Company = { ...input, id: crypto.randomUUID(), logo: "", verified: false, blocked: false };
  data.companies.push(company);
  data.employerCompanyId = company.id;
  return company;
}
