require("dotenv").config();
console.log("Démarrage serveur...");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", require("./routes/auth.routes"));
app.use("/post", require("./routes/post.routes"));

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log("le server a démarré au port " + port);
    });
  })
  .catch((err) => {
    console.error("❌ Erreur MongoDB :", err.message);
    process.exit(1);
  });

  //https://projet1-vo-lkeno.vercel.app/

