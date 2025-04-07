const pool = require('../config/db');
const { sendEmail } = require('../utils/email');

const Application = {
  create: async (tc_kimlik, ilan_id) => {
    try {
      // İlanın açık olup olmadığını kontrol et
      const ilanQuery = 'SELECT * FROM public.ilan WHERE ilan_id = $1 AND bitis_tarih >= CURRENT_DATE';
      const ilanResult = await pool.query(ilanQuery, [ilan_id]);
      if (ilanResult.rowCount === 0) {
        throw new Error('İlan bulunamadı veya başvuruya kapalı');
      }

      // Daha önce başvurulup başvurulmadığını kontrol et
      const checkQuery = 'SELECT * FROM public.basvuru WHERE tc_kimlik = $1 AND ilan_id = $2';
      const checkResult = await pool.query(checkQuery, [tc_kimlik, ilan_id]);
      if (checkResult.rowCount > 0) {
        throw new Error('Bu ilana zaten başvurdunuz');
      }

      const query = `
        INSERT INTO public.basvuru (tc_kimlik, ilan_id, durum, olusturulma_tarih, son_guncelleme)
        VALUES ($1, $2, 'Beklemede', NOW(), NOW()) RETURNING *`;
      const values = [tc_kimlik, ilan_id];
      const result = await pool.query(query, values);
      console.log('Yeni başvuru oluşturuldu:', result.rows[0]);
      return result.rows[0];
    } catch (err) {
      console.error('Başvuru oluşturulamadı:', err.message);
      throw new Error('Başvuru oluşturulamadı: ' + err.message);
    }
  },

  getByAday: async (tc_kimlik) => {
    try {
      const query = `
        SELECT b.basvuru_id, b.durum, b.puan, b.olusturulma_tarih, i.ilan_id, i.kategori, i.aciklama
        FROM public.basvuru b
        LEFT JOIN public.ilan i ON b.ilan_id = i.ilan_id
        WHERE b.tc_kimlik = $1`;
      const result = await pool.query(query, [tc_kimlik]);
      console.log('Adayın başvuruları getirildi:', result.rows);
      return result.rows.map((row) => ({
        basvuru_id: row.basvuru_id,
        durum: row.durum || 'Beklemede',
        puan: row.puan,
        olusturulma_tarih: row.olusturulma_tarih,
        ilan: {
          ilan_id: row.ilan_id,
          kategori: row.kategori || 'Bilinmiyor',
          aciklama: row.aciklama || 'Açıklama yok',
        },
      }));
    } catch (err) {
      console.error('Adayın başvuruları getirilemedi:', err.message);
      throw new Error('Adayın başvuruları getirilemedi: ' + err.message);
    }
  },

  getAll: async (filters = {}) => {
    try {
      const { durum, aday_ad, kategori } = filters;
      let query = `
        SELECT b.basvuru_id, b.tc_kimlik, b.durum, b.puan, b.olusturulma_tarih, i.ilan_id, i.kategori, i.aciklama,
               k.ad, k.soyad
        FROM public.basvuru b
        LEFT JOIN public.ilan i ON b.ilan_id = i.ilan_id
        JOIN public.kullanici k ON b.tc_kimlik = k.tc_kimlik`;
      
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
      console.log('Tüm başvurular getirildi:', result.rows);
      return result.rows.map((row) => ({
        basvuru_id: row.basvuru_id,
        durum: row.durum,
        puan: row.puan,
        olusturulma_tarih: row.olusturulma_tarih,
        aday: { ad: row.ad, soyad: row.soyad },
        ilan: {
          ilan_id: row.ilan_id,
          kategori: row.kategori || 'Bilinmiyor',
          aciklama: row.aciklama || 'Açıklama yok',
        },
      }));
    } catch (err) {
      console.error('Başvurular getirilemedi:', err.message);
      throw new Error('Başvurular getirilemedi: ' + err.message);
    }
  },

  updateStatus: async (basvuru_id, durum) => {
    try {
      // Durum eşleştirme
      const statusMapping = {
        Beklemede: 'Beklemede',
        KabulEdildi: 'Kabul Edildi',
        Reddedildi: 'Reddedildi',
      };
      const mappedStatus = statusMapping[durum] || durum;

      const validStatuses = ['Beklemede', 'Kabul Edildi', 'Reddedildi'];
      if (!validStatuses.includes(mappedStatus)) {
        throw new Error(`Geçersiz durum değeri: ${mappedStatus}. Geçerli değerler: ${validStatuses.join(', ')}`);
      }

      // Başvuru bilgilerini ve adayın e-posta adresini al
      const getApplicationQuery = `
        SELECT b.*, k.eposta, k.ad, k.soyad, i.kategori
        FROM public.basvuru b
        JOIN public.kullanici k ON b.tc_kimlik = k.tc_kimlik
        JOIN public.ilan i ON b.ilan_id = i.ilan_id
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
        UPDATE public.basvuru
        SET durum = $1, son_guncelleme = NOW()
        WHERE basvuru_id = $2 RETURNING *`;
      const values = [mappedStatus, basvuru_id];
      const result = await pool.query(query, values);
      if (result.rowCount === 0) {
        throw new Error('Başvuru bulunamadı');
      }

      // E-posta gönder ve bildirim oluştur
      if (mappedStatus !== 'Beklemede') {
        const displayStatus = mappedStatus === 'KabulEdildi' ? 'Kabul Edildi' : 'Reddedildi';
        const subject = `Başvuru Durumu Güncellendi: ${kategori}`;
        const text = `Merhaba ${adayAd},\n\n${kategori} kategorisindeki başvurunuzun durumu "${displayStatus}" olarak güncellendi.\n\nİyi günler dileriz!`;
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #333;">Merhaba ${adayAd},</h2>
            <p style="font-size: 16px; color: #555;">
              <strong style="color: #000;">${kategori}</strong> kategorisindeki başvurunuzun durumu 
              <strong style="color: ${mappedStatus === 'KabulEdildi' ? '#28a745' : '#dc3545'};">${displayStatus}</strong> 
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

        // Bildirim oluştur
        const bildirimQuery = `
          INSERT INTO bildirim (tc_kimlik, tur, mesaj, tarih, okundu)
          VALUES ($1, $2, $3, NOW(), false)`;
        const bildirimMesaj = `${kategori} kategorisindeki başvurunuzun durumu "${displayStatus}" olarak güncellendi.`;
        await pool.query(bildirimQuery, [application.tc_kimlik, 'Başvuru Güncellemesi', bildirimMesaj]); // 'Başvuru' yerine 'Başvuru Güncellemesi'
      }

      console.log('Başvuru durumu güncellendi:', result.rows[0]);
      return result.rows[0];
    } catch (err) {
      console.error('Başvuru durumu güncellenemedi:', err.message);
      throw new Error('Başvuru durumu güncellenemedi: ' + err.message);
    }
  },
};

module.exports = Application;