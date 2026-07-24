import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config.js';

const SEND_TIMEOUT_MS = 8_000;

let transporter: Transporter | null = null;

export function isMailerConfigured(): boolean {
  return Boolean(config.smtp.host && config.smtp.user && config.smtp.pass);
}

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
      connectionTimeout: SEND_TIMEOUT_MS,
      greetingTimeout: SEND_TIMEOUT_MS,
      socketTimeout: SEND_TIMEOUT_MS,
      tls: { minVersion: 'TLSv1.2' },
    });
  }
  return transporter;
}

function otpEmailHtml(code: string): string {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#06080a;border-radius:20px;color:#f2f5f4">
    <div style="text-align:center;margin-bottom:24px">
      <span style="font-size:22px;font-weight:700;color:#34d399;letter-spacing:-0.5px">Savorah</span>
    </div>
    <h1 style="font-size:20px;margin:0 0 8px">Your login code</h1>
    <p style="color:#8b968f;font-size:14px;margin:0 0 24px">Enter this code to sign in to Savorah. It expires in 10 minutes.</p>
    <div style="background:linear-gradient(135deg,#10b981,#34d399);color:#06080a;font-size:34px;font-weight:800;letter-spacing:10px;text-align:center;padding:20px;border-radius:16px">${code}</div>
    <p style="color:#667069;font-size:12px;margin:24px 0 0">If you didn't request this, you can safely ignore this email.</p>
  </div>`;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

/**
 * Send a one-time login code. Returns whether it was actually emailed.
 * Never hangs the auth flow — SMTP failures/timeouts fall back to console
 * logging so local login still works.
 */
export async function sendOtpEmail(to: string, code: string): Promise<boolean> {
  if (!isMailerConfigured()) {
    console.log(`\n[Savorah OTP] SMTP not configured. Login code for ${to}: ${code}\n`);
    return false;
  }

  try {
    await withTimeout(
      getTransporter().sendMail({
        from: `"Savorah" <${config.smtp.from}>`,
        to,
        subject: `${code} is your Savorah login code`,
        html: otpEmailHtml(code),
        text: `Your Savorah login code is ${code}. It expires in 10 minutes.`,
      }),
      SEND_TIMEOUT_MS,
      'SMTP send'
    );
    return true;
  } catch (err: any) {
    // Reset transporter so the next attempt can reconnect cleanly.
    transporter = null;
    console.warn(`[Savorah OTP] Email failed (${err?.message || err}). Falling back to console.`);
    console.log(`\n[Savorah OTP] Login code for ${to}: ${code}\n`);
    return false;
  }
}
