import nodemailer from "nodemailer";

interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

// Lazy-load configurations to avoid throwing error at startup
const getMailConfig = (): MailConfig | null => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"Shouma Explorer" <noreply@shouma-explorer.com>`;

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host,
    port,
    secure: port === 465,
    user,
    pass,
    from,
  };
};

/**
 * Sends a verification OTP code via Email
 */
export async function sendEmailOTP(toEmail: string, code: string, username: string): Promise<boolean> {
  const config = getMailConfig();
  
  if (!config) {
    console.warn(`[VERIFICATION SERVICE] SMTP not fully configured. Cannot send real email to ${toEmail}. Set SMTP_HOST, SMTP_USER, SMTP_PASS inside your environment.`);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    const arabicBody = `
      <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: -0.5px;">شوما للاستكشاف السياحي</h1>
          <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">تأكيد حسابك السياحي في سلطنة عمان</p>
        </div>
        <div style="padding: 32px; background-color: #ffffff; color: #1e293b;">
          <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">مرحباً <strong>${username}</strong>،</p>
          <p style="font-size: 15px; line-height: 1.6; color: #475569;">شكرًا لتسجيلك في منصة شوما. لتفعيل حسابك والبدء في استكشاف أجمل المعالم السياحية وحجز الرحلات، يرجى استخدام رمز التحقق التالي:</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <div style="display: inline-block; background-color: #f8fafc; border: 2px dashed #059669; border-radius: 12px; padding: 12px 36px; letter-spacing: 6px; font-size: 32px; font-weight: 800; color: #0f172a; font-family: monospace;">
              ${code}
            </div>
          </div>
          
          <p style="font-size: 13px; color: #ef4444; font-weight: 500; margin-bottom: 24px;">ملاحظة: هذا الرمز صالح لمدة 15 دقيقة فقط. يرجى عدم مشاركته مع أي شخص لحماية حسابك.</p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          
          <p style="font-size: 12px; line-height: 1.5; color: #64748b; margin-bottom: 0;">إذا لم تقم بإنشاء حساب في شوما، يرجى تجاهل هذا البريد الإلكتروني.</p>
        </div>
        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
          &copy; ${new Date().getFullYear()} شوما (Shouma). جميع الحقوق محفوظة.
        </div>
      </div>
    `;

    const englishBody = `
      <div dir="ltr" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: -0.5px;">Shouma Explorer</h1>
          <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Confirm your tourism account in the Sultanate of Oman</p>
        </div>
        <div style="padding: 32px; background-color: #ffffff; color: #1e293b;">
          <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Hello <strong>${username}</strong>,</p>
          <p style="font-size: 15px; line-height: 1.6; color: #475569;">Thank you for registering on Shouma Explorer. To activate your account and start your journey, please use the following one-time verification code (OTP):</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <div style="display: inline-block; background-color: #f8fafc; border: 2px dashed #059669; border-radius: 12px; padding: 12px 36px; letter-spacing: 6px; font-size: 32px; font-weight: 800; color: #0f172a; font-family: monospace;">
              ${code}
            </div>
          </div>
          
          <p style="font-size: 13px; color: #ef4444; font-weight: 500; margin-bottom: 24px;">Note: This code is valid for 15 minutes. Please do not share this code with anyone to protect your credentials.</p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          
          <p style="font-size: 12px; line-height: 1.5; color: #64748b; margin-bottom: 0;">If you didn't request a register verification code on Shouma, you can safely ignore this email.</p>
        </div>
        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
          &copy; ${new Date().getFullYear()} Shouma Explorer. All rights reserved.
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: config.from,
      to: toEmail,
      subject: `رمز تحقق شوما: ${code} | Shouma Verification Code: ${code}`,
      text: `رمز التحقق الخاص بك هو: ${code} | Your verification code is: ${code}`,
      html: `
        <div style="padding: 10px; background-color: #f8fafc;">
          ${arabicBody}
          <div style="height: 30px;"></div>
          ${englishBody}
        </div>
      `,
    });

    console.log(`[VERIFICATION SERVICE] Real email sent to ${toEmail}. MessageID: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error(`[VERIFICATION SERVICE] Failed to send real email to ${toEmail}:`, err);
    return false;
  }
}

/**
 * Sends a verification OTP code via SMS (Handled on client-side via Firebase SMS)
 */
export async function sendSMSOTP(toPhone: string, code: string): Promise<boolean> {
  console.log(`[VERIFICATION SERVICE] Phone SMS OTP for ${toPhone} is handled directly by Firebase Phone Auth on the client.`);
  return true;
}

/**
 * Helper to check if real email SMTP is configured
 */
export function isMailConfigured(): boolean {
  return getMailConfig() !== null;
}

/**
 * Helper to check if Phone SMS (Firebase) is active
 */
export function isPhoneSMSConfigured(): boolean {
  return true;
}

/**
 * Master dispatcher for sending OTP
 */
export async function dispatchOTP(
  via: "email" | "phone" | string,
  target: string,
  code: string,
  username: string
): Promise<{ success: boolean; method: string }> {
  console.log(`[VERIFICATION SERVICE] Dispatching OTP code: ${code} to ${target} via ${via}`);
  
  if (via === "email" || (via !== "phone" && target.includes("@"))) {
    const success = await sendEmailOTP(target, code, username);
    return { success, method: "email" };
  } else {
    const success = await sendSMSOTP(target, code);
    return { success, method: "phone" };
  }
}
