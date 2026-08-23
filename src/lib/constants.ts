export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "BlogKu";

export const IS_LOCALHOST = /localhost|127\.0\.0\.1/.test(SITE_URL);

export const INDEXNOW_KEY = "f942233eb54839ee1cdd52aec3921a12";
