// utils/puanHesapla.js
const hesapla = (basvuru) => {
    let puan = 0;
    basvuru.belgeler.forEach(belge => {
      if (belge.tip === "A1") puan += 20;
      if (belge.tip === "A2") puan += 15;
      // Diğer kriterler...
    });
    return puan;
  };