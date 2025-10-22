"use server";

import type { AuthenticateUserResponse } from "@inverted-tech/fragments/protos/Authentication/UserInterface_pb";
import { cookies } from "next/headers";

export type LoginPayload = {
  UserName: string;
  Password: string;
};

export type LoginResult =
  | {
      ok: true;
      data: AuthenticateUserResponse;
      tokenSet: boolean;
    }
  | {
      ok: false;
      status?: number;
      statusText?: string;
      error?: string;
      data?: Partial<AuthenticateUserResponse> | unknown;
    };

export async function loginAction(payload: LoginPayload): Promise<LoginResult> {
  const url = process.env.AUTH_LOGIN_URL || "http://localhost:8001/api/auth/login";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // Avoid caching auth requests
      cache: "no-store",
      // Send cookies to same-origin backends if applicable
      credentials: "include",
    });

    let data: Partial<AuthenticateUserResponse> | unknown = null;
    try {
      data = await res.json();
    } catch {
      // ignore json parse errors
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        statusText: res.statusText,
        data,
        error: typeof (data as any)?.message === "string" ? (data as any).message : undefined,
      };
    }

    // Handle app-level failure responses (HTTP 200 but ok: false)
    if (typeof (data as any)?.ok === "boolean" && (data as any).ok === false) {
      return {
        ok: false,
        status: res.status,
        statusText: res.statusText,
        data,
        error: typeof (data as any)?.message === "string" ? (data as any).message : "Authentication failed",
      };
    }

    // If backend returns a BearerToken, persist it as a cookie.
    const bearer = (data as any)?.BearerToken as string | undefined;
    if (bearer) {
      await (await cookies()).set("token", bearer, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return { ok: true, data: (data ?? {}) as AuthenticateUserResponse, tokenSet: Boolean(bearer) };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Network error" };
  }
}
