// routes/aday.js
router.post("/tc-dogrula", async (req, res) => {
    const { tcKimlik } = req.body;
    try {
      const response = await axios.post("https://api.e-devlet.gov.tr/tc-dogrula", { tcKimlik });
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: "Doğrulama başarısız" });
    }
  });