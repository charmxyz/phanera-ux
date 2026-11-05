import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoginForm } from "@/components/auth/login-form";
import { getOptionalUser } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/auth/intents";
import { AntAvatar } from "@/components/ants/pixel-ant";

export const metadata: Metadata = { title: "Log in" };

const ERRORS: Record<string, string> = {
  link: "That sign-in link is invalid or has expired. Request a new one below.",
  config: "Authentication isn't configured. Add your Supabase environment variables.",
};

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <Logo className="mb-10" />
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <AntAvatar seed="login" size={40} className="mx-auto mb-2" />
          <CardTitle className="text-lg">Continue with email</CardTitle>
          <CardDescription>Enter your email and we&apos;ll send you a secure sign-in link.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Suspense fallback={<div className="h-36" />}>
            <LoginBody searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}

async function LoginBody({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const sp = await searchParams;
  const next = safeNextPath(typeof sp.next === "string" ? sp.next : undefined);
  if (await getOptionalUser()) redirect(next);
  const error = typeof sp.error === "string" ? ERRORS[sp.error] : undefined;

  return (
    <>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <LoginForm next={next} />
    </>
  );
}
