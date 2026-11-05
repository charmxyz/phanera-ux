import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut(); // revokes the session and clears auth cookies
  return NextResponse.redirect(new URL("/", request.nextUrl.origin), { status: 303 });
}
