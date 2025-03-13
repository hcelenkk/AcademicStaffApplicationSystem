const userSchema = new mongoose.Schema({
    tcKimlik: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["aday", "admin", "yonetici", "jüri"], required: true },
    email: { type: String, required: true },
    // Diğer alanlar (ad, soyad, vs.)
  });