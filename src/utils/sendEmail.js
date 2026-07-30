import "dotenv/config";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendConnectionRequestEmail = async (
  receiverEmail,
  receiverName,
  senderName
) => {
  const response = await resend.emails.send({
  from: "noreply@devcorner.com",
    to: receiverEmail,
    subject: "You have a new connection request",
    html: `
      <h2>Hello ${receiverName},</h2>

      <p>
        <strong>${senderName}</strong> has sent you a connection request on DevCorner.
      </p>

      <p>Log in to DevCorner to view the request.</p>
    `,
  });

  console.log(response);
};