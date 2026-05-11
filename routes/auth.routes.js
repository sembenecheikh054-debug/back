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
                name: "RED-PRODUCT",
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
       res.json({ message: "Compte activé avec succès ✅" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//DEUX ROUTES POUR LES MDP

// FORGOT PASSWORD — envoie le mail
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Email introuvable" });

        // génère un token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // sauvegarde avec expiry 1 heure
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 3600000; // 1h
        await user.save();

        // lien de réinitialisation
        const resetLink = `${process.env.CLIENT_URL}/reset-password.html?token=${resetToken}`;

        // envoie l'email
        await apiInstance.sendTransacEmail({
            sender: {
                name: "RED-PRODUCT",
                email: "sembenecheikh054@gmail.com"
            },
            to: [{ email: user.email }],
            subject: "Réinitialisation de mot de passe",
            htmlContent: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Bonjour ${user.nom} 👋</h2>
                    <p>Vous avez demandé une réinitialisation de mot de passe.</p>
                    <p>Cliquez sur le bouton ci-dessous :</p>
                    <a href="${resetLink}" 
                       style="background:#374151; color:white; padding:12px 24px; 
                              border-radius:8px; text-decoration:none; display:inline-block;">
                        Réinitialiser mon mot de passe
                    </a>
                    <p style="color:gray; margin-top:20px;">Ce lien expire dans 1 heure.</p>
                </div>
            `
        });

        res.json({ message: "Email envoyé ✅ vérifiez votre boîte mail" });

    } catch (err) {
        console.error("Erreur forgot-password:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// RESET PASSWORD — change le mot de passe
router.post("/reset-password", async (req, res) => {
    try {
        const { token, password } = req.body;

        // cherche l'utilisateur avec le token valide
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() } // vérifie que le token n'est pas expiré
        });

        if (!user) return res.status(400).json({ message: "Lien invalide ou expiré" });

        // hash le nouveau mot de passe
        const hash = await bcrypt.hash(password, 10);
        user.password = hash;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.json({ message: "Mot de passe réinitialisé ✅" });

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