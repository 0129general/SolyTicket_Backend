// services/verificationService.ts

import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { getVerificationContent } from "../emails/verificationEmail";

const prisma = new PrismaClient();

export const sendVerificationCode = async (userId: string, contact: string) => {
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();
  const expiresAt = new Date(Date.now() + 180 * 1000);
  // Store verification code in the database
  await prisma.verificationCode.create({
    data: {
      userId,
      code: verificationCode,
      expiresAt: expiresAt,
    },
  });

  // Send verification code
  const message = `Your verification code is ${verificationCode}`;
  await sendEmail(
    contact,
    "Verification Code",
    getVerificationContent(verificationCode),
  );
};

export const verifyCode = async (
  userId: string,
  code: string,
): Promise<boolean> => {
  const record = await prisma.verificationCode.findFirst({
    where: {
      userId,
      code,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    return false;
  }

  // Code is valid, delete it from the database
  await prisma.verificationCode.delete({ where: { id: record.id } });
  return true;
};

const transporter = nodemailer.createTransport({
  host: "mail.kurumsaleposta.com", // Your mail server
  port: 587, // Port for StartTLS
  secure: false, // Since you're using StartTLS
  auth: {
    user: "no-reply@solyticket.com",
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Send email
export const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string,
) => {
  try {
    const info = await transporter.sendMail({
      from: "no-reply@solyticket.com",
      to,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const sendResetEmail = async (email: string, token: string) => {
  const transporter = nodemailer.createTransport({
    host: "mail.artitel.com.tr",
    port: 587,
    secure: false,
    auth: {
      user: "sukrucan.ercoban@artitel.com.tr",
      pass: "sukru2023can.",
    },
  });

  const mailOptions = {
    from: "sukrucan.ercoban@artitel.com.tr",
    to: email,
    subject: "Password Reset",
    text: `You requested a password reset. Use this token to reset your password: ${token}`,
  };

  await transporter.sendMail(mailOptions);
};
