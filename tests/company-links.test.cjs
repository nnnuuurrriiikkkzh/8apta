const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const ts = require('typescript');
const vm = require('node:vm');
const output = {};
vm.runInNewContext(ts.transpileModule(readFileSync(resolve(__dirname, '../lib/company-links.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { exports: output });
const { companyHref, splitCompanyMentions } = output;
const companies = [{ id: 'liniya', name: 'Линия' }, { id: 'orbita', name: 'Орбита' }];
const plain = value => JSON.parse(JSON.stringify(value));

test('Cyrillic names link inside punctuation, preserve case and original text', () => {
  const text = '«Линия» и ОРБИТА.\nСнова Линия — команда.';
  const parts = splitCompanyMentions(text, companies);
  assert.equal(parts.map(part => part.text).join(''), text);
  assert.deepEqual(plain(parts.filter(part => part.companyId).map(part => part.companyId)), ['liniya', 'orbita', 'liniya']);
  assert.deepEqual(plain(splitCompanyMentions(text, companies)), plain(parts));
});
test('Unknown names, partial words, email addresses and URL paths stay plain', () => {
  const text = 'Линиями, Орбитальная, СуперЛиния, Линия@example.com, https://example.com/Линия, другая компания';
  assert.deepEqual(plain(splitCompanyMentions(text, companies)), [{text}]);
});
test('Longest company name wins; regexp characters are interpreted literally', () => {
  const references = [...companies, { id: 'bank', name: 'Линия Банк' }, { id: 'plus', name: 'C++ (Lab)' }];
  assert.deepEqual(plain(splitCompanyMentions('Линия Банк / C++ (Lab)', references).filter(part => part.companyId).map(part => part.companyId)), ['bank', 'plus']);
});
test('Renaming keeps the stable URL and refreshes mention matching for a new snapshot', () => {
  const renamed = companies.map(company => company.id === 'liniya' ? {...company, name: 'Новая Линия'} : company);
  const match = splitCompanyMentions('Новая Линия', renamed)[0];
  assert.equal(companyHref(match.companyId), '/companies/liniya');
  assert.equal(companyHref('company / 1'), '/companies/company%20%2F%201');
  assert.deepEqual(plain(splitCompanyMentions('Линия', renamed)), [{text:'Линия'}]);
});
