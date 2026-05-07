// backend/routes/auth.routes.js
const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// register
router.post("/register", async (req, res) => {
    try {
        const { nom, email, password } = req.body;

        // vérifie si l'email existe déjà
        const existe = await User.findOne({ email });
        if (existe) return res.status(400).json({ message: "Email déjà utilisé" });

        // hash du mot de passe
        const hash = await bcrypt.hash(password, 10);

        const user = new User({ nom, email, password: hash });
        await user.save();

        res.json({ message: "Compte créé ✅" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // vérifie si l'utilisateur existe
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Email introuvable" });

        
        // vérifie le mot de passe
        const valide = await bcrypt.compare(password, user.password);
        if (!valide) return res.status(400).json({ message: "Mot de passe incorrect" });

        // génère le token
        const token = jwt.sign({ id: user._id }, "secret", { expiresIn: "1d" });

        res.json({ token, nom: user.nom });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;