// utils/pdfGenerator.js
const PDFDocument = require("pdfkit");
const generatePDF = (basvuru) => {
  const doc = new PDFDocument();
  doc.text(`Başvuru ID: ${basvuru._id}`);
  doc.text(`Aday: ${basvuru.adayID.ad}`);
  // Tablo 5 içeriği...
  return doc;
};