// backend/routes/auth.routes.js
const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// register
exports.register = async (req, res) => {
  try {
    const { nom, email, password } = req.body;
    if (!nom || !email || !password)
      return res.status(400).json({ message: "Tous les champs sont requis" });
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email déjà utilisé" });
    const hashed = await bcrypt.hash(password, 10);
    const photo = req.file ? req.file.path : "";
    const activationToken = crypto.randomBytes(32).toString("hex");
    const user = await User.create({
      nom,
      email,
      password: hashed,
      photo,
      isActive: false,
      activationToken,
    });
    const activationUrl = `https://red-product-woad.vercel.app/activate.html?token=${activationToken}`;
    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: "RED PRODUCT", email: "baabou073@gmail.com" },
        to: [{ email }],
        subject: "Activez votre compte RED PRODUCT",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
            <h2 style="color: #494C4F;">RED PRODUCT</h2>
            <p>Bonjour <b>${nom}</b>,</p>
            <p>Cliquez sur le bouton ci-dessous pour activer votre compte.</p>
            <a href="${activationUrl}" style="display:inline-block; background:#494C4F; color:white; padding:12px 24px; border-radius:8px; text-decoration:none; margin: 20px 0;">
              Activer mon compte
            </a>
            <p style="color:#999; font-size:12px;">Si vous n'avez pas créé de compte, ignorez cet email.</p>
          </div>`,
      }),
    });
    console.log("Brevo status:", brevoRes.status);
    const brevoData = await brevoRes.json();
    console.log("Brevo response:", JSON.stringify(brevoData));
    res
      .status(201)
      .json({ message: "Compte créé ! Vérifiez votre email pour l'activer." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email et mot de passe requis" });
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Utilisateur introuvable" });
    if (user.isActive !== true)
      return res
        .status(403)
        .json({ message: "Compte non activé. Vérifiez votre email." });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mot de passe incorrect" });
    const token = jwt.sign(
      { id: user._id, nom: user.nom },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    res.json({
      token,
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        photo: user.photo,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.activateAccount = async (req, res) => {
  try {
    const user = await User.findOne({ activationToken: req.params.token });
    if (!user) return res.status(400).json({ message: "Token invalide" });
    user.isActive = true;
    user.activationToken = undefined;
    await user.save();
    res.json({ message: "Compte activé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = router;