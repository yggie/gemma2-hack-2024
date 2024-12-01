import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Suspense } from "react";
import { WebLLMProvider } from "@/features/webllm/WebLLMProvider";
import { NotificationsProvider } from "@/features/notifications/NotificationsProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "PoMAIA (Podcast Marketing AI Assistant)",
  description:
    "PoMAIA is your podcast marketing AI assistant. Drop your podcast transcript and watch it generate content automatically",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NotificationsProvider>
          <Suspense fallback={<>Loading...</>}>
            <main className="h-screen w-screen p-8">
              <div className="mx-auto max-w-xl mt-24 mb-16">
                <h1 className="text-7xl text-center bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                  PoMAIA
                </h1>

                <p className="text-lg mt-8">
                  <span className="text-primary font-bold">PoMAIA</span> is your
                  premiere content marketing assistant. Simply share your
                  content with{" "}
                  <span className="text-primary font-bold">PoMAIA</span> and let
                  it work it&apos; magic. Focus on the things that matter, leave
                  the drudgery to{" "}
                  <span className="text-primary font-bold">PoMAIA</span>
                </p>
              </div>

              <WebLLMProvider>{children}</WebLLMProvider>
            </main>
          </Suspense>
        </NotificationsProvider>
      </body>
    </html>
  );
}
