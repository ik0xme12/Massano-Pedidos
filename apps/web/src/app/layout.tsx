import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/contexts/auth-context";
import { ServiceWorkerInitializer } from "@/components/service-worker-initializer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Massano Cafetería",
  description: "Pedí tus favoritos de Massano Cafetería",
  icons: { icon: "/massano.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-background text-foreground">
        <ServiceWorkerInitializer />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
