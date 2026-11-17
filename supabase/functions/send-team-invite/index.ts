import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return json({ error: "Missing authorization header" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const siteUrl = Deno.env.get("SITE_URL");
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL");

    if (
      !supabaseUrl ||
      !anonKey ||
      !serviceRoleKey ||
      !resendApiKey ||
      !siteUrl ||
      !fromEmail
    ) {
      console.error("Missing environment variables", {
        supabaseUrl: !!supabaseUrl,
        anonKey: !!anonKey,
        serviceRoleKey: !!serviceRoleKey,
        resendApiKey: !!resendApiKey,
        siteUrl: !!siteUrl,
        fromEmail: !!fromEmail,
      });

      return json(
        { error: "Missing server environment variables" },
        500
      );
    }

    // Verify authenticated caller
    const userClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      console.error("User verification error:", userError);

      return json({ error: "Unauthorized" }, 401);
    }

    // Read request body
    const body = await req.json().catch(() => null);

    const invitationId = body?.invitationId;

    if (!invitationId) {
      return json({ error: "invitationId is required" }, 400);
    }

    console.log("Looking for invitation:", invitationId);

    // Service-role client
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Find invitation
    const { data: invitation, error: invitationError } = await admin
      .from("team_invitations")
      .select("id, owner_id, email, role, status, token")
      .eq("id", invitationId)
      .maybeSingle();

    if (invitationError) {
      console.error("Invitation query error:", invitationError);

      return json(
        {
          error: "Could not load invitation",
          details: invitationError.message,
        },
        500
      );
    }

    if (!invitation) {
      console.error("Invitation not found:", invitationId);

      return json({ error: "Invitation not found" }, 404);
    }

    console.log("Invitation found:", invitation.id);

    // Only invitation owner may send it
    if (invitation.owner_id !== user.id) {
      console.error("Invitation owner mismatch", {
        invitationOwner: invitation.owner_id,
        currentUser: user.id,
      });

      return json({ error: "Forbidden" }, 403);
    }

    if (invitation.status !== "Pending") {
      return json(
        { error: "Invitation is no longer pending" },
        400
      );
    }

    const cleanSiteUrl = siteUrl.replace(/\/$/, "");

    const inviteLink = `${cleanSiteUrl}/invite/${invitation.token}`;

    const senderName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "A DesignHub user";

    console.log("Sending invitation email to:", invitation.email);

    // Send email through Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",

      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        from: fromEmail,
        to: [invitation.email],
        subject: `${senderName} invited you to DesignHub`,

        html: `
          <div
            style="
              margin: 0;
              background: #f7f7fb;
              padding: 40px 16px;
              font-family: Inter, Arial, sans-serif;
              color: #252a35;
            "
          >
            <div
              style="
                max-width: 560px;
                margin: 0 auto;
                background: #ffffff;
                border: 1px solid #e8e8ef;
                border-radius: 20px;
                padding: 32px;
              "
            >
              <div
                style="
                  font-size: 20px;
                  font-weight: 700;
                  letter-spacing: -0.4px;
                "
              >
                DesignHub
              </div>

              <h1
                style="
                  margin: 28px 0 10px;
                  font-size: 24px;
                  line-height: 1.25;
                "
              >
                You've been invited to a DesignHub team
              </h1>

              <p
                style="
                  margin: 0;
                  color: #7d8492;
                  font-size: 14px;
                  line-height: 1.7;
                "
              >
                ${escapeHtml(senderName)} invited you to collaborate in their
                DesignHub workspace as
                <strong>${escapeHtml(invitation.role)}</strong>.
              </p>

              <a
                href="${inviteLink}"
                style="
                  display: inline-block;
                  margin-top: 26px;
                  background: #6547ef;
                  color: #ffffff;
                  text-decoration: none;
                  font-size: 14px;
                  font-weight: 600;
                  padding: 13px 20px;
                  border-radius: 11px;
                "
              >
                Accept invitation
              </a>

              <p
                style="
                  margin: 28px 0 0;
                  color: #a0a6b2;
                  font-size: 12px;
                  line-height: 1.6;
                "
              >
                This invitation is intended for
                ${escapeHtml(invitation.email)}.
              </p>

              <p
                style="
                  margin: 12px 0 0;
                  color: #a0a6b2;
                  font-size: 11px;
                  line-height: 1.6;
                  word-break: break-all;
                "
              >
                If the button doesn't work, open:<br />
                ${inviteLink}
              </p>
            </div>
          </div>
        `,
      }),
    });

    const resendData = await response.json();

    if (!response.ok) {
      console.error("Resend error:", resendData);

      return json(
        {
          error: "Email provider rejected the request",
          details: resendData,
        },
        502
      );
    }

    console.log("Email sent successfully:", resendData);

    return json({
      success: true,
      emailId: resendData.id ?? null,
    });
  } catch (error) {
    console.error("Unexpected function error:", error);

    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown server error",
      },
      500
    );
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,

    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}