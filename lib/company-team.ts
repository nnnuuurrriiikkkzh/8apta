import { audit, notify, type Platform, type Role } from "./platform";
import { companyOwnerId, CompanyRegistrationError, requireCompanyPermission } from "./employer-company";

export const companyRoles = { admin: "Администратор компании", moderator: "Модератор", recruiter: "Рекрутер" } as const;
export type CompanyRole = keyof typeof companyRoles;
export const companyRoleDetails = { admin: "Профиль, вакансии, отклики, аналитика и управление командой.", moderator: "Создание, редактирование, публикация и закрытие вакансий.", recruiter: "Вакансии, резюме кандидатов, статусы откликов, переписка и аналитика." };
export type CompanyMember = { id: string; companyId: string; userId: string; name: string; email: string; role: CompanyRole; joinedAt: string; accountRole: Role };
export type TeamRequest = { id: string; companyId: string; userId: string; name: string; email: string; role: CompanyRole; message: string; status: "Pending" | "Accepted" | "Rejected" | "Withdrawn"; date: string; decision: string; accountRole: Role };
export const teamRequestStatuses = { Pending: "Ожидает решения", Accepted: "Принята", Rejected: "Отклонена", Withdrawn: "Отозвана" };

function validRole(role: CompanyRole) {
  if (!Object.hasOwn(companyRoles, role)) throw new CompanyRegistrationError("Выбери роль в компании.");
}
export function requestTeamAccess(data: Platform, input: Omit<TeamRequest, "id" | "status" | "date" | "decision">) {
  const company = data.companies.find(item => item.id === input.companyId);
  if (!company || company.blocked || !companyOwnerId(data, company)) throw new CompanyRegistrationError("Компания пока не принимает заявки в команду.");
  if (!["seeker", "employer"].includes(input.accountRole)) throw new CompanyRegistrationError("Используй аккаунт соискателя или работодателя.");
  validRole(input.role);
  if (companyOwnerId(data, company) === input.userId || data.companyMembers?.some(member => member.companyId === company.id && member.userId === input.userId)) throw new CompanyRegistrationError("Ты уже в команде этой компании.");
  if (data.teamRequests?.some(request => request.companyId === company.id && request.userId === input.userId && request.status === "Pending")) throw new CompanyRegistrationError("Твоя заявка уже ожидает решения.");
  if (input.name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) || input.message.trim().length < 10 || input.message.length > 2000) throw new CompanyRegistrationError("Укажи имя, email и сообщение от 10 до 2000 символов.");
  const request: TeamRequest = { ...input, name: input.name.trim(), message: input.message.trim(), id: crypto.randomUUID(), status: "Pending", date: new Date().toISOString(), decision: "" };
  (data.teamRequests ??= []).unshift(request);
  notify(data, "employer", "Заявка в команду", `${request.name} · ${company.name}`, "/dashboard/employer/team", { companyId: company.id, recipientId: companyOwnerId(data, company) });
  audit(data, `${request.name}: заявка в команду`, request.name, company.id);
}
export function decideTeamRequest(data: Platform, id: string, actorId: string, decision: "Accepted" | "Rejected", role: CompanyRole, reason: string) {
  const request = data.teamRequests?.find(item => item.id === id);
  if (!request || request.status !== "Pending") throw new CompanyRegistrationError("Заявка уже обработана или отозвана.");
  requireCompanyPermission(data, "team", actorId, request.companyId);
  validRole(role);
  if (decision === "Rejected" && reason.trim().length < 3) throw new CompanyRegistrationError("Укажи причину отказа.");
  if (decision === "Accepted") {
    if (data.companyMembers?.some(member => member.companyId === request.companyId && member.userId === request.userId)) throw new CompanyRegistrationError("Этот сотрудник уже в команде.");
    (data.companyMembers ??= []).push({ id: crypto.randomUUID(), companyId: request.companyId, userId: request.userId, name: request.name, email: request.email, role, accountRole: request.accountRole, joinedAt: new Date().toISOString() });
  }
  request.status = decision; request.role = role; request.decision = reason.trim();
  const company = data.companies.find(item => item.id === request.companyId)!;
  notify(data, request.accountRole, decision === "Accepted" ? "Ты принят в команду" : "Решение по заявке в команду", `${company.name}: ${decision === "Accepted" ? companyRoles[role] : reason.trim()}`, request.accountRole === "seeker" ? "/dashboard/seeker/team" : "/dashboard/employer/memberships", { companyId: company.id, recipientId: request.userId });
  audit(data, `${request.name}: ${teamRequestStatuses[decision]} · ${companyRoles[role]}`, "Управление командой", company.id);
}
export function changeCompanyMember(data: Platform, id: string, actorId: string, role: CompanyRole | null) {
  const member = data.companyMembers?.find(item => item.id === id);
  if (!member) throw new CompanyRegistrationError("Сотрудник уже удалён из команды.");
  requireCompanyPermission(data, "team", actorId, member.companyId);
  if (member.userId === actorId) throw new CompanyRegistrationError("Свою роль меняет владелец или другой администратор компании.");
  if (role) { validRole(role); member.role = role; }
  else data.companyMembers = data.companyMembers!.filter(item => item.id !== id);
  notify(data, member.accountRole, role ? "Роль в компании изменена" : "Доступ к компании закрыт", role ? companyRoles[role] : "Ты больше не состоишь в команде компании.", member.accountRole === "seeker" ? "/dashboard/seeker/team" : "/dashboard/employer/memberships", { companyId: member.companyId, recipientId: member.userId });
  audit(data, `${member.name}: ${role ? companyRoles[role] : "удалён из команды"}`, "Управление командой", member.companyId);
}
export function withdrawTeamRequest(data: Platform, id: string, actorId: string) {
  const request = data.teamRequests?.find(item => item.id === id && item.userId === actorId);
  if (!request || request.status !== "Pending") throw new CompanyRegistrationError("Эту заявку уже нельзя отозвать.");
  request.status = "Withdrawn";
}
