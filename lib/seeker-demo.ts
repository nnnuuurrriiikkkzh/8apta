import { initialSeekerData } from "./seeker";
import type { Platform, Response } from "./platform";

// Stable IDs let existing browsers receive these examples once without duplicating user records.
const scenarios = [
  { id: "seeker-demo-design", jobId: "product-designer", resume: 0, status: "Interview", date: "2026-11-02T09:00:00.000Z", letter: "Здравствуйте! Мне близки ваши задачи в финтехе. В портфолио есть личный кабинет и дизайн-система. Буду рад обсудить продукт." },
  { id: "seeker-demo-frontend", jobId: "frontend-developer", resume: 1, status: "Viewed", date: "2026-11-03T08:00:00.000Z", letter: "Хочу присоединиться к команде Орбиты. Работаю с React и TypeScript, уделяю внимание адаптивности и доступности интерфейсов." },
  { id: "seeker-demo-content", jobId: "content-manager", resume: 2, status: "Submitted", date: "2026-11-05T07:00:00.000Z", letter: "Интересна частичная занятость в образовательном проекте. Готов помогать с контент-планом и понятными текстами." },
  { id: "seeker-demo-junior", jobId: "junior-designer", resume: 0, status: "Rejected", date: "2026-10-30T08:00:00.000Z", letter: "Хочу познакомиться с командой и узнать больше о дизайнерских задачах." },
] as const;

export const demoSeekerApplications: Response[] = scenarios.map(s => {
  const resume = initialSeekerData.resumes[s.resume];
  return { id: s.id, jobId: s.jobId, mine: true, status: s.status, date: s.date, name: resume.name, city: resume.city, experience: resume.experience, skills: resume.skills.split(", "), summary: resume.summary, education: resume.education, coverLetter: s.letter, resume: { ...resume } };
});

export const demoSeekerMessages: Platform["messages"] = [
  { id: "seeker-msg-1", applicationId: "seeker-demo-design", author: "employer", text: "Александр, здравствуйте! Посмотрели ваше портфолио. Особенно понравился кейс с личным кабинетом. Готовы познакомиться на видеовстрече?", date: "2026-11-03T09:00:00.000Z", read: true },
  { id: "seeker-msg-2", applicationId: "seeker-demo-design", author: "seeker", text: "Здравствуйте! Спасибо за обратную связь. Да, с удовольствием. Мне удобно в пятницу после 14:00 по времени Алматы.", date: "2026-11-03T09:20:00.000Z", read: true },
  { id: "seeker-msg-3", applicationId: "seeker-demo-design", author: "employer", text: "Тогда договорились на 6 ноября, 15:00. Встреча займёт около 30 минут: расскажем о команде и обсудим один из ваших проектов. Подготовьте, пожалуйста, кейс, которым гордитесь.", date: "2026-11-05T08:00:00.000Z", read: false },
  { id: "seeker-msg-4", applicationId: "seeker-demo-frontend", author: "employer", text: "Добрый день! Резюме передали руководителю разработки. Подскажите, работали ли вы с серверными компонентами Next.js?", date: "2026-11-04T10:00:00.000Z", read: true },
  { id: "seeker-msg-5", applicationId: "seeker-demo-frontend", author: "seeker", text: "Да, использовал их в учебном проекте каталога вакансий. Формы и фильтры делал клиентскими компонентами, страницы — серверными.", date: "2026-11-04T10:30:00.000Z", read: false },
  { id: "seeker-msg-6", applicationId: "seeker-demo-junior", author: "employer", text: "Спасибо за интерес к Линии! На стажировку выбрали другого кандидата. При этом ваш опыт подходит для продуктового направления — будем рады рассмотреть отдельный отклик на Product Designer.", date: "2026-11-01T08:00:00.000Z", read: true },
];

export const demoSeekerNotifications: Platform["notifications"] = [
  { id: "seeker-notice-interview", role: "seeker", title: "Приглашение на собеседование", text: "Линия · Product Designer. Встреча 6 ноября в 15:00. Подробности — в переписке.", href: "/messages?application=seeker-demo-design", date: "2026-11-05T08:00:00.000Z", read: false },
  { id: "seeker-notice-message", role: "seeker", title: "Новое сообщение от Линии", text: "Команда предложила время встречи и рассказала, как к ней подготовиться.", href: "/messages?application=seeker-demo-design", date: "2026-11-05T08:00:00.000Z", read: false },
  { id: "seeker-notice-sent", role: "seeker", title: "Отклик отправлен", text: "Поток · Контент-менеджер. К отклику приложены резюме и сопроводительное письмо.", href: "/dashboard/seeker/applications", date: "2026-11-05T07:00:00.000Z", read: true },
  { id: "seeker-notice-viewed", role: "seeker", title: "Резюме просмотрено", text: "Орбита просмотрела отклик на вакансию Frontend-разработчик и задала вопрос в чате.", href: "/messages?application=seeker-demo-frontend", date: "2026-11-04T10:00:00.000Z", read: true },
  { id: "seeker-notice-rejected", role: "seeker", title: "Получен ответ на отклик", text: "По вакансии Junior UI/UX Designer выбран другой кандидат. Комментарий работодателя доступен в чате.", href: "/messages?application=seeker-demo-junior", date: "2026-11-01T08:00:00.000Z", read: true },
];

export function addSeekerDemo(data: Platform): Platform {
  if (data.seekerDemoVersion === 1) return data;
  const additions = demoSeekerApplications.filter(example => !data.applications.some(a => a.id === example.id || (a.mine && a.jobId === example.jobId)) && data.jobs.some(j => j.id === example.jobId));
  const ids = new Set(additions.map(a => a.id));
  return {
    ...data, seekerDemoVersion: 1,
    applications: [...additions, ...data.applications],
    messages: [...data.messages, ...demoSeekerMessages.filter(m => ids.has(m.applicationId) && !data.messages.some(existing => existing.id === m.id))],
    notifications: [...demoSeekerNotifications.filter(n => {
      const applicationId = n.href.split("application=")[1];
      return !data.notifications.some(existing => existing.id === n.id) && (applicationId ? ids.has(applicationId) : ids.has("seeker-demo-content"));
    }), ...data.notifications],
  };
}
