const pool = require('../config/db');

const Announcement = {
  create: async (kategori, baslangic_tarih, bitis_tarih, aciklama, admin_tc) => {
    const query = `
      INSERT INTO ilan (kategori, baslangic_tarih, bitis_tarih, aciklama, admin_tc)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const values = [kategori, baslangic_tarih, bitis_tarih, aciklama, admin_tc];
    const result = await pool.query(query, values);
    return result.rows[0];
  },
  getAll: async () => {
    const result = await pool.query('SELECT * FROM ilan');
    return result.rows;
  },
  delete: async (ilan_id) => {
    const query = 'DELETE FROM ilan WHERE ilan_id = $1 RETURNING *';
    const result = await pool.query(query, [ilan_id]);
    if (result.rowCount === 0) {
      throw new Error('İlan bulunamadı');
    }
  },
  update: async (ilan_id, kategori, baslangic_tarih, bitis_tarih, aciklama) => {
    const query = `
      UPDATE ilan
      SET kategori = $1, baslangic_tarih = $2, bitis_tarih = $3, aciklama = $4
      WHERE ilan_id = $5 RETURNING *`;
    const values = [kategori, baslangic_tarih, bitis_tarih, aciklama, ilan_id];
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      throw new Error('İlan bulunamadı');
    }
    return result.rows[0];
  },
};

module.exports = Announcement;