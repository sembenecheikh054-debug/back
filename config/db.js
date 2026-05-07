const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect("mongodb://localhost:27017/red");
        console.log("Mongo connecté ✅");
    } catch (error) {
        console.error("Erreur MongoDB :", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;