import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  type ConfirmationResult,
  type UserCredential
} from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyBQMUHKzCfKi_SvA9PFEh-iE_1lYMUX8yw",
  authDomain: "shouma-d59ae.firebaseapp.com",
  projectId: "shouma-d59ae",
  storageBucket: "shouma-d59ae.firebasestorage.app",
  messagingSenderId: "403911213872",
  appId: "1:403911213872:web:7c3c9d0686a9170b0bfef5",
  measurementId: "G-CRLEGPPE2L"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.languageCode = "ar";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

/**
 * Format phone number to E.164 standard (e.g. +96890000000)
 */
export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^\d+]/g, "").trim();
  if (!cleaned) return "";
  
  if (!cleaned.startsWith("+")) {
    if (cleaned.startsWith("00")) {
      cleaned = "+" + cleaned.slice(2);
    } else if (cleaned.length === 8 && (cleaned.startsWith("9") || cleaned.startsWith("7"))) {
      // Oman phone number default
      cleaned = "+968" + cleaned;
    } else if (cleaned.startsWith("968")) {
      cleaned = "+" + cleaned;
    } else {
      cleaned = "+" + cleaned;
    }
  }
  return cleaned;
}

/**
 * Initialize or reset the reCAPTCHA verifier for Firebase Phone Auth
 */
export function initRecaptchaVerifier(containerId: string = "recaptcha-container"): RecaptchaVerifier {
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      // Ignore clear error if already disposed
    }
  }

  const container = document.getElementById(containerId);
  if (!container) {
    // Dynamically create container if missing
    const div = document.createElement("div");
    div.id = containerId;
    div.style.display = "none";
    document.body.appendChild(div);
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {
      console.log("[FIREBASE AUTH] reCAPTCHA verified successfully");
    },
    "expired-callback": () => {
      console.warn("[FIREBASE AUTH] reCAPTCHA expired, re-initializing...");
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    }
  });

  return window.recaptchaVerifier;
}

/**
 * Send SMS OTP via Firebase Authentication
 */
export async function sendFirebasePhoneOTP(
  rawPhone: string, 
  containerId: string = "recaptcha-container"
): Promise<{ confirmationResult: ConfirmationResult; formattedPhone: string }> {
  const formattedPhone = formatPhoneNumber(rawPhone);
  if (!formattedPhone || formattedPhone.length < 8) {
    throw new Error("رقم الهاتف غير صالح. يرجى التأكد من إدخال رقم هاتف صحيح مع المفتاح الدولي.");
  }

  const verifier = initRecaptchaVerifier(containerId);
  
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);
    window.confirmationResult = confirmationResult;
    return { confirmationResult, formattedPhone };
  } catch (err: any) {
    console.error("[FIREBASE PHONE AUTH ERROR]:", err);
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {}
      window.recaptchaVerifier = undefined;
    }

    if (err.code === "auth/invalid-phone-number") {
      throw new Error("رقم الهاتف غير صحيح. يرجى كتابة الرقم بالصيغة الدولية مثل +96891234567");
    } else if (err.code === "auth/too-many-requests") {
      throw new Error("تم تجاوز عدد المحاولات المسموح بها لتلقي الرمز. يرجى الانتظار قليلاً وإعادة المحاولة.");
    } else if (err.code === "auth/quota-exceeded") {
      throw new Error("تم الوصول إلى الحد الأقصى لرسائل SMS اليومية في Firebase.");
    } else if (err.code === "auth/captcha-check-failed") {
      throw new Error("فشل التحقق الأمني (reCAPTCHA). يرجى التحديث وإعادة المحاولة.");
    } else if (err.code === "auth/app-not-authorized") {
      throw new Error("تطبيقك غير مخوّل لاستخدام Firebase Phone Auth. تأكد من إضافة النطاق (Domain) في لوحة تحكم Firebase.");
    }

    throw new Error(err.message || "تعذر إرسال رمز التحقق عبر Firebase SMS.");
  }
}

/**
 * Verify SMS OTP Code entered by user
 */
export async function verifyFirebasePhoneOTP(
  confirmationResult: ConfirmationResult,
  code: string
): Promise<UserCredential> {
  if (!code || code.trim().length < 6) {
    throw new Error("يرجى إدخال رمز التحقق المكون من 6 أرقام.");
  }

  try {
    const userCredential = await confirmationResult.confirm(code.trim());
    return userCredential;
  } catch (err: any) {
    console.error("[FIREBASE VERIFY OTP ERROR]:", err);
    if (err.code === "auth/invalid-verification-code") {
      throw new Error("رمز التحقق المدخل غير صحيح.");
    } else if (err.code === "auth/code-expired") {
      throw new Error("انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد.");
    }
    throw new Error(err.message || "فشل التحقق من الرمز.");
  }
}
