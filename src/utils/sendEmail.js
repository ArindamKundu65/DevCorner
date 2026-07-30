import "dotenv/config";


import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: false, // STARTTLS
    family: 4,      // Force IPv4
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.log("Transport error:", error);
    } else {
        console.log("Transport is ready");
    }
});

export const sendConnectionRequestEmail = async (
    receiverEmail,
    receiverName,
    senderName
) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: receiverEmail,
        subject: "You have a new connection request",
        html: `
            <h2>Hello ${receiverName},</h2>

            <p>
                <strong>${senderName}</strong> has sent you a connection request
                on DevCorner.
            </p>

            <p>Log in to DevCorner to view the request.</p>
        `
    });
   
};