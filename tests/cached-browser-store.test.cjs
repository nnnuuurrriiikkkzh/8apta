const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const ts = require('typescript');
const vm = require('node:vm');

function fixture() {
  const handlers = new Set();
  const output = {};
  const code = ts.transpileModule(readFileSync(resolve(__dirname, '../lib/cached-browser-store.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(code, { exports: output, window: {
    addEventListener: (_, handler) => handlers.add(handler),
    removeEventListener: (_, handler) => handlers.delete(handler),
  } });
  let raw = '{"value":1}';
  let reads = 0;
  let parses = 0;
  const initial = { value: 0 };
  const store = output.createCachedBrowserStore({
    initial, keys: ['data'],
    read: () => { reads++; return raw; },
    parse: value => { parses++; return JSON.parse(value); },
  });
  return { store, initial, handlers, set: value => { raw = value; }, counts: () => ({ reads, parses }),
    event: key => handlers.forEach(handler => handler({ key })) };
}

test('1000 unchanged snapshots share one read, parse and object', () => {
  const f = fixture(); const first = f.store.getSnapshot();
  for (let i = 0; i < 1000; i++) assert.equal(f.store.getSnapshot(), first);
  assert.deepEqual(f.counts(), { reads: 1, parses: 1 });
});

test('consumers share a listener; unrelated storage changes do not wake them', () => {
  const f = fixture(); let calls = 0;
  const stopA = f.store.subscribe(() => calls++);
  const stopB = f.store.subscribe(() => calls++);
  f.store.getSnapshot(); assert.equal(f.handlers.size, 1);
  f.set('{"value":2}'); f.event('unrelated');
  assert.equal(calls, 0); assert.equal(f.store.getSnapshot().value, 1);
  f.event('data'); assert.equal(calls, 2); assert.equal(f.store.getSnapshot().value, 2);
  f.event('data'); assert.equal(calls, 2); // Same raw value is not parsed or emitted again.
  stopA(); assert.equal(f.handlers.size, 1); stopB(); assert.equal(f.handlers.size, 0);
});

test('refresh, clear and remount invalidate snapshots without losing latest writes', () => {
  const f = fixture(); const stop = f.store.subscribe(() => {});
  f.store.getSnapshot(); f.set('{"value":3}');
  assert.equal(f.store.getFreshSnapshot().value, 3);
  f.set('{"value":4}'); f.store.refresh(); assert.equal(f.store.getSnapshot().value, 4);
  f.set('{"value":0}'); f.event(null); assert.equal(f.store.getSnapshot().value, 0);
  stop(); f.set('{"value":5}'); const stopAgain = f.store.subscribe(() => {});
  assert.equal(f.store.getSnapshot().value, 5); stopAgain();
});

test('server rendering uses initial state without reading browser storage', () => {
  const f = fixture(); assert.equal(f.store.getServerSnapshot(), f.initial);
  assert.deepEqual(f.counts(), { reads: 0, parses: 0 });
});
