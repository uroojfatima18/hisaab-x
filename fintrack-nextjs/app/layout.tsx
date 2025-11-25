import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import LogoOverlay from "@/components/layout/LogoOverlay";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "HissabX - Smart Finance Tracker",
    description: "Professional personal finance tracking application",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthProvider>
                    <SettingsProvider>
                        {/* <LogoOverlay /> */}
                        {children}
                    </SettingsProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
