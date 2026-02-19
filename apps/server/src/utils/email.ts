import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: env.SMTP_USER
    ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
    : undefined,
});

export async function sendVerificationEmail(
  email: string,
  token: string,
): Promise<void> {
  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;

  try {
    await transporter.sendMail({
      from: env.MAIL_FROM,
      to: email,
      subject: 'LinkPage - 이메일 인증',
      html: `
        <div style="max-width:480px;margin:0 auto;font-family:sans-serif;padding:24px;">
          <h2 style="color:#6366F1;">LinkPage 이메일 인증</h2>
          <p>아래 버튼을 클릭하여 이메일을 인증해주세요.</p>
          <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#6366F1;color:#fff;border-radius:8px;text-decoration:none;margin:16px 0;">이메일 인증하기</a>
          <p style="color:#666;font-size:14px;">이 링크는 24시간 동안 유효합니다.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Failed to send verification email:', err);
    // Don't throw - email sending failure shouldn't block signup
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
): Promise<void> {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: env.MAIL_FROM,
      to: email,
      subject: 'LinkPage - 비밀번호 재설정',
      html: `
        <div style="max-width:480px;margin:0 auto;font-family:sans-serif;padding:24px;">
          <h2 style="color:#6366F1;">비밀번호 재설정</h2>
          <p>아래 버튼을 클릭하여 비밀번호를 재설정해주세요.</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#6366F1;color:#fff;border-radius:8px;text-decoration:none;margin:16px 0;">비밀번호 재설정</a>
          <p style="color:#666;font-size:14px;">이 링크는 1시간 동안 유효합니다.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Failed to send password reset email:', err);
  }
}
