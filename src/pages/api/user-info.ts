import { updateUserProfile } from "@/lib/firebaseService";
import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from 'nodemailer';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import newClientRegistration from "@/utils/template/newClientRegistration";

export const config = {
    api: {
        bodyParser: false,
        responseLimit: false,
    },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Parse form data including files with size limits
        const form = new IncomingForm({
            multiples: true,
            keepExtensions: true,
            maxFileSize: 5 * 1024 * 1024, // 5MB per file
            maxTotalFileSize: 20 * 1024 * 1024, // 20MB total
        });

        const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) {
                    // Handle file size limit exceeded error
                    if (err.message.includes('maxFileSize exceeded') || err.message.includes('maxTotalFileSize exceeded')) {
                        return reject(new Error('File size limit exceeded. Maximum file size is 5MB per file and 20MB total.'));
                    }
                    return reject(err);
                }
                resolve([fields, files]);
            });
        });

        // Check if userData exists and is properly formatted
        if (!fields.userData) {
            return res.status(400).json({ success: false, message: 'Missing user data' });
        }

        // Extract user data from fields
        let userData;
        try {
            userData = JSON.parse(fields.userData);
        } catch (error) {
            return res.status(400).json({ success: false, message: 'Invalid user data format' });
        }

        // Verify that uid exists
        if (!userData.uid) {
            return res.status(400).json({ success: false, message: 'Missing user ID' });
        }

        const { uid } = userData;

        // Create a profile update object with only the fields we need to update
        const profileUpdate = {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            phone: userData.mobileNumber || '',
            email: userData.email || '',
            address: userData.postalAddress || '',
            postalCode: userData.postalCode || '',
            dateOfBirth: userData.dateOfBirth || '',
            hasCompletedIntroduction: true,
            accountType: userData.accountType || 'individual',
            accountantLocation: userData.accountantLocation || '',
            // Add organization-specific fields if account type is organization
            ...(userData.accountType === 'organization' && {
                organizationDetails: {
                    companyName: userData.companyName || '',
                    companyEmail: userData.companyEmail || '',
                    companyPhone: userData.companyMobileNumber || '',
                    companyDateOfBirth: userData.companyDateOfBirth || '',
                    ABN: userData.ABN || '',
                    acn: userData.acn || '',
                    registeredAddress: userData.registeredAddress || '',
                    city: userData.city || '',
                    previousAccountant: {
                        name: userData.previousAccountantName || '',
                        email: userData.previousAccountantEmail || '',
                        phone: userData.previousAccountantPhone || ''
                    }
                }
            })
        };

        // Update user profile in Firestore
        try {
            const firebaseResponse = await updateUserProfile(uid, profileUpdate);

            if (firebaseResponse.success) {
                // Create email transporter
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.NEXT_PUBLIC_EMAIL_USER,
                        pass: process.env.NEXT_PUBLIC_EMAIL_PASS
                    }
                });

                // Prepare attachments for email
                const attachments: any = [];

                // Process ID documents
                if (files.idDocuments) {
                    const idDocs = Array.isArray(files.idDocuments) ? files.idDocuments : [files.idDocuments];
                    idDocs.forEach((file: any, index: any) => {
                        attachments.push({
                            filename: `ID_Document_${index + 1}${path.extname(file.originalFilename || '')}`,
                            content: fs.createReadStream(file.filepath)
                        });
                    });
                }

                // Process other documents
                if (files.otherDocuments) {
                    const otherDocs = Array.isArray(files.otherDocuments) ? files.otherDocuments : [files.otherDocuments];
                    otherDocs.forEach((file: any, index: any) => {
                        attachments.push({
                            filename: `Other_Document_${index + 1}${path.extname(file.originalFilename || '')}`,
                            content: fs.createReadStream(file.filepath)
                        });
                    });
                }

                // Get account location name
                const accountantLocations = {
                    runcorn: "RUNCORN (Aman Nagpal)",
                    logan: "LOGAN (MR Behzad Ahmad)",
                    beenleigh: "Beenleigh (Navpreet Kaur)"
                };

                const accountantLocation = accountantLocations[userData.accountantLocation as keyof typeof accountantLocations] || "Not specified";
                const htmlTemplate = newClientRegistration(userData, files, accountantLocation);
                // Configure email options
                const mailOptions = {
                    from: process.env.NEXT_PUBLIC_EMAIL_USER,
                    replyTo: userData.email,
                    to: process.env.NEXT_PUBLIC_EMAIL_USER,
                    subject: `New Client Registration: ${userData.firstName} ${userData.lastName}`,
                    text: `New client registration from ${userData.firstName} ${userData.lastName}. Please see attached documents.`,
                    html: htmlTemplate,
                    attachments: attachments
                };

                // Send email
                await transporter.sendMail(mailOptions);

                // Clean up temporary files
                if (files.idDocuments) {
                    const idDocs = Array.isArray(files.idDocuments) ? files.idDocuments : [files.idDocuments];
                    idDocs.forEach((file: any) => {
                        fs.unlink(file.filepath, (err) => {
                            if (err) console.error(`Failed to delete temporary file: ${file.filepath}`, err);
                        });
                    });
                }

                if (files.otherDocuments) {
                    const otherDocs = Array.isArray(files.otherDocuments) ? files.otherDocuments : [files.otherDocuments];
                    otherDocs.forEach((file: any) => {
                        fs.unlink(file.filepath, (err) => {
                            if (err) console.error(`Failed to delete temporary file: ${file.filepath}`, err);
                        });
                    });
                }
                res.status(200).json({ success: true, message: 'Registration completed successfully' });
            } else {
                res.status(500).json({ success: false, message: 'Failed to update user profile' });
            }
        } catch (error) {
            console.error('Error updating user profile:', error);
            res.status(500).json({ success: false, message: 'Failed to update user profile' });
        }
    } catch (error) {
        console.error('Error processing registration:', error);
        res.status(500).json({ success: false, message: 'An error occurred during registration' });
    }
};

export default handler;