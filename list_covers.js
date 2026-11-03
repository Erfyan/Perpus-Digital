const fs = require('fs');
const path = require('path');

const coverDir = path.join(__dirname, 'frontend', 'public', 'book_cover');
try {
  const files = fs.readdirSync(coverDir);
  const out = path.join(__dirname, 'cover_list.txt');
  fs.writeFileSync(out, files.join('\n'));
  console.log('Files found:', files.length);
  console.log(files.join('\n'));
} catch (e) {
  console.error('Error:', e.message);
}

