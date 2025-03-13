const basvuruSchema = new mongoose.Schema({
    adayID: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ilanID: { type: mongoose.Schema.Types.ObjectId, ref: "Ilan" },
    belgeler: [String], // AWS S3 URL'leri
    durum: { type: String, enum: ["Beklemede", "Onaylandı", "Reddedildi"] },
  });