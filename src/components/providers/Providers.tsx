"use client";

import { NextIntlClientProvider } from "next-intl";
import { QueryProvider } from "./QueryProvider";
import { AuthProvider } from "./AuthProvider";
import { Navbar } from "@/components/layout/Navbar";

interface Props {
  messages: Record<string, unknown>;
  locale: string;
  children: React.ReactNode;
}

export function Providers({ messages, locale, children }: Props) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <QueryProvider>
        <AuthProvider>
          <Navbar />
          <main className="md:pt-16 pb-20 md:pb-0 min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
