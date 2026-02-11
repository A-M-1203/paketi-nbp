const { MailtrapClient } = require("mailtrap");

const TOKEN = process.env.EMAIL_TOKEN;

const client = new MailtrapClient({
  token: TOKEN,
});

const sender = {
    email: process.env.EMAIL_NAME,
    name: process.env.EMAIL_USERNAME,
};


async function sendEmail(email,subject,text){
    const recipients = [
    {
        email: email,
    }
    ];

    return client
    .send({
        from: sender,
        to: recipients,
        subject: subject,
        text: text,
        category: "Status update",
    });
}

module.exports=sendEmail;