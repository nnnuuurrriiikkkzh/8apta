import type { Role } from "./platform";

export const supportStatuses = { Open: "Новое", InProgress: "В работе", Waiting: "Нужен ваш ответ", Resolved: "Решено" } as const;
export type SupportStatus = keyof typeof supportStatuses;
export const supportCategories = ["Профиль и вход", "Резюме и файлы", "Вакансии и отклики", "Сообщения", "Ошибка на сайте", "Другое"];
export type SupportTicket = {
  id: string; subject: string; category: string; status: SupportStatus;
  ownerRole: Role; name: string; email: string; createdAt: string; updatedAt: string;
  messages: { id: string; author: "user" | "support"; text: string; date: string }[];
};
export const initialSupportTickets: SupportTicket[] = [{
  id: "support-demo-pdf", subject: "Как прикрепить PDF к резюме?", category: "Резюме и файлы", status: "Resolved",
  ownerRole: "seeker", name: "Александр Ким", email: "alex.demo@example.com", createdAt: "2026-11-04T08:00:00.000Z", updatedAt: "2026-11-04T09:00:00.000Z",
  messages: [
    { id: "support-demo-question", author: "user", text: "Здравствуйте! Где добавить PDF к моему резюме? Это пример обращения для знакомства с поддержкой.", date: "2026-11-04T08:00:00.000Z" },
    { id: "support-demo-answer", author: "support", text: "Откройте «Мои резюме», нажмите «Редактировать» и выберите PDF в поле вложения. Максимальный размер — 1 МБ. После загрузки сохраните резюме. Это демонстрационный ответ.", date: "2026-11-04T09:00:00.000Z" },
  ],
}];
