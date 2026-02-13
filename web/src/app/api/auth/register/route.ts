import { NextRequest, NextResponse } from "next/server";

import { backendRequest, cloneJsonOrText } from "@/lib/api/backend-client";

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid register payload" }, { status: 400 });
  }

  const backendResponse = await backendRequest({
    path: "auth/register",
    method: "POST",
    body
  });
  const payload = await cloneJsonOrText(backendResponse);

  if (typeof payload === "string") {
    return new NextResponse(payload, {
      status: backendResponse.status,
      headers: { "content-type": "text/plain" }
    });
  }

  return NextResponse.json(payload, { status: backendResponse.status });
}
