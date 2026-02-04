const express = require("express");
const { protect } = require("../src/index");

const app = express();
app.use(express.json());

protect(app);

app.get("/", (req, res) => {
  res.json({
    message: "Hello from SecureLayer demo!",
    email: "hello@example.com",
  });
});

app.post("/api/notes", (req, res) => {
  res.json({
    status: "saved",
    note: req.body,
    token: "token-12345-ABCDE",
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`SecureLayer demo listening on ${port}`);
});
