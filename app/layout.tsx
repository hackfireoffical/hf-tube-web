import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "HF Tube",
  description: "A clean, community-powered video experience.",
  applicationName: "HF Tube",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "HF Tube" }
};
export const viewport: Viewport = { themeColor: "#0f0f0f", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}