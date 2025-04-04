const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Adayın kendi başvurularını listeleme
router.get('/my-applications', authMiddleware, roleMiddleware(['Aday']), async (req, res) => {
  const tc_kimlik = req.user.tc_kimlik;
  try {
    const query = `
      SELECT b.basvuru_id, COALESCE(b.durum, 'Beklemede') AS durum, b.olusturulma_tarih, i.ilan_id, i.kategori, i.aciklama
      FROM basvuru b
      LEFT JOIN ilan i ON b.ilan_id = i.ilan_id
      WHERE b.tc_kimlik = $1
    `;
    const result = await pool.query(query, [tc_kimlik]);
    const formattedResult = result.rows.map((row) => {
      // Durum değerini doğrula
      const validDurum = ['Beklemede', 'Kabul Edildi', 'Reddedildi'].includes(row.durum)
        ? row.durum
        : 'Beklemede';
      return {
        basvuru_id: row.basvuru_id,
        durum: validDurum,
        basvuru_tarih: row.olusturulma_tarih,
        ilan: {
          ilan_id: row.ilan_id,
          kategori: row.kategori || 'Bilinmiyor',
          aciklama: row.aciklama || 'Açıklama yok',
        },
      };
    });
    console.log('Adayın başvuruları (formatlanmış):', formattedResult);
    res.json(formattedResult);
  } catch (err) {
    console.error('Başvurular getirilemedi:', err);
    res.status(500).json({ message: 'Başvurular getirilemedi', error: err.message });
  }
});

// Adayın bir ilana başvuru yapması
router.post('/', authMiddleware, roleMiddleware(['Aday']), async (req, res) => {
  const { ilan_id } = req.body;
  const tc_kimlik = req.user.tc_kimlik;
  console.log('Başvuru isteği alındı:', { tc_kimlik, ilan_id });

  try {
    const ilanQuery = 'SELECT * FROM ilan WHERE ilan_id = $1';
    const ilanResult = await pool.query(ilanQuery, [ilan_id]);
    console.log('İlan kontrol sonucu:', ilanResult.rows);
    if (ilanResult.rowCount === 0) {
      return res.status(404).json({ message: 'İlan bulunamadı' });
    }

    const checkQuery = 'SELECT * FROM basvuru WHERE tc_kimlik = $1 AND ilan_id = $2';
    const checkResult = await pool.query(checkQuery, [tc_kimlik, ilan_id]);
    console.log('Önceki başvuru kontrol sonucu:', checkResult.rows);
    if (checkResult.rowCount > 0) {
      return res.status(400).json({ message: 'Bu ilana zaten başvurdunuz' });
    }

    const query = `
      INSERT INTO basvuru (tc_kimlik, ilan_id, durum, olusturulma_tarih)
      VALUES ($1, $2, 'Beklemede', NOW()) RETURNING *
    `;
    const result = await pool.query(query, [tc_kimlik, ilan_id]);
    console.log('Başvuru oluşturuldu:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Başvuru oluşturulamadı:', err);
    res.status(400).json({ message: 'Başvuru oluşturulamadı', error: err.message });
  }
});

// Admin için tüm başvuruları listeleme
router.get('/admin', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  try {
    const query = `
      SELECT b.basvuru_id, b.tc_kimlik, b.durum, b.olusturulma_tarih, i.ilan_id, i.kategori, i.aciklama,
             k.ad, k.soyad
      FROM basvuru b
      LEFT JOIN ilan i ON b.ilan_id = i.ilan_id
      JOIN kullanici k ON b.tc_kimlik = k.tc_kimlik
    `;
    const result = await pool.query(query);
    res.json(
      result.rows.map((row) => ({
        basvuru_id: row.basvuru_id,
        durum: row.durum,
        basvuru_tarih: row.olusturulma_tarih,
        aday: { ad: row.ad, soyad: row.soyad },
        ilan: {
          ilan_id: row.ilan_id,
          kategori: row.kategori || 'Bilinmiyor',
          aciklama: row.aciklama || 'Açıklama yok',
        },
      }))
    );
  } catch (err) {
    console.error('Başvurular getirilemedi:', err);
    res.status(500).json({ message: 'Başvurular getirilemedi', error: err.message });
  }
});

