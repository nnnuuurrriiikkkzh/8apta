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
export function employerId(data: Platform) { return data.employerAccountId || "hr"; }
export function companyOwnerId(data: Platform, company: Company) {
  return company.ownerId || (company.id === data.employerCompanyId ? employerId(data) : undefined);
}
export function accessibleCompanies(data: Platform, actorId = employerId(data)) {
  return data.companies.filter(company => companyOwnerId(data, company) === actorId || data.companyMembers?.some(member => member.companyId === company.id && member.userId === actorId));
}
export function employerCompany(data: Platform, actorId = employerId(data)) {
  const companies = accessibleCompanies(data, actorId);
  const selected = data.activeCompanyIds?.[actorId] || (actorId === employerId(data) ? data.employerCompanyId : undefined);
  return selected ? companies.find(company => company.id === selected) : companies[0];
}
export function switchCompany(data: Platform, companyId: string, actorId = employerId(data)) {
  if (!accessibleCompanies(data, actorId).some(company => company.id === companyId)) throw new CompanyRegistrationError("Нет доступа к этой компании.");
  data.activeCompanyIds = { ...data.activeCompanyIds, [actorId]: companyId };
  if (actorId === employerId(data)) data.employerCompanyId = companyId;
}
export type CompanyPermission = "profile" | "jobs" | "applications" | "analytics" | "team";
export function companyRole(data: Platform, actorId = employerId(data), companyId = employerCompany(data, actorId)?.id) {
  const company = data.companies.find(item => item.id === companyId);
  if (!company) return null;
  if (companyOwnerId(data, company) === actorId) return "owner";
  return data.companyMembers?.find(member => member.companyId === companyId && member.userId === actorId)?.role || null;
}
export function canManageCompany(data: Platform, permission: CompanyPermission, actorId = employerId(data), companyId = employerCompany(data, actorId)?.id) {
  const company = data.companies.find(item => item.id === companyId);
  if (!company || company.blocked) return false;
  const role = companyRole(data, actorId, companyId);
  return role === "owner" || role === "admin" || (role === "moderator" && permission === "jobs") || (role === "recruiter" && ["jobs", "applications", "analytics"].includes(permission));
}
export function requireCompanyPermission(data: Platform, permission: CompanyPermission, actorId: string, companyId?: string) {
  if (!canManageCompany(data, permission, actorId, companyId)) throw new CompanyRegistrationError("Недостаточно прав в этой компании или доступ был изменён.");
}
export function ownsJob(data: Platform, job?: Vacancy, actorId = employerId(data)) {
  const company = employerCompany(data, actorId);
  return Boolean(company && job && (job.companyId ? job.companyId === company.id : job.company === company.name));
}
export function employerCanPost(data: Platform, actorId = employerId(data)) {
  const company = employerCompany(data, actorId);
  return Boolean(company && canManageCompany(data, "jobs", actorId) && !Object.keys(companyErrors(company)).length);
}
export function createEmployerCompany(data: Platform, details: CompanyDetails) {
  const input = normalizeCompanyDetails(details);
  const errors = companyErrors(input, data.companies);
  if (Object.keys(errors).length) throw new CompanyRegistrationError(Object.values(errors)[0]);
  // Freeze legacy ownership before changing the active company pointer.
  const legacy = data.companies.find(company => company.id === data.employerCompanyId);
  if (legacy && !legacy.ownerId) legacy.ownerId = employerId(data);
  const company: Company = { ...input, id: crypto.randomUUID(), logo: "", verified: false, blocked: false, ownerId: employerId(data), ownerName: data.users?.find(user => user.id === "hr")?.name || "Владелец компании" };
  data.companies.push(company);
  switchCompany(data, company.id);
  return company;
}
