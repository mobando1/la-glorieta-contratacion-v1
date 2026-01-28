import { COOKIE_NAME, verifySessionValue } from "./session";

const parseCookieHeader = (cookieHeader: string | null) => {
  if (!cookieHeader) return {};
  return cookieHeader.split(";").reduce<Record<string, string>>((acc, item) => {
    const [key, ...rest] = item.trim().split("=");
    acc[key] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
};

export const isAdminRequest = (request: Request) => {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  return verifySessionValue(cookies[COOKIE_NAME]);
};