import { Resend } from "resend";
import {
  EmailVerification,
  OTPEmail,
  PasswordReset,
  renderEmailToHtml,
  renderEmailToText,
} from "@/emails";
import { env } from "@/lib/env";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}

async function sendEmail(options: EmailOptions) {
  // Dev / unconfigured fallback: log instead of failing.
  if (!env.RESEND_API_KEY || !env.RESEND_EMAIL_FROM) {
    console.log(
      `[email] RESEND not configured. Would send "${options.subject}" to`,
      options.to,
    );
    return;
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from: env.RESEND_EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });

  if (result.error) {
    throw new Error(`Resend API error: ${result.error.message ?? "Unknown error"}`);
  }
  return result;
}

export async function sendVerificationEmail(options: {
  user: { email: string; name?: string };
  url: string;
}) {
  const component = EmailVerification({
    userName: options.user.name,
    verificationUrl: options.url,
    appName: env.APP_NAME,
    appUrl: env.APP_ORIGIN,
  });
  return sendEmail({
    to: options.user.email,
    subject: "Verify your email address",
    html: await renderEmailToHtml(component),
    text: await renderEmailToText(component),
  });
}

export async function sendPasswordReset(options: {
  user: { email: string; name?: string };
  url: string;
}) {
  const component = PasswordReset({
    userName: options.user.name,
    resetUrl: options.url,
    appName: env.APP_NAME,
    appUrl: env.APP_ORIGIN,
  });
  return sendEmail({
    to: options.user.email,
    subject: "Reset your password",
    html: await renderEmailToHtml(component),
    text: await renderEmailToText(component),
  });
}

export async function sendOTP(options: {
  email: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password";
}) {
  if (env.ENVIRONMENT === "development") {
    console.log(`OTP code for ${options.email}: ${options.otp}`);
  }
  const component = OTPEmail({
    otp: options.otp,
    type: options.type,
    appName: env.APP_NAME,
    appUrl: env.APP_ORIGIN,
  });
  const typeLabels = {
    "sign-in": "Sign In",
    "email-verification": "Email Verification",
    "forget-password": "Password Reset",
  };
  return sendEmail({
    to: options.email,
    subject: `Your ${typeLabels[options.type]} code`,
    html: await renderEmailToHtml(component),
    text: await renderEmailToText(component),
  });
}