// Başvuru durumunu güncelleme
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  const { id } = req.params;
  const { durum } = req.body;
  try {
    // Durum değerini doğrula
    if (!['Beklemede', 'Kabul Edildi', 'Reddedildi'].includes(durum)) {
      return res.status(400).json({ message: 'Geçersiz durum değeri. Durum yalnızca "Beklemede", "Kabul Edildi" veya "Reddedildi" olabilir.' });
    }
    const query = 'UPDATE basvuru SET durum = $1 WHERE basvuru_id = $2 RETURNING *';
    const result = await pool.query(query, [durum, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Başvuru bulunamadı' });
    }
    res.json({
      ...result.rows[0],
      basvuru_tarih: result.rows[0].olusturulma_tarih,
    });
  } catch (err) {
    console.error('Başvuru güncellenemedi:', err);
    res.status(400).json({ message: 'Başvuru güncellenemedi', error: err.message });
  }
});

// Otomatik puan hesaplama
router.post('/:id/puan-hesapla', authMiddleware, roleMiddleware(['Yonetici']), async (req, res) => {
  const { id } = req.params;
  try {
    // Başvuru bilgilerini al
    const basvuruQuery = `
      SELECT b.*, i.kategori
      FROM basvuru b
      JOIN ilan i ON b.ilan_id = i.ilan_id
      WHERE b.basvuru_id = $1
    `;
    const basvuruResult = await pool.query(basvuruQuery, [id]);
    if (basvuruResult.rowCount === 0) {
      return res.status(404).json({ message: 'Başvuru bulunamadı' });
    }
    const basvuru = basvuruResult.rows[0];

    // Kadro kriterlerini al
    const kriterQuery = 'SELECT * FROM kriter WHERE kategori = $1 AND aktif = TRUE';
    const kriterResult = await pool.query(kriterQuery, [basvuru.kategori]);
    if (kriterResult.rowCount === 0) {
      return res.status(404).json({ message: 'Bu kadro için aktif kriter bulunamadı' });
    }

    // Önceki puan kayıtlarını sil (tekrar hesaplama için)
    await pool.query('DELETE FROM basvuru_puan WHERE basvuru_id = $1', [id]);

    // Her kriter için puan atama (şimdilik her kriter için min_puan kullanıyoruz)
    let toplamPuan = 0;
    for (const kriter of kriterResult.rows) {
      const verilenPuan = kriter.min_puan; // Gerçek uygulamada belgeler analiz edilerek hesaplanacak
      toplamPuan += verilenPuan;

      // Puanı basvuru_puan tablosuna kaydet
      const puanQuery = `
        INSERT INTO basvuru_puan (basvuru_id, kriter_id, verilen_puan)
        VALUES ($1, $2, $3) RETURNING *
      `;
      await pool.query(puanQuery, [id, kriter.kriter_id, verilenPuan]);
    }

    // Toplam puanı basvuru tablosuna güncelle
    const updateQuery = 'UPDATE basvuru SET puan = $1 WHERE basvuru_id = $2 RETURNING *';
    const updateResult = await pool.query(updateQuery, [toplamPuan, id]);

    res.json({
      basvuru_id: id,
      toplam_puan: toplamPuan,
      detaylar: kriterResult.rows.map((kriter) => ({
        kriter_id: kriter.kriter_id,
        aciklama: kriter.aciklama,
        verilen_puan: kriter.min_puan,
      })),
    });
  } catch (err) {
    console.error('Puan hesaplama hatası:', err);
    res.status(500).json({ message: 'Puan hesaplama hatası', error: err.message });
  }
});

module.exports = router;