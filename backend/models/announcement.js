const pool = require('../config/db');

const Announcement = {
  getAll: async () => {
    const query = `
      SELECT * FROM ilan
      WHERE bitis_tarih >= CURRENT_DATE`;
    const result = await pool.query(query);
    return result.rows;
  },
  create: async (kategori, aciklama, baslangic_tarih, bitis_tarih) => {
    const query = `
      INSERT INTO ilan (kategori, aciklama, baslangic_tarih, bitis_tarih)
      VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [kategori, aciklama, baslangic_tarih, bitis_tarih];
    const result = await pool.query(query, values);
    return result.rows[0];
  },
  update: async (ilan_id, kategori, aciklama, baslangic_tarih, bitis_tarih) => {
    const query = `
      UPDATE ilan
      SET kategori = $1, aciklama = $2, baslangic_tarih = $3, bitis_tarih = $4
      WHERE ilan_id = $5 RETURNING *`;
    const values = [kategori, aciklama, baslangic_tarih, bitis_tarih, ilan_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  },
  delete: async (ilan_id) => {
    const query = 'DELETE FROM ilan WHERE ilan_id = $1';
    const result = await pool.query(query, [ilan_id]);
    return result.rowCount;
  },
};

module.exports = Announcement;