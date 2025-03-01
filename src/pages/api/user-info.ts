import { updateUserProfile } from "@/lib/firebaseService";
import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from 'nodemailer';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const data = JSON.parse(req.body);
    const { uid, taxFileNumber, otherDetails, idDocuments, otherDocuments, declaration, ...userInfo } = data;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.NEXT_PUBLIC_EMAIL_USER,
            pass: process.env.NEXT_PUBLIC_EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.NEXT_PUBLIC_EMAIL_USER,
        replyto: userInfo.email,
        to: process.env.NEXT_PUBLIC_EMAIL_USER,
        subject: "New User Information",
        text: "New User Information",
        html: `<p>New User Information</p>
        <p>Name: ${userInfo.firstName} ${userInfo.lastName}</p>
        <p>Email: ${userInfo.email}</p>
        <p>Phone: ${userInfo.phone}</p>
        <p>Tax File Number: ${taxFileNumber}</p>
        <p>Other Details: ${otherDetails}</p>
        <p>ID Documents: ${idDocuments}</p>
        <p>Other Documents: ${otherDocuments}</p>
        <p>Declaration: ${declaration}</p>
        `
    }

    try {
        const firebaseResponse = await updateUserProfile(data.uid, userInfo);
        if(firebaseResponse.success){
            await transporter.sendMail(mailOptions);
            res.status(200).json({message: 'Email sent successfully'});
        }else{
            res.status(500).json({message: 'Failed to send email'});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Failed to send email'});
    }
}

export default handler;