const pool = require('../config/db');
const { sendEmail } = require('../utils/email');

const Application = {
  create: async (aday_tc, ilan_id) => {
    const query = `
      INSERT INTO basvuru (aday_tc, ilan_id, durum)
      VALUES ($1, $2, 'Beklemede') RETURNING *`;
    const values = [aday_tc, ilan_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  },
  getByAday: async (aday_tc) => {
    const query = `
      SELECT b.*, i.kategori, i.aciklama, i.baslangic_tarih, i.bitis_tarih
      FROM basvuru b
      JOIN ilan i ON b.ilan_id = i.ilan_id
      WHERE b.aday_tc = $1`;
    const result = await pool.query(query, [aday_tc]);
    return result.rows;
  },
  getAll: async (filters = {}) => {
    const { durum, aday_ad, kategori } = filters;
    let query = `
      SELECT b.*, i.kategori, i.aciklama, i.baslangic_tarih, i.bitis_tarih, k.ad, k.soyad
      FROM basvuru b
      JOIN ilan i ON b.ilan_id = i.ilan_id
      JOIN kullanici k ON b.aday_tc = k.tc_kimlik`;
    
    const conditions = [];
    const values = [];

    if (durum) {
      conditions.push(`b.durum = $${conditions.length + 1}`);
      values.push(durum);
    }
    if (aday_ad) {
      conditions.push(`(k.ad ILIKE $${conditions.length + 1} OR k.soyad ILIKE $${conditions.length + 1})`);
      values.push(`%${aday_ad}%`);
    }
    if (kategori) {
      conditions.push(`i.kategori ILIKE $${conditions.length + 1}`);
      values.push(`%${kategori}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await pool.query(query, values);
    return result.rows;
  },
  updateStatus: async (basvuru_id, durum) => {
    const validStatuses = ['beklemede', 'kabul edildi', 'reddedildi'];
    const normalizedDurum = durum.trim().toLowerCase();
    console.log('Normalleştirilmiş durum:', normalizedDurum);
    if (!validStatuses.includes(normalizedDurum)) {
      console.log('Eşleşmeyen durum:', durum);
      throw new Error('Geçersiz durum değeri');
    }

    // Başvuru bilgilerini ve adayın e-posta adresini al
    const getApplicationQuery = `
      SELECT b.*, k.eposta, k.ad, k.soyad, i.kategori
      FROM basvuru b
      JOIN kullanici k ON b.aday_tc = k.tc_kimlik
      JOIN ilan i ON b.ilan_id = i.ilan_id
      WHERE b.basvuru_id = $1`;
    const applicationResult = await pool.query(getApplicationQuery, [basvuru_id]);
    if (applicationResult.rowCount === 0) {
      throw new Error('Başvuru bulunamadı');
    }
    const application = applicationResult.rows[0];
    const adayEposta = application.eposta;
    const adayAd = application.ad;
    const kategori = application.kategori;

    // Durumu güncelle
    const query = `
      UPDATE basvuru
      SET durum = $1
      WHERE basvuru_id = $2 RETURNING *`;
    const values = [durum, basvuru_id];
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      throw new Error('Başvuru bulunamadı');
    }

    // E-posta gönder
    if (durum !== 'Beklemede') {
      const subject = `Başvuru Durumu Güncellendi: ${kategori}`;
      const text = `Merhaba ${adayAd},\n\n${kategori} kategorisindeki başvurunuzun durumu "${durum}" olarak güncellendi.\n\nİyi günler dileriz!`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333;">Merhaba ${adayAd},</h2>
          <p style="font-size: 16px; color: #555;">
            <strong style="color: #000;">${kategori}</strong> kategorisindeki başvurunuzun durumu 
            <strong style="color: ${durum === 'Kabul Edildi' ? '#28a745' : '#dc3545'};">${durum}</strong> 
            olarak güncellendi.
          </p>
          <p style="font-size: 16px; color: #555;">
            Detaylar için sistemimize giriş yapabilirsiniz.
          </p>
          <p style="font-size: 16px; color: #555;">
            İyi günler dileriz!
          </p>
          <p style="font-size: 14px; color: #777; font-style: italic;">
            Başvuru Yönetim Sistemi Ekibi
          </p>
        </div>
      `;
      await sendEmail(adayEposta, subject, text, html);
    }

    return result.rows[0];
  },
};

module.exports = Application;