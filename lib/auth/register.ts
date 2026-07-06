import { ApiResponse } from "@/lib/api/response";
import { authMessages } from "@/lib/auth/messages";
import { sendEmailVerification } from "@/lib/auth/login";
import { hashPassword } from "@/lib/auth/password";
import { loadUserAuthData } from "@/lib/auth/guards";
import { serializeUser } from "@/lib/serializers/user";
import { User, type UserDocument } from "@/models";
import { NextResponse } from "next/server";

export type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
};

export async function registerUser(input: RegisterUserInput): Promise<{ user: UserDocument } | NextResponse> {
  const email = input.email.toLowerCase();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return ApiResponse.validation("Validation failed.", {
      email: ["The email has already been taken."],
    });
  }

  const user = await User.create({
    name: input.name.trim(),
    email,
    password: await hashPassword(input.password),
    emailVerifiedAt: null,
    roles: [],
  });

  try {
    await sendEmailVerification(user);
  } catch (error) {
    console.error(error);
    await User.deleteOne({ _id: user._id });
    return ApiResponse.error(authMessages.registrationUnableToSend, {}, 503);
  }

  return { user };
}

export async function buildRegisterResponse(user: UserDocument): Promise<NextResponse> {
  const authData = loadUserAuthData(user);

  return ApiResponse.success(
    serializeUser(user, {
      ...authData,
      includeHomeApiPath: false,
    }),
    authMessages.registrationSuccess,
    201
  );
}
