import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "AI routes are available in Phase 6. Configure ANTHROPIC_API_KEY." },
    { status: 501 }
  );
}
