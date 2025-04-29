const fs = require('fs');

// TTF dosyasını oku
const font = fs.readFileSync('Roboto-Regular.ttf');

// Base64 formatına çevir
const base64Font = font.toString('base64');

// Base64 string’ini konsola yazdır
console.log(base64Font);

// Base64 string’ini bir dosyaya kaydet (opsiyonel)
fs.writeFileSync('Roboto-Regular-Base64.txt', base64Font, 'utf8');
console.log('Base64 string, Roboto-Regular-Base64.txt dosyasına kaydedildi.');