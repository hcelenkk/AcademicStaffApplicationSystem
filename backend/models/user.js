const pool = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
  findByTc: async (tc_kimlik) => {
    try {
      const query = 'SELECT * FROM public.kullanici WHERE tc_kimlik = $1';
      const result = await pool.query(query, [tc_kimlik]);
      if (result.rowCount === 0) {
        console.log(`Kullanıcı bulunamadı: ${tc_kimlik}`);
        return null;
      }
      console.log(`Kullanıcı bulundu: ${tc_kimlik}`);
      return result.rows[0];
    } catch (err) {
      console.error('Kullanıcı aranırken hata oluştu:', err.message);
      throw new Error('Kullanıcı aranırken hata oluştu: ' + err.message);
    }
  },

  create: async (tc_kimlik, sifre, ad, soyad, rol, eposta) => {
    try {
      const hashedPassword = await bcrypt.hash(sifre, 10);
      const query = `
        INSERT INTO public.kullanici (tc_kimlik, sifre, ad, soyad, rol, eposta, son_guncelleme)
        VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`;
      const values = [tc_kimlik, hashedPassword, ad, soyad, rol, eposta];
      const result = await pool.query(query, values);
      console.log('Yeni kullanıcı oluşturuldu:', result.rows[0]);
      return result.rows[0];
    } catch (err) {
      console.error('Kullanıcı oluşturulamadı:', err.message);
      throw new Error('Kullanıcı oluşturulamadı: ' + err.message);
    }
  },

  updatePassword: async (tc_kimlik, sifre) => {
    try {
      const hashedPassword = await bcrypt.hash(sifre, 10);
      const query = `
        UPDATE public.kullanici
        SET sifre = $1, son_guncelleme = NOW()
        WHERE tc_kimlik = $2 RETURNING *`;
      const values = [hashedPassword, tc_kimlik];
      const result = await pool.query(query, values);
      if (result.rowCount === 0) {
        throw new Error('Kullanıcı bulunamadı');
      }
      console.log('Kullanıcı şifresi güncellendi:', tc_kimlik);
      return result.rows[0];
    } catch (err) {
      console.error('Şifre güncellenemedi:', err.message);
      throw new Error('Şifre güncellenemedi: ' + err.message);
    }
  },
};

module.exports = User;