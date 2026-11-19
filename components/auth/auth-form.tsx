"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/icon";
import { useDemoSession } from "./demo-session";
import { useSeeker } from "@/components/seeker/store";
import { usePlatform } from "@/components/platform/store";
import { CompanyFields } from "@/components/platform/company-fields";
import { companyErrors, createEmployerCompany, emptyCompanyDetails, type CompanyErrors } from "@/lib/employer-company";
import { audit, notify } from "@/lib/platform";

type Mode = "login" | "register" | "forgot";
type FieldName = "name" | "email" | "password" | "confirmation";
type Values = Record<FieldName, string>;
type Errors = Partial<Record<FieldName, string>>;

const content = {
  login: { title: "С возвращением!", subtitle: "Продолжи поиск своей следующей возможности.", button: "Войти" },
  register: { title: "Начнём знакомство", subtitle: "Выбери свою роль и заполни короткую форму.", button: "Создать аккаунт" },
  forgot: { title: "Забыли пароль?", subtitle: "Укажи email, связанный с аккаунтом.", button: "Получить ссылку" },
};

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { signIn, registerRole } = useDemoSession();
  const { save: saveSeeker } = useSeeker();
  const { data: platform, update: updatePlatform } = usePlatform();
  const [company, setCompany] = useState(emptyCompanyDetails);
  const [companyIssues, setCompanyIssues] = useState<CompanyErrors>({});
  const [formError, setFormError] = useState("");
  const [values, setValues] = useState<Values>({ name: "", email: "", password: "", confirmation: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [role, setRole] = useState("seeker");
  const [visible, setVisible] = useState({ password: false, confirmation: false });
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const successHeading = useRef<HTMLHeadingElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copy = content[mode];

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => { if (status === "success") successHeading.current?.focus(); }, [status]);

  function change(field: FieldName, value: string) {
    setValues(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: undefined, ...(field === "password" ? { confirmation: undefined } : {}) }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    setFormError("");
    const next: Errors = {};
    if (mode === "register" && values.name.trim().length < 2) next.name = "Укажи имя — минимум 2 символа.";
    if (!values.email.trim()) next.email = "Укажи email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) next.email = "Проверь адрес, например: name@example.com.";
    if (mode !== "forgot" && values.password.length < 8) next.password = "Пароль должен содержать минимум 8 символов.";
    if (mode === "register" && !values.confirmation) next.confirmation = "Повтори пароль.";
    else if (mode === "register" && values.password !== values.confirmation) next.confirmation = "Пароли не совпадают.";
    setErrors(next);
    const issues = mode === "register" && role === "employer" ? companyErrors(company, platform.companies) : {};
    setCompanyIssues(issues);
    const first = Object.keys(next)[0];
    if (first) {
      (form.current?.elements.namedItem(first) as HTMLInputElement | null)?.focus();
      return;
    }
    const companyField = Object.keys(issues)[0];
    if (companyField) { (form.current?.elements.namedItem(`company-${companyField}`) as HTMLInputElement | null)?.focus(); return; }
    setStatus("loading");
    if (mode === "login" || mode === "register") {
      if (mode === "register") {
        const name = values.name.trim().replace(/\s+/g, " ");
        const email = values.email.trim();
        const failure = role === "employer"
          ? updatePlatform(draft => {
              const registered = createEmployerCompany(draft, company);
              const employer = draft.users.find(user => user.id === "hr");
              if (employer) { employer.name = name; employer.email = email; }
              else draft.users.push({ id: "hr", name, email, role: "employer", blocked: false });
              audit(draft, `Зарегистрирована компания: ${registered.name}`, name);
              notify(draft, "moderator", "Новая компания", registered.name, "/moderator/companies");
            })
          : saveSeeker(current => ({ ...current, profile: { ...current.profile, name, email } }));
        if (failure) { setFormError(failure); setStatus("idle"); return; }
        registerRole(role === "employer" ? "employer" : "seeker");
      }
      else signIn();
      setValues(current => ({ ...current, password: "", confirmation: "" }));
      router.replace("/");
      return;
    }
    // Только локальная демонстрация ожидания. Никаких сетевых запросов или хранения пароля.
    timer.current = setTimeout(() => {
      setSubmittedEmail(values.email.trim());
      setValues(current => ({ ...current, password: "", confirmation: "" }));
      setStatus("success");
    }, 500);
  }

  function field(name: FieldName, label: string, placeholder: string, autoComplete: string) {
    const password = name === "password" || name === "confirmation";
    const shown = password && visible[name];
    const error = errors[name];
    return <div>
      <label htmlFor={`auth-${name}`} className="mb-2 block text-sm font-medium">{label}</label>
      <div className="relative">
        <input id={`auth-${name}`} name={name} value={values[name]} required disabled={status === "loading"}
          onChange={event => change(name, event.target.value)}
          type={password ? (shown ? "text" : "password") : name === "email" ? "email" : "text"}
          autoComplete={autoComplete} placeholder={placeholder} maxLength={name === "email" ? 254 : 100}
          aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : name === "password" ? "password-hint" : undefined}
          className="field disabled:opacity-60" style={{ paddingRight: password ? "6.2rem" : undefined, borderColor: error ? "#b54439" : undefined }} />
        {password && <button type="button" disabled={status === "loading"}
          onClick={() => setVisible(current => ({ ...current, [name]: !current[name] }))}
          aria-label={`${shown ? "Скрыть" : "Показать"} ${name === "confirmation" ? "повтор пароля" : "пароль"}`} aria-pressed={Boolean(shown)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-2 text-xs font-medium text-[#536646]">
          {shown ? "Скрыть" : "Показать"}
        </button>}
      </div>
      {error && <p id={`${name}-error`} className="mt-2 text-xs text-[#a4352d]">{error}</p>}
      {name === "password" && <p id="password-hint" className="mt-2 text-xs text-muted">Минимум 8 символов. Для демо не используй настоящий пароль.</p>}
    </div>;
  }

  if (status === "success" && mode !== "login") {
    return <div className="py-6 sm:py-10">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-lime"><Icon name="check" className="size-7" /></span>
      <p className="eyebrow mt-7 text-muted">ДЕМОНСТРАЦИЯ ЗАВЕРШЕНА</p>
      <h1 ref={successHeading} tabIndex={-1} className="mt-3 text-3xl font-semibold tracking-tight outline-none">
        {mode === "register" ? "Всё готово к знакомству" : "Запрос на восстановление готов"}
      </h1>
      <p className="mt-4 break-words text-sm leading-7 text-muted">
        {mode === "register" && <>Форма для роли «{role === "seeker" ? "Соискатель" : "Работодатель"}» заполнена. После подключения сервера на <strong className="text-ink">{submittedEmail}</strong> будет отправляться письмо для подтверждения.</>}
        {mode === "forgot" && <>После подключения сервера на <strong className="text-ink">{submittedEmail}</strong> будет отправляться ссылка для сброса пароля, если аккаунт существует.</>}
      </p>
      <p className="mt-5 rounded-xl bg-[#f0f4e8] p-4 text-xs leading-6 text-[#5d6f48]">Это UI-демонстрация. Аккаунт и сессия не создаются, пароли не сохраняются, письма не отправляются.</p>
      <Link href={mode === "forgot" ? "/reset-password" : "/verify-email"} className="btn btn-light mt-6 w-full">{mode === "forgot" ? "Показать смену пароля" : "Показать подтверждение email"}</Link>
      <Link href="/login" className="btn btn-primary mt-7 w-full">
        Перейти ко входу<Icon name="arrow" className="size-4" />
      </Link>
      <button type="button" onClick={() => { setStatus("idle"); setErrors({}); }} className="mt-4 w-full rounded-lg py-2 text-sm text-muted underline underline-offset-4">
        {mode === "forgot" ? "Указать другой email" : "Вернуться к форме"}
      </button>
    </div>;
  }

  return <>
    <p className="eyebrow text-[#738554]">{mode === "register" ? "ПРИСОЕДИНЯЙСЯ К JOBHUB" : mode === "forgot" ? "ВОССТАНОВЛЕНИЕ ДОСТУПА" : "РАДЫ ВИДЕТЬ ТЕБЯ"}</p>
    <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{copy.title}</h1>
    <p className="mt-3 text-sm leading-6 text-muted">{copy.subtitle}</p>
    <p id="auth-demo-note" className="mt-5 rounded-xl border border-[#e0e8d3] bg-[#f3f6ed] px-4 py-3 text-xs leading-5 text-[#5d6f48]">Демо интерфейса: данные не отправляются, аккаунты не создаются. Используй тестовый email и пароль.</p>

    <form ref={form} noValidate onSubmit={submit} aria-describedby="auth-demo-note" aria-busy={status === "loading"} className="mt-6 space-y-5">
      {mode === "register" && <fieldset disabled={status === "loading"}>
        <legend className="mb-3 text-sm font-medium">Я хочу</legend>
        <div className="grid grid-cols-2 gap-3">
          {[["seeker", "Найти работу", "briefcase"], ["employer", "Найти сотрудника", "people"]].map(([value, label, icon]) =>
            <label key={value} className={`flex cursor-pointer flex-wrap items-center gap-2 rounded-xl border p-3 text-xs font-medium sm:text-sm ${role === value ? "border-[#8ca761] bg-[#eff5e3]" : "border-line bg-white"}`}>
              <input type="radio" name="role" value={value} checked={role === value} onChange={() => setRole(value)} className="size-4 accent-ink" />
              <Icon name={icon} className="hidden size-4 sm:block" />{label}
            </label>)}
        </div>
      </fieldset>}
      {mode === "register" && field("name", "Имя", "Как к тебе обращаться?", "name")}
      {field("email", "Email", "name@example.com", "email")}
      {mode !== "forgot" && field("password", "Пароль", "Не менее 8 символов", mode === "register" ? "new-password" : "current-password")}
      {mode === "register" && field("confirmation", "Повтори пароль", "Ещё раз тот же пароль", "new-password")}
      {mode === "register" && role === "employer" && <section className="space-y-5 border-t border-line pt-6" aria-labelledby="company-registration-title"><div><h2 id="company-registration-title" className="text-xl font-semibold">Регистрация компании</h2><p className="mt-2 text-sm leading-6 text-muted">Расскажи о своей компании. После регистрации ты сможешь разместить первую вакансию, отправив её на модерацию.</p></div><CompanyFields value={company} onChange={(key, value) => { setCompany(current => ({ ...current, [key]: value })); setCompanyIssues(current => ({ ...current, [key]: undefined })); }} errors={companyIssues} disabled={status === "loading"} /></section>}
      {mode === "login" && <div className="text-right"><Link href="/forgot-password" className="text-sm font-medium underline decoration-[#b8c5a5] underline-offset-4 hover:text-[#648237]">Забыли пароль?</Link></div>}
      {(Object.values(errors).some(Boolean) || Object.values(companyIssues).some(Boolean)) && <p role="alert" className="text-xs text-[#a4352d]">Проверь отмеченные поля.</p>}
      {formError && <p role="alert" className="text-sm text-[#a4352d]">{formError}</p>}
      <button type="submit" disabled={status === "loading"} className="btn btn-primary w-full">
        {status === "loading" ? "Проверяем форму…" : mode === "register" && role === "employer" ? "Зарегистрировать компанию и аккаунт" : copy.button}<Icon name="arrow" className="size-4" />
      </button>
    </form>
    <div className="mt-6 border-t border-line pt-6 text-center text-sm text-muted">
      {mode === "login" ? <>Ещё нет аккаунта? <Link href="/register" className="font-semibold text-ink underline underline-offset-4">Зарегистрироваться</Link></>
        : <>{mode === "register" ? "Уже есть аккаунт? " : "Вспомнил пароль? "}<Link href="/login" className="font-semibold text-ink underline underline-offset-4">Войти</Link></>}
    </div>
  </>;
}
