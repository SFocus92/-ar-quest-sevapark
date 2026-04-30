/**
 * Скрипт оптимизации фотографий для NFT-маркеров
 * Преобразует исходные фото в оптимальный формат для AR.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = 'foto';
const outputDir = 'public/assets/nft-sources';

// Создать выходную папку
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`✓ Создана папка: ${outputDir}`);
}

// Получить список фотографий
const photos = fs.readdirSync(inputDir)
  .filter(f => f.endsWith('.jpg'))
  .sort(); // Сортировка по имени для правильного порядка

console.log(`\nНайдено фотографий: ${photos.length}\n`);

// Маппинг фотографий на этапы квеста
const questSteps = [
  'Главные ворота',
  'Древний дуб',
  'Тайная скамейка',
  'Каменный грот',
  'Мост желаний',
  'Статуя дракона',
  'Озеро сокровищ',
];

// Обработать каждую фотографию
let processed = 0;

photos.forEach((photo, index) => {
  const inputPath = path.join(inputDir, photo);
  const outputName = `marker-${index + 1}.jpg`;
  const outputPath = path.join(outputDir, outputName);

  console.log(`Обработка ${index + 1}/${photos.length}:`);
  console.log(`  Исходник: ${photo}`);
  console.log(`  Этап ${index + 1}: ${questSteps[index] || 'Неизвестно'}`);
  console.log(`  Результат: ${outputName}`);

  sharp(inputPath)
    .resize(1280, 720, {
      fit: 'cover',
      position: 'center',
      withoutEnlargement: false
    })
    .jpeg({
      quality: 90,
      mozjpeg: true
    })
    .toFile(outputPath)
    .then(info => {
      processed++;
      console.log(`  ✓ Размер: ${Math.round(info.size / 1024)} KB`);
      console.log('');

      if (processed === photos.length) {
        console.log('═══════════════════════════════════════════════════');
        console.log('✓ Все фотографии оптимизированы!');
        console.log(`✓ Результат: ${outputDir}/`);
        console.log('═══════════════════════════════════════════════════');
        console.log('\nСледующий шаг:');
        console.log('1. Откройте https://carnaux.github.io/NFT-Marker-Creator/');
        console.log('2. Загрузите каждый marker-X.jpg');
        console.log('3. Скачайте .fset, .fset3, .iset файлы');
        console.log('4. Переименуйте их в marker-X (без расширения в имени)');
        console.log('5. Поместите в public/assets/nft/\n');
      }
    })
    .catch(err => {
      console.error(`  ✗ Ошибка: ${err.message}\n`);
    });
});
