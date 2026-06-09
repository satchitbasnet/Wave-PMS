import { NextResponse } from "next/server";
import { getCheckoutSessionStatus } from "@/lib/stripe-session-status";
import { createClient } from "@/lib/supabase/server";

async function handleSessionStatus(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const session = await getCheckoutSessionStatus(sessionId);

    const { data: profile } = await supabase
      .from("users")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (
      session.organization_id &&
      profile?.org_id &&
      session.organization_id !== profile.org_id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      status: session.status,
      payment_status: session.payment_status,
      customer_email: session.customer_email ?? user.email,
      plan_id: session.plan_id,
    });
  } catch (error) {
    console.error("Session status error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve session" },
      { status: 500 }
    );
  }
}

/** GET /api/stripe/session-status?session_id=cs_... */
export async function GET(request: Request) {
  return handleSessionStatus(request);
}
