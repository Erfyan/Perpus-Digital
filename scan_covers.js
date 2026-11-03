/**
 * scan_covers.js
 * 
 * Script otomatis untuk:
 * 1. Membaca semua nama foto di frontend/public/book_cover/
 * 2. Menyimpan daftar ke cover_list.txt
 * 3. Otomatis memperbarui backend/database/seed.js dengan aman (menggunakan JSON.stringify)
 * 
 * Jalankan di terminal:
 *   node scan_covers.js
 */
const fs = require('fs');
const path = require('path');

const coverDir = path.join(__dirname, 'frontend', 'public', 'book_cover');
const seedPath = path.join(__dirname, 'backend', 'database', 'seed.js');
const outputPath = path.join(__dirname, 'cover_list.txt');

try {
  if (!fs.existsSync(coverDir)) {
    console.error('❌ Direktori tidak ditemukan:', coverDir);
    process.exit(1);
  }

  const allFiles = fs.readdirSync(coverDir);
  const imageFiles = allFiles.filter(f => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(f));

  console.log('====================================================');
  console.log('   PEMINDAIAN SAMPUL BUKU (frontend/public/book_cover)');
  console.log('====================================================');
  console.log(`Ditemukan: ${imageFiles.length} file gambar dari ${allFiles.length} file total.\n`);

  if (imageFiles.length === 0) {
    console.log('⚠️  Tidak ada file gambar ditemukan di direktori.');
    process.exit(0);
  }

  // Tampilkan 15 contoh pertama
  imageFiles.slice(0, 15).forEach((f, i) => {
    console.log(`  ${String(i + 1).padStart(2)}. ${f}`);
  });
  if (imageFiles.length > 15) {
    console.log(`  ... dan ${imageFiles.length - 15} file lainnya.`);
  }

  // 1. Simpan ke cover_list.txt
  fs.writeFileSync(outputPath, imageFiles.join('\n'), 'utf8');
  console.log(`\n✓ Daftar lengkap disimpan ke: cover_list.txt`);

  // 2. Jika seed.js ada, update mapping cover-nya dengan aman (JSON.stringify)
  if (fs.existsSync(seedPath)) {
    let seedContent = fs.readFileSync(seedPath, 'utf8');
    
    let matchIdx = 0;
    seedContent = seedContent.replace(/cover:\s*(['"`])[^'"`]+\1/g, (match) => {
      if (matchIdx < imageFiles.length) {
        const newCover = `cover: ${JSON.stringify(imageFiles[matchIdx])}`;
        matchIdx++;
        return newCover;
      }
      return match;
    });

    fs.writeFileSync(seedPath, seedContent, 'utf8');
    console.log(`✓ Berhasil memperbarui ${matchIdx} cover buku di backend/database/seed.js!`);
    console.log('\n====================================================');
    console.log('🚀 LANGKAH TERAKHIR: Terapkan ke Database:');
    console.log('   cd backend');
    console.log('   npm run seed');
    console.log('====================================================\n');
  }

} catch (err) {
  console.error('❌ Terjadi kesalahan:', err.message);
}
