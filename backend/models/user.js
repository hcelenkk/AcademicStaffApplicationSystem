const pool = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
  findByTc: async (tc_kimlik) => {
    const query = 'SELECT * FROM kullanici WHERE tc_kimlik = $1';
    const result = await pool.query(query, [tc_kimlik]);
    return result.rows[0];
  },

  create: async (tc_kimlik, sifre, ad, soyad, rol, eposta) => {
    const hashedPassword = await bcrypt.hash(sifre, 10);
    const query = `
      INSERT INTO kullanici (tc_kimlik, sifre, ad, soyad, rol, eposta)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [tc_kimlik, hashedPassword, ad, soyad, rol, eposta];
    const result = await pool.query(query, values);
    return result.rows[0];
  },
};

module.exports = User;