// ✅ dotenv simple — lit les variables d'environnement Render
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

const port = process.env.PORT || 5000;

// ✅ 1. cors en premier
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ 2. routes après
app.use("/auth", require("./routes/auth.routes"));
app.use("/post", require("./routes/post.routes"));

// ✅ 3. connexion MongoDB et démarrage du projet
connectDB().then(() => {
    app.listen(port, () => console.log("le server a demarré au port " + port));
});