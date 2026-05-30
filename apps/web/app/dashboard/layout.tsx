import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME } from "@/lib/auth";

type DashboardLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!authToken) {
    redirect("/login?session=missing");
  }

  return children;
}
