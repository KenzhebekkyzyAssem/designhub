
import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdmin } from "@/lib/supabase-admin";

import {
  encrypt,
  decrypt,
} from "@/lib/integrations/encryption";

export const runtime = "nodejs";

/* ==========================================
   TYPES
========================================== */

type OAuthSession = {
  userId: string;
  state: string;
  codeVerifier: string;
  expiresAt: number;
};

type FigmaTokenResponse = {
  user_id_string?: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
};

type FigmaUser = {
  id: string;
  handle: string;
  email: string;
  img_url: string;
};

/* ==========================================
   CALLBACK
========================================== */

export async function GET(request: NextRequest) {
  const clientId = process.env.FIGMA_CLIENT_ID;
  const clientSecret = process.env.FIGMA_CLIENT_SECRET;
  const redirectUri = process.env.FIGMA_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: "Figma configuration is missing." },
      { status: 500 }
    );
  }

  const appOrigin = new URL(redirectUri).origin;

  /* ==========================================
     RETURN TO DESIGNHUB
  ========================================== */
  function redirectToApp(
    status: "success" | "error",
    message?: string
  ) {
    console.log("[FIGMA CALLBACK]", status, message);
    
    const configuredPath =
      process.env.FIGMA_RETURN_PATH || "/dashboard";

    let url = new URL(configuredPath, appOrigin);

    if (url.origin !== appOrigin) {
      url = new URL("/dashboard", appOrigin);
    }

    url.searchParams.set("integration", "figma");
    url.searchParams.set("status", status);

    if (message) {
      url.searchParams.set("message", message);
    }

    const response = NextResponse.redirect(url, 303);

    response.cookies.set("figma_oauth_session", "", {
      httpOnly: true,
      secure: appOrigin.startsWith("https:"),
      sameSite: "lax",
      path: "/api/integrations/figma/callback",
      maxAge: 0,
    });

    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Referrer-Policy", "no-referrer");

    return response;
  }

  try {
    /* ==========================================
       GET OAUTH PARAMETERS
    ========================================== */

    const code = request.nextUrl.searchParams.get("code");

    const state =
      request.nextUrl.searchParams.get("state");

    const oauthError =
      request.nextUrl.searchParams.get("error");

    if (oauthError) {
      return redirectToApp(
        "error",
        "authorization_denied"
      );
    }

    if (!code || !state) {
      return redirectToApp(
        "error",
        "missing_oauth_parameters"
      );
    }

    /* ==========================================
       VALIDATE OAUTH SESSION
    ========================================== */

    const encryptedSession = request.cookies.get(
      "figma_oauth_session"
    )?.value;

    if (!encryptedSession) {
      return redirectToApp(
        "error",
        "oauth_session_missing"
      );
    }

    const session: OAuthSession = JSON.parse(
      decrypt(encryptedSession)
    );

    if (
      !session.userId ||
      !session.codeVerifier ||
      !session.state ||
      !Number.isFinite(session.expiresAt) ||
      session.state !== state ||
      session.expiresAt <= Date.now()
    ) {
      return redirectToApp(
        "error",
        "invalid_oauth_session"
      );
    }

    /* ==========================================
       EXCHANGE CODE FOR ACCESS TOKEN
    ========================================== */

    const basicAuth = Buffer.from(
      `${clientId}:${clientSecret}`
    ).toString("base64");

    const tokenResponse = await fetch(
      "https://api.figma.com/v1/oauth/token",
      {
        method: "POST",

        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type":
            "application/x-www-form-urlencoded",
        },

        body: new URLSearchParams({
          code,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
          code_verifier: session.codeVerifier,
        }),

        cache: "no-store",
      }
    );

    if (!tokenResponse.ok) {
      console.error(
        "Figma token exchange failed:",
        tokenResponse.status
      );

      return redirectToApp(
        "error",
        "token_exchange_failed"
      );
    }

    const tokens: FigmaTokenResponse =
      await tokenResponse.json();

    if (
      typeof tokens.access_token !== "string" ||
      !tokens.access_token ||
      typeof tokens.refresh_token !== "string" ||
      !tokens.refresh_token ||
      !Number.isFinite(tokens.expires_in) ||
      tokens.expires_in <= 0
    ) {
      return redirectToApp(
        "error",
        "invalid_token_response"
      );
    }

    const expiresAt = new Date(
      Date.now() + tokens.expires_in * 1000
    ).toISOString();

    /* ==========================================
       GET FIGMA USER PROFILE
    ========================================== */

    const profileResponse = await fetch(
      "https://api.figma.com/v1/me",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },

        cache: "no-store",
      }
    );

    if (!profileResponse.ok) {
      console.error(
        "Figma profile request failed:",
        profileResponse.status
      );

      return redirectToApp(
        "error",
        "profile_request_failed"
      );
    }

    const profile: FigmaUser =
      await profileResponse.json();

    if (
      typeof profile.id !== "string" ||
      !profile.id ||
      (
        tokens.user_id_string &&
        tokens.user_id_string !== profile.id
      )
    ) {
      return redirectToApp(
        "error",
        "invalid_figma_profile"
      );
    }

    /* ==========================================
       VERIFY DESIGNHUB USER
    ========================================== */

    const supabase = createSupabaseAdmin();

    const { data: account, error: accountError } =
      await supabase.auth.admin.getUserById(
        session.userId
      );

    if (accountError || !account.user) {
      return redirectToApp(
        "error",
        "designhub_account_missing"
      );
    }

    /* ==========================================
       ENCRYPT TOKENS
    ========================================== */

    const encryptedAccessToken = encrypt(
      tokens.access_token
    );

    const encryptedRefreshToken = encrypt(
      tokens.refresh_token
    );

    /* ==========================================
       SAVE INTEGRATION
    ========================================== */

    const { error: databaseError } = await supabase.rpc(
      "save_figma_integration",
      {
        p_user_id: session.userId,

        p_account_id: profile.id,

        p_account_name: profile.handle ?? null,

        p_account_email: profile.email ?? null,

        p_account_avatar: profile.img_url ?? null,

        p_access_token: encryptedAccessToken,

        p_refresh_token: encryptedRefreshToken,

        p_expires_at: expiresAt,

        p_scopes: [
          "current_user:read",
          "file_content:read",
        ],
      }
    );

    if (databaseError) {
      console.error(
        "Failed to save Figma integration:",
        databaseError.code
      );

      return redirectToApp(
        "error",
        "database_save_failed"
      );
    }

    /* ==========================================
       SUCCESS
    ========================================== */

    return redirectToApp("success");

  } catch {
    console.error("Figma OAuth callback failed.");

    return redirectToApp(
      "error",
      "unexpected_error"
    );
  }
}
