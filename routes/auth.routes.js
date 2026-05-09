const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const apiInstance = require("../config/brevo");

// REGISTER
router.post("/register", async (req, res) => {
    try {

        console.log("👉 REGISTER HIT"); // 🔥 ICI (entrée route)

        const { nom, email, password } = req.body;

        console.log("📩 BODY:", req.body); // 🔥 vérifier données reçues

        const existe = await User.findOne({ email });

        if (existe) {
            console.log("❌ EMAIL EXISTE");
            return res.status(400).json({
                message: "Email déjà utilisé",
            });
        }

        const hash = await bcrypt.hash(password, 10);

        console.log("🔐 PASSWORD HASHED");

        const verificationToken = crypto.randomBytes(32).toString("hex");

        console.log("🔑 TOKEN GENERATED");

        const user = new User({
            nom,
            email,
            password: hash,
            verificationToken,
            isVerified: false
        });

        await user.save();

        console.log("💾 USER SAVED");

        const activationLink =
            `${process.env.CLIENT_URL}/active.html?token=${verificationToken}`;

        console.log("📧 SENDING EMAIL...");

        await apiInstance.sendTransacEmail({
            sender: {
                name: "BUSNESS",
                email: "sembenecheikh054@gmail.com",
            },
            to: [{ email: user.email }],
            subject: "Activation de compte",
            htmlContent: `
                <h2>Bonjour ${user.nom}</h2>
                <p>Cliquez pour activer :</p>
                <a href="${activationLink}">Activer mon compte</a>
            `,
        });

        console.log("✅ EMAIL SENT");

        return res.json({
            message: "Compte créé. Vérifiez votre email ✅",
        });

    } catch (err) {
        console.log("🔥 ERROR REGISTER:", err); // 🔥 TRÈS IMPORTANT

        return res.status(500).json({
            error: err.message,
        });
    }
});

// ACTIVATION
router.get("/verify/:token", async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });

        if (!user) {
            return res.status(400).json({ message: "Token invalide" });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        // ✅ redirige vers active.html sur Vercel
        res.redirect(`${process.env.CLIENT_URL}/active.html?activated=true`);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {

        const { email, password } = req.body;

        // vérifie utilisateur
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Email introuvable",
            });
        }

        // vérifie activation
        if (!user.isVerified) {
            return res.status(400).json({
                message: "Veuillez activer votre compte",
            });
        }

        // vérifie password
        const valide = await bcrypt.compare(
            password,
            user.password
        );

        if (!valide) {
            return res.status(400).json({
                message: "Mot de passe incorrect",
            });
        }

        // token jwt
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            token,
            nom: user.nom,
        });

    } catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
});

module.exports = router;