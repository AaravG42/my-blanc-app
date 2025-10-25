import { NextRequest, NextResponse } from "next/server";
import { sessionStore } from "~~/lib/sessionStore";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, creator } = await request.json();

    sessionStore.createSession(sessionId, creator);

    return NextResponse.json({ success: true, sessionId });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  const session = sessionStore.getSession(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(session);
}
