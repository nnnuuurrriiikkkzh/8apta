type CompanyReference = { id: string; name: string };
type Mention = { text: string; companyId?: string };

export function companyHref(id: string) {
  return `/companies/${encodeURIComponent(id)}`;
}

const matchers = new WeakMap<readonly CompanyReference[], { pattern: RegExp; ids: Map<string, string> }>();

// Match complete company names, including Cyrillic, without changing the source text.
export function splitCompanyMentions(text: string, companies: readonly CompanyReference[]): Mention[] {
  if (!text || !companies.length) return [{ text }];
  let matcher = matchers.get(companies);
  if (!matcher) {
    const names = companies.map(company => company.name.trim()).filter(Boolean).sort((a, b) => b.length - a.length);
    if (!names.length) return [{ text }];
    const escaped = names.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    matcher = {
      pattern: new RegExp(`(?<![\\p{L}\\p{N}_/@])(?:${escaped.join("|")})(?![\\p{L}\\p{N}_@])`, "giu"),
      ids: new Map(companies.map(company => [company.name.trim().toLocaleLowerCase("ru"), company.id])),
    };
    matchers.set(companies, matcher);
  }
  const parts: Mention[] = [];
  let end = 0;
  for (const match of text.matchAll(matcher.pattern)) {
    if (match.index > end) parts.push({ text: text.slice(end, match.index) });
    parts.push({ text: match[0], companyId: matcher.ids.get(match[0].toLocaleLowerCase("ru")) });
    end = match.index + match[0].length;
  }
  if (end < text.length) parts.push({ text: text.slice(end) });
  return parts;
}
