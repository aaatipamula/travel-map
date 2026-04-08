import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Navbar from "@/components/nav/Navbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Navbar />
      <main className="flex flex-1 flex-col min-h-0">{children}</main>
    </div>
  );
}
