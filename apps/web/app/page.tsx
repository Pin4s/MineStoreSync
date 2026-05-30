import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME } from "@/lib/auth";

export default async function RootPage() {
  const cookieStore = await cookies();

  if (cookieStore.get(AUTH_COOKIE_NAME)?.value) {
    redirect("/dashboard");
  }

  redirect("/cadastrar");
}
