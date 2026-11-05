export const applicationStatuses = {
  Submitted: "Новая",
  Viewed: "Просмотрена",
  Interview: "Собеседование",
  Accepted: "Принята",
  Rejected: "Отклонена",
  Withdrawn: "Отозвана",
} as const;

export type ApplicationStatus = keyof typeof applicationStatuses;
export type Application = {
  id: string;
  name: string;
  jobId: string;
  city: string;
  experience: string;
  date: string;
  status: ApplicationStatus;
  skills: string[];
  summary: string;
  education: string;
  coverLetter: string;
};

// Вымышленные кандидаты на вакансии одной демонстрационной компании «Линия».
export const applications: Application[] = [
  { id: "demo-1", name: "Алина Садыкова", jobId: "product-designer", city: "Алматы", experience: "4 года", date: "2026-10-29", status: "Submitted", skills: ["Figma", "UX-исследования", "Design Systems"], summary: "Проектировала личные кабинеты и мобильные приложения. Проводила интервью с пользователями и развивала библиотеку компонентов в продуктовой команде.", education: "Бакалавриат, графический дизайн", coverLetter: "Мне близка ваша идея упрощать финансовые задачи для малого бизнеса. Хочу применить опыт исследования пользовательских сценариев в вашей команде." },
  { id: "demo-2", name: "Данияр Омаров", jobId: "junior-designer", city: "Астана", experience: "Без опыта", date: "2026-10-29", status: "Submitted", skills: ["Figma", "Auto Layout", "Прототипирование"], summary: "Завершил курс UI/UX-дизайна. В учебном портфолио — приложение для планирования бюджета и адаптивный сайт образовательного проекта.", education: "Курс UI/UX-дизайна, 2026", coverLetter: "Хочу начать карьеру в продуктовой команде. Готов учиться, участвовать в ревью и внимательно работать с обратной связью." },
  { id: "demo-3", name: "Мария Ким", jobId: "product-designer", city: "Алматы", experience: "5 лет", date: "2026-10-28", status: "Interview", skills: ["Figma", "UX/UI", "Аналитика"], summary: "Работала над B2B-продуктами: от исследования задач клиента до передачи макетов разработчикам. Вела дизайн-систему и помогала младшим дизайнерам.", education: "Бакалавриат, информационные системы", coverLetter: "Интересны сложные продуктовые задачи и работа в тесной связке с разработкой. Буду рада обсудить ваш продукт." },
  { id: "demo-4", name: "Тимур Асанов", jobId: "junior-designer", city: "Шымкент", experience: "6 месяцев", date: "2026-10-27", status: "Viewed", skills: ["UI", "Figma", "Адаптивный дизайн"], summary: "Прошёл стажировку в дизайн-студии. Собирал лендинги, адаптировал макеты для мобильных экранов и готовил компоненты для передачи в разработку.", education: "Студент, цифровой дизайн", coverLetter: "Ищу возможность развиваться в продуктовом дизайне. Мне нравится работать над понятными и доступными интерфейсами." },
  { id: "demo-5", name: "София Пак", jobId: "product-designer", city: "Астана", experience: "3 года", date: "2026-10-26", status: "Rejected", skills: ["Figma", "CJM", "UX/UI"], summary: "Разрабатывала интерфейсы интернет-магазинов, строила карты пользовательских путей и проверяла прототипы на интервью.", education: "Бакалавриат, коммуникационный дизайн", coverLetter: "Хочу перейти из электронной коммерции в финансовые продукты и принести опыт работы с пользовательскими воронками." },
  { id: "demo-6", name: "Арман Нурланов", jobId: "junior-designer", city: "Алматы", experience: "Без опыта", date: "2026-10-25", status: "Withdrawn", skills: ["Figma", "Типографика"], summary: "Работал над учебными проектами: каталог мероприятий и приложение для чтения. Интересуется типографикой и дизайном компонентов.", education: "Курс основ интерфейсного дизайна", coverLetter: "Готов начать со стажировки и развиваться вместе с командой." },
];
