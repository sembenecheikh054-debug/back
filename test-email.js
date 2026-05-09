require("dotenv").config();
const Brevo = require("@getbrevo/brevo");

const apiInstance = new Brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);

const sendSmtpEmail = new Brevo.SendSmtpEmail();

sendSmtpEmail.subject = "Test activation";
sendSmtpEmail.htmlContent = "<h1>Test email Brevo ✅</h1>";
sendSmtpEmail.sender = { 
    name: "RED PRODUCT", 
    email: "sembenecheikh054@gmail.com"
};
sendSmtpEmail.to = [{ 
    email: "sembenecheikh054@gmail.com"
}];

apiInstance.sendTransacEmail(sendSmtpEmail)
    .then(() => console.log("Email envoyé ✅"))
    .catch(err => console.log("Erreur:", err.message));