const pool = require('../config/db');

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
  getAll: async () => {
    const query = `
      SELECT b.*, i.kategori, i.aciklama, i.baslangic_tarih, i.bitis_tarih, k.ad, k.soyad
      FROM basvuru b
      JOIN ilan i ON b.ilan_id = i.ilan_id
      JOIN kullanici k ON b.aday_tc = k.tc_kimlik`;
    const result = await pool.query(query);
    return result.rows;
  },
  updateStatus: async (basvuru_id, durum) => {
    const validStatuses = ['Beklemede', 'Kabul Edildi', 'Reddedildi'];
    if (!validStatuses.includes(durum)) {
      throw new Error('Geçersiz durum değeri');
    }
    const query = `
      UPDATE basvuru
      SET durum = $1
      WHERE basvuru_id = $2 RETURNING *`;
    const values = [durum, basvuru_id];
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      throw new Error('Başvuru bulunamadı');
    }
    return result.rows[0];
  },
};

module.exports = Application;