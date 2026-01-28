import { cookies } from "next/headers";
import { COOKIE_NAME, createSessionValue, sessionMaxAge } from "./session";

export const setSessionCookie = () => {
  const sessionValue = createSessionValue();
  cookies().set({
    name: COOKIE_NAME,
    value: sessionValue,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: sessionMaxAge(),
  });
};

export const clearSessionCookie = () => {
  cookies().set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
};