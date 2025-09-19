// lib/sendEmail.ts
import nodemailer from "nodemailer";
import User from "@/model/model";
import bcrypt from "bcryptjs";
import crypto from "crypto";

interface EmailParams {
    email: string;
    emailType: "VERIFY" | "RESET";
    userId: string;
}

interface EmailTemplates {
    [key: string]: {
        subject: string;
        getHtml: (token: string, domain: string) => string;
    };
}

// Email templates for better maintainability
const emailTemplates: EmailTemplates = {
    VERIFY: {
        subject: "Verify Your Email Address",
        getHtml: (token: string, domain: string) => `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Email Verification</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
                    .content { background: #f9f9f9; padding: 30px; }
                    .button { background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to MyApp!</h1>
                    </div>
                    <div class="content">
                        <h2>Verify Your Email Address</h2>
                        <p>Thank you for signing up! Please click the button below to verify your email address:</p>
                        <p style="text-align: center; margin: 30px 0;">
                            <a href="${domain}/verifyemail?token=${token}" class="button">Verify Email</a>
                        </p>
                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #4F46E5;">${domain}/verifyemail?token=${token}</p>
                        <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
                    </div>
                    <div class="footer">
                        <p>If you didn't create an account, please ignore this email.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    },
    RESET: {
        subject: "Reset Your Password",
        getHtml: (token: string, domain: string) => `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Password Reset</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
                    .content { background: #f9f9f9; padding: 30px; }
                    .button { background: #DC2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <h2>Reset Your Password</h2>
                        <p>You requested a password reset. Click the button below to create a new password:</p>
                        <p style="text-align: center; margin: 30px 0;">
                            <a href="${domain}/reset-password?token=${token}" class="button">Reset Password</a>
                        </p>
                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #DC2626;">${domain}/reset-password?token=${token}</p>
                        <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
                    </div>
                    <div class="footer">
                        <p>If you didn't request this reset, please ignore this email or contact support.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }
};

// Create transporter based on environment
const createTransporter = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
        // Gmail configuration for production [web:111]
        return nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // use STARTTLS
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
            },
            tls: {
                rejectUnauthorized: true // Enhanced security for production
            }
        });
    } else {
        // Mailtrap for development
        return nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: process.env.MAILTRAP_USER,
                pass: process.env.MAILTRAP_PASS
            }
        });
    }
};

export const sendEmail = async ({ email, emailType, userId }: EmailParams) => {
    try {
        // Input validation
        if (!email || !emailType || !userId) {
            throw new Error("Missing required parameters");
        }

        if (!["VERIFY", "RESET"].includes(emailType)) {
            throw new Error("Invalid email type");
        }

        // Generate more secure token using crypto [web:128]
        const randomBytes = crypto.randomBytes(32);
        const hashedToken = await bcrypt.hash(randomBytes.toString('hex') + userId.toString(), 12);
        
        // Token expiry - 1 hour for better security
        const tokenExpiry = Date.now() + 3600000; // 1 hour instead of 6 minutes

        // Update user with token based on email type
        const updateData = emailType === "VERIFY" 
            ? { 
                verifyToken: hashedToken, 
                verifyTokenExpiry: tokenExpiry 
              }
            : { 
                forgotpasswordToken: hashedToken, 
                forgotpasswordTokenExpiry: tokenExpiry // Fixed typo in original
              };

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            throw new Error("User not found");
        }

        // Create transporter
        const transporter = createTransporter();

        // Verify transporter configuration
        try {
            await transporter.verify();
            console.log("SMTP connection verified successfully");
        } catch (error) {
            console.error("SMTP connection failed:", error);
            throw new Error("Email service configuration error");
        }

        // Get email template
        const template = emailTemplates[emailType];
        const domain = process.env.DOMAIN || process.env.NEXTAUTH_URL || 'http://localhost:3000';

        // Enhanced mail options
        const mailOptions = {
            from: {
                name: process.env.EMAIL_FROM_NAME || "MyApp Team",
                address: process.env.EMAIL_FROM_ADDRESS || process.env.GMAIL_USER || "noreply@myapp.com"
            },
            to: email,
            subject: template.subject,
            html: template.getHtml(hashedToken, domain),
            // Add text version for better deliverability
            text: `
                ${emailType === "VERIFY" ? "Verify your email" : "Reset your password"}
                
                Please visit this link: ${domain}/${emailType === "VERIFY" ? "verifyemail" : "reset-password"}?token=${hashedToken}
                
                This link expires in 1 hour.
                
                If you didn't request this, please ignore this email.
            `.trim(),
            // Add security headers
            headers: {
                'X-Priority': '1',
                'X-MSMail-Priority': 'High',
                'Importance': 'high'
            }
        };

        // Send email with retry logic
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
            try {
                const mailResponse = await transporter.sendMail(mailOptions);
                
                console.log(`Email sent successfully to ${email}:`, mailResponse.messageId);
                
                // Log for monitoring (remove sensitive info)
                console.log(`${emailType} email sent to user ${userId}`);
                
                return {
                    success: true,
                    messageId: mailResponse.messageId,
                    message: `${emailType} email sent successfully`
                };
                
            } catch (error) {
                attempts++;
                console.error(`Email send attempt ${attempts} failed:`, error);
                
                if (attempts === maxAttempts) {
                    throw error;
                }
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
            }
        }

    } catch (error: unknown) {
        console.error("Email service error:", error);
        
        if (error instanceof Error) {
            // Don't expose internal errors to client
            if (error.message.includes('User not found')) {
                throw new Error("Invalid user");
            } else if (error.message.includes('SMTP') || error.message.includes('Email service')) {
                throw new Error("Email service temporarily unavailable");
            } else {
                throw new Error(error.message);
            }
        } else {
            throw new Error("An unknown error occurred while sending email");
        }
    }
};

// Utility function to verify email token
export const verifyEmailToken = async (token: string, tokenType: "verify" | "reset") => {
    try {
        const field = tokenType === "verify" ? "verifyToken" : "forgotpasswordToken";
        const expiryField = tokenType === "verify" ? "verifyTokenExpiry" : "forgotpasswordTokenExpiry";
        
        const user = await User.findOne({
            [field]: token,
            [expiryField]: { $gt: Date.now() }
        });

        if (!user) {
            return { success: false, message: "Invalid or expired token" };
        }

        return { success: true, user };
    } catch (error) {
        console.error("Token verification error:", error);
        return { success: false, message: "Token verification failed" };
    }
};
