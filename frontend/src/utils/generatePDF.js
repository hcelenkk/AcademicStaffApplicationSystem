import { jsPDF } from 'jspdf';
import api from '../services/api';
import { robotoBase64 } from '../fonts/Roboto-Regular';

const generatePDF = async (application, announcement) => {
  try {
    // Kullanıcı bilgilerini al
    const userResponse = await api.get('/users/me');
    const user = userResponse.data;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Roboto fontunu ekle
    doc.addFileToVFS('Roboto-Regular.ttf', robotoBase64);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');

    // Varsayılan fontu Roboto olarak ayarla
    doc.setFont('Roboto');

    // A4 boyutları: 210mm x 297mm
    const margin = 20;
    let yPosition = margin;

    // Başlık
    doc.setFontSize(18);
    doc.text('Başvuru Bilgileri', margin, yPosition);
    yPosition += 10;

    // Çizgi
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, 190, yPosition);
    yPosition += 10;

    // Başvuru Yapanın Bilgileri
    doc.setFontSize(14);
    doc.text('Başvuru Yapanın Bilgileri', margin, yPosition);
    yPosition += 8;
    doc.setFontSize(12);
    doc.text(`Ad: ${user.ad}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Soyad: ${user.soyad}`, margin, yPosition);
    yPosition += 8;
    doc.text(`TC Kimlik: ${user.tc_kimlik}`, margin, yPosition);
    yPosition += 8;
    doc.text(`E-posta: ${user.eposta}`, margin, yPosition);
    yPosition += 12;

    // İlan Bilgileri
    doc.setFontSize(14);
    doc.text('İlan Bilgileri', margin, yPosition);
    yPosition += 8;
    doc.setFontSize(12);
    doc.text(`Kategori: ${announcement.kategori}`, margin, yPosition);
    yPosition += 8;
    const descriptionLines = doc.splitTextToSize(`Açıklama: ${announcement.aciklama}`, 170);
    doc.text(descriptionLines, margin, yPosition);
    yPosition += 8 * descriptionLines.length;
    doc.text(
      `Başlangıç Tarihi: ${formatDate(announcement.baslangic_tarih)}`,
      margin,
      yPosition
    );
    yPosition += 8;
    doc.text(`Bitiş Tarihi: ${formatDate(announcement.bitis_tarih)}`, margin, yPosition);
    yPosition += 12;

    // Başvuru Bilgileri
    doc.setFontSize(14);
    doc.text('Başvuru Detayları', margin, yPosition);
    yPosition += 8;
    doc.setFontSize(12);
    doc.text(`Başvuru Tarihi: ${formatDate(application.basvuru_tarihi)}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Başvuru Durumu: ${application.durum}`, margin, yPosition);

    // PDF'i kaydet
    doc.save(
      `Basvuru_${announcement.ilan_id}_${new Date()
        .toISOString()
        .split('T')[0]}.pdf`
    );
  } catch (err) {
    console.error('PDF oluşturma hatası:', err.response?.data || err.message);
    throw new Error('PDF oluşturulamadı. Lütfen tekrar deneyin.');
  }
};

const formatDate = (isoDate) => {
  if (!isoDate) return 'Tarih belirtilmemiş';
  return new Date(isoDate).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default generatePDF;