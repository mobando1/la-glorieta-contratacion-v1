import crypto from "crypto";

export const COOKIE_NAME = "la_glorieta_admin";
const SESSION_TTL_DAYS = 7;

export const getSecret = () => {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error("ADMIN_PASSWORD no está configurado.");
  }
  return secret;
};

const signValue = (value: string, secret: string) => {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
};

export const createSessionValue = () => {
  const secret = getSecret();
  const payload = `admin:${Date.now()}`;
  const signature = signValue(payload, secret);
  return `${payload}.${signature}`;
};

export const verifySessionValue = (value: string | undefined) => {
  if (!value) return false;
  let secret = "";
  try {
    secret = getSecret();
  } catch (error) {
    return false;
  }
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;
  return signValue(payload, secret) === signature;
};

export const sessionMaxAge = () => SESSION_TTL_DAYS * 24 * 60 * 60;