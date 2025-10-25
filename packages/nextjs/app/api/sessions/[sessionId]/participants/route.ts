import { NextRequest, NextResponse } from "next/server";
import { sessionStore } from "~~/lib/sessionStore";

export async function POST(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { participant } = await request.json();
    const { sessionId } = await params;

    const success = sessionStore.addParticipant(sessionId, participant);

    if (!success) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const session = sessionStore.getSession(sessionId);
    return NextResponse.json({ success: true, participants: session?.participants || [] });
  } catch (error) {
    console.error("Error adding participant:", error);
    return NextResponse.json({ error: "Failed to add participant" }, { status: 500 });
  }
}
