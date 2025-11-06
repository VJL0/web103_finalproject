import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api", (req, res) => {
  res.json({ message: "connected" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
