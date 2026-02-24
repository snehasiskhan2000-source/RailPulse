const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});

app.get("/api/test", (req, res) => {
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});
