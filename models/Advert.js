const ilanSchema = new mongoose.Schema({
    baslik: String,
    kategori: { type: String, enum: ["Dr. Öğr. Üyesi", "Doçent", "Profesör"] },
    baslangicTarihi: Date,
    bitisTarihi: Date,
    kriterler: [{ type: mongoose.Schema.Types.ObjectId, ref: "Kriter" }],
    adminID: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  });