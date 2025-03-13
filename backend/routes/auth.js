// routes/auth.js
router.post("/login", async (req, res) => {
    const { tcKimlik, password } = req.body;
    const user = await User.findOne({ tcKimlik });
    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });
  
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Şifre hatalı" });
  
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token });
  });