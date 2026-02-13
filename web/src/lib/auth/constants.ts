export const SESSION_COOKIE_NAMES = {
  accessToken: "ceoms_access_token",
  refreshToken: "ceoms_refresh_token",
  csrfToken: "ceoms_csrf_token",
  user: "ceoms_user"
} as const;

export const SESSION_COOKIE_MAX_AGE_SECONDS = {
  accessToken: 60 * 60,
  refreshToken: 60 * 60 * 24 * 7,
  csrfToken: 60 * 60 * 8,
  user: 60 * 60 * 8
} as const;
