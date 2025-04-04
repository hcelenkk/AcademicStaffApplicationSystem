const nodemailer = require('nodemailer');

// E-posta gönderim için transporter oluştur
const transporter = nodemailer.createTransport({
  service: 'gmail', // Gmail kullanıyoruz, başka bir servis (örneğin, SendGrid) de kullanılabilir
  auth: {
    user: 'hcelenkk61@gmail.com', // Kendi Gmail adresin
    pass: 'prbj isth fftf enba', // Gmail uygulama şifresi (aşağıda açıklanacak)
  },
});

// E-posta gönderim fonksiyonu
const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: 'hcelenkk61@gmail.com', // Gönderen e-posta adresi
    to, // Alıcı e-posta adresi
    subject, // E-posta konusu
    text, // E-posta içeriği (düz metin)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`E-posta gönderildi: ${to}`);
  } catch (err) {
    console.error('E-posta gönderim hatası:', err);
    throw new Error('E-posta gönderilemedi');
  }
};

module.exports = { sendEmail };