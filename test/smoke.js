const express = require("express");
const http = require("http");
const { protect } = require("../src/index");

const app = express();
app.use(express.json());
protect(app);

app.post("/secure", (req, res) => {
  res.json({ ok: true, token: "secret-token" });
});

const server = app.listen(0, async () => {
  const { port } = server.address();

  const request = http.request(
    {
      hostname: "127.0.0.1",
      port,
      path: "/secure",
      method: "POST",
    },
    (res) => {
      if (res.statusCode !== 401) {
        console.error("Expected SecureLayer to block unauthenticated POST");
        process.exit(1);
      }
      server.close();
    }
  );

  request.on("error", (err) => {
    console.error(err);
    process.exit(1);
  });

  request.end();
});
