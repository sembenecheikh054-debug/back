const mongoose = require("mongoose");

const connectDB = async () => {
    try {

        console.log("Connexion MongoDB...");

        mongoose.set("strictQuery", false);

        await mongoose.connect(process.env.MONGO_URI);

        console.log("Mongo connecté ✅");

    } catch (error) {

        console.error("Erreur MongoDB :", error.message);

        process.exit(1);
    }
};

module.exports = connectDB;