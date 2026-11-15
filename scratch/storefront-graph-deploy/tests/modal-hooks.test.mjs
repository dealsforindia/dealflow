import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

// React requires the same hooks on the closed and open dialog render.
function hooksAfterGuard(source, componentName) {
  const file = ts.createSourceFile('modal.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let body;
  function find(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(file) === componentName && node.initializer && ts.isArrowFunction(node.initializer)) body = node.initializer.body;
    ts.forEachChild(node, find);
  }
  find(file);
  assert.ok(body && ts.isBlock(body), `${componentName} must be found`);
  let guarded = false;
  const violations = [];
  function returns(node) {
    if (ts.isReturnStatement(node)) return true;
    if (ts.isFunctionLike(node)) return false;
    return ts.forEachChild(node, returns) || false;
  }
  function hooks(node) {
    if (ts.isFunctionLike(node)) return;
    if (ts.isCallExpression(node) && /^use[A-Z]/.test(node.expression.getText(file).replace(/^React\./, ''))) violations.push(node.expression.getText(file));
    ts.forEachChild(node, hooks);
  }
  for (const statement of body.statements) {
    if (guarded) hooks(statement);
    if (ts.isIfStatement(statement) && returns(statement)) guarded = true;
  }
  return violations;
}

test('regression check detects a hook skipped by the closed dialog', () => {
  assert.deepEqual(hooksAfterGuard('const Broken = () => { if (!open) return null; const [value] = useState(0); return value; };', 'Broken'), ['useState']);
});
for (const component of ['DealDetailModal', 'CardEmiSimulatorModal', 'PhoneExchangeEstimatorModal']) {
  test(`${component} has no hooks after its closed-state guard`, () => {
    const source = readFileSync(new URL(`../src/components/${component}.tsx`, import.meta.url), 'utf8');
    assert.deepEqual(hooksAfterGuard(source, component), []);
  });
}

function portalsInsidePresence(source) {
  const file = ts.createSourceFile('drawer.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let count = 0;
  function visit(node) {
    if (ts.isJsxElement(node) && node.openingElement.tagName.getText(file) === 'AnimatePresence') {
      for (const child of node.children) {
        if (!ts.isJsxExpression(child)) continue;
        function inspect(expression) {
          if (ts.isCallExpression(expression) && expression.expression.getText(file) === 'createPortal') count++;
          ts.forEachChild(expression, inspect);
        }
        if (child.expression) inspect(child.expression);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(file); return count;
}
test('presence regression catches a portal discarded before rendering', () => {
  assert.equal(portalsInsidePresence('const Broken = <AnimatePresence>{open && createPortal(<div/>, document.body)}</AnimatePresence>;'), 1);
});
for (const component of ['DealToolbar', 'CompareDrawer']) {
  test(`${component} renders its portal outside presence filtering`, () => {
    assert.equal(portalsInsidePresence(readFileSync(new URL(`../src/components/${component}.tsx`, import.meta.url), 'utf8')), 0);
  });
}
