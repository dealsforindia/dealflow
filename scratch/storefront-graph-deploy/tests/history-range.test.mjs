import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source = readFileSync(new URL('../src/utils/historyRange.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { historyRange } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
test('7, 30, 90 and All select distinct timestamp windows', () => {
  const now = 1800000000000, day = 86400000;
  const points = [120, 60, 20, 3].map(age => [now - age * day, 100 + age]);
  assert.equal(historyRange(points, 7, now).length, 1);
  assert.equal(historyRange(points, 30, now).length, 2);
  assert.equal(historyRange(points, 90, now).length, 3);
  assert.equal(historyRange(points, 0, now).length, 4);
  assert.deepEqual(historyRange([[now - 10 * day, 999]], 7, now), []);
});
