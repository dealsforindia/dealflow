const fs = require('fs');
const html = fs.readFileSync('e:/Rudranildocs0066543/html-yt/wdg4g-lhb-simulation.html', 'utf8');
const lines = html.split('\n');
console.log('Total lines:', lines.length);

const funcs = [];
lines.forEach((line, idx) => {
  const trimmed = line.trim();
  if (trimmed.startsWith('function ') || trimmed.startsWith('class ') || trimmed.includes('addEventListener') || trimmed.includes('init(') || trimmed.includes('animate(')) {
    funcs.push(`${idx + 1}: ${trimmed.slice(0, 100)}`);
  }
});
console.log('Found key signatures:', funcs.length);
funcs.slice(0, 40).forEach(f => console.log(f));

