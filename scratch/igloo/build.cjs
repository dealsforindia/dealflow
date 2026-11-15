const fs = require('fs');
const parts = ['part1', 'part2', 'part3', 'part4'].map(n => fs.readFileSync('scratch/igloo/' + n + '.html', 'utf8'));
const s = parts.join('');
fs.writeFileSync('scratch/igloo/build.html', s, 'utf8');
fs.writeFileSync('igloo-webgl.html', s, 'utf8');
console.log('bytes', Buffer.byteLength(s), 'lines', s.split('\n').length);
