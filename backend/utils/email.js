const nodemailer = require('nodemailer');

// E-posta gönderim için transporter oluştur
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'hcelenkk61@gmail.com',
    pass: process.env.EMAIL_PASS || 'prbj isth fftf enba',
  },
});

// E-posta gönderim fonksiyonu
const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'hcelenkk61@gmail.com',
    to,
    subject,
    text,
    html, // HTML içeriği destekleniyor
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`E-posta gönderildi: ${to}, Konu: ${subject}`);
  } catch (err) {
    console.error('E-posta gönderim hatası:', err.message);
    throw new Error('E-posta gönderilemedi: ' + err.message);
  }
};

module.exports = { sendEmail };