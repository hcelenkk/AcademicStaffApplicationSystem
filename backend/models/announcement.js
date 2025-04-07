const pool = require('../config/db');

const Announcement = {
  getAll: async () => {
    try {
      const query = `
        SELECT * FROM public.ilan
        WHERE bitis_tarih >= CURRENT_DATE`;
      const result = await pool.query(query);
      console.log('İlanlar getirildi:', result.rows);
      return result.rows;
    } catch (err) {
      console.error('İlanlar getirilemedi:', err.message);
      throw new Error('İlanlar getirilemedi');
    }
  },

  create: async (kategori, aciklama, baslangic_tarih, bitis_tarih, tc_kimlik, kriter_json) => {
    try {
      const query = `
        INSERT INTO public.ilan (kategori, aciklama, baslangic_tarih, bitis_tarih, tc_kimlik, kriter_json, son_guncelleme)
        VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`;
      const values = [kategori, aciklama, baslangic_tarih, bitis_tarih, tc_kimlik, kriter_json || null];
      const result = await pool.query(query, values);
      console.log('Yeni ilan oluşturuldu:', result.rows[0]);
      return result.rows[0];
    } catch (err) {
      console.error('İlan oluşturulamadı:', err.message);
      throw new Error('İlan oluşturulamadı: ' + err.message);
    }
  },

  update: async (ilan_id, kategori, aciklama, baslangic_tarih, bitis_tarih, kriter_json) => {
    try {
      const query = `
        UPDATE public.ilan
        SET kategori = $1, aciklama = $2, baslangic_tarih = $3, bitis_tarih = $4, kriter_json = $5, son_guncelleme = NOW()
        WHERE ilan_id = $6 RETURNING *`;
      const values = [kategori, aciklama, baslangic_tarih, bitis_tarih, kriter_json || null, ilan_id];
      const result = await pool.query(query, values);
      if (result.rowCount === 0) {
        throw new Error('İlan bulunamadı');
      }
      console.log('İlan güncellendi:', result.rows[0]);
      return result.rows[0];
    } catch (err) {
      console.error('İlan güncellenemedi:', err.message);
      throw new Error('İlan güncellenemedi: ' + err.message);
    }
  },

  delete: async (ilan_id) => {
    try {
      const query = 'DELETE FROM public.ilan WHERE ilan_id = $1';
      const result = await pool.query(query, [ilan_id]);
      if (result.rowCount === 0) {
        throw new Error('İlan bulunamadı');
      }
      console.log('İlan silindi:', { ilan_id });
      return result.rowCount;
    } catch (err) {
      console.error('İlan silinemedi:', err.message);
      throw new Error('İlan silinemedi: ' + err.message);
    }
  },
};

module.exports = Announcement;