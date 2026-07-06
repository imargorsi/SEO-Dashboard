import { NextResponse } from "next/server";
import { emailVerificationHash, hasValidSignature } from "@/lib/auth/signed-url";
import { env } from "@/lib/config/env";
import { connectDb } from "@/lib/db/mongoose";
import { User } from "@/models";

type RouteContext = { params: Promise<{ id: string; hash: string }> };

function redirectTarget(): string {
  return `${env.frontendUrl().replace(/\/$/, "")}/?verified=1`;
}

export async function GET(request: Request, context: RouteContext): Promise<NextResponse> {
  const { id, hash } = await context.params;

  if (!hasValidSignature(request.url)) {
    return new NextResponse(null, { status: 403 });
  }

  await connectDb();
  const user = await User.findById(id);
  if (!user) {
    return new NextResponse(null, { status: 403 });
  }

  const expectedHash = emailVerificationHash(user.getEmailForVerification());
  if (hash !== expectedHash) {
    return new NextResponse(null, { status: 403 });
  }

  if (!user.hasVerifiedEmail()) {
    user.emailVerifiedAt = new Date();
    await user.save();
  }

  return NextResponse.redirect(redirectTarget(), 302);
}
