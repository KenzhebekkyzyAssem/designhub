import { NextRequest, NextResponse } from "next/server";

import { randomBytes, createHash } from "node:crypto";

import { createSupabaseAdmin } from "@/lib/supabase-admin";

import { encrypt } from "@/lib/integrations/encryption";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    /* =========================
       CONFIGURATION
    ========================= */

    const clientId = process.env.FIGMA_CLIENT_ID;
    const redirectUri = process.env.FIGMA_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { error: "Figma configuration is missing." },
        { status: 500 }
      );
    }

    const appOrigin = new URL(redirectUri).origin;

    if (request.headers.get("origin") !== appOrigin) {
      return NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403 }
      );
    }

    /* =========================
       AUTHENTICATION
    ========================= */

    const authorization =
      request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const token = authorization.slice(7);

    const supabase = createSupabaseAdmin();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json(
        { error: "Invalid user session." },
        { status: 401 }
      );
    }

    /* =========================
       OAUTH STATE
    ========================= */

    const state = randomBytes(32).toString("base64url");

    const codeVerifier =
      randomBytes(32).toString("base64url");

    const codeChallenge = createHash("sha256")
      .update(codeVerifier)
      .digest("base64url");

    /* =========================
       FIGMA AUTHORIZATION URL
    ========================= */

    const authorizationUrl = new URL(
      "https://www.figma.com/oauth"
    );

    authorizationUrl.searchParams.set(
      "client_id",
      clientId
    );

    authorizationUrl.searchParams.set(
  "redirect_uri",
  redirectUri
);

    authorizationUrl.searchParams.set(
  "scope",
  "current_user:read, file_content:read"
);

    authorizationUrl.searchParams.set(
      "state",
      state
    );

    authorizationUrl.searchParams.set(
      "response_type",
      "code"
    );

    authorizationUrl.searchParams.set(
      "code_challenge",
      codeChallenge
    );

    authorizationUrl.searchParams.set(
      "code_challenge_method",
      "S256"
    );

    /* =========================
       SECURE OAUTH SESSION
    ========================= */

    const oauthSession = encrypt(
      JSON.stringify({
        userId: user.id,
        state,
        codeVerifier,
        expiresAt: Date.now() + 10 * 60 * 1000,
      })
    );

    const response = NextResponse.json({
      authorizationUrl: authorizationUrl.toString(),
    });

    response.cookies.set(
      "figma_oauth_session",
      oauthSession,
      {
        httpOnly: true,
        secure: appOrigin.startsWith("https:"),
        sameSite: "lax",
        maxAge: 600,
        path: "/api/integrations/figma/callback",
      }
    );

    response.headers.set("Cache-Control", "no-store");

    return response;

  } catch {
    console.error("Failed to initialize Figma OAuth.");

    return NextResponse.json(
      { error: "Failed to connect Figma." },
      { status: 500 }
    );
  }
}