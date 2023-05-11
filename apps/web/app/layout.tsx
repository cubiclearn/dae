"use client";

import "react-toastify/dist/ReactToastify.css";
import "@rainbow-me/rainbowkit/styles.css";

import AppProviders from "./providers";
import { useIsMounted } from "@dae/hooks";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const isMounted = useIsMounted();

    if (!isMounted) {
        return (
            <html lang="en">
                <head></head>
                <body></body>
            </html>
        );
    }

    return (
        <html lang="en">
            <head></head>
            <body>
                <AppProviders>{children}</AppProviders>
            </body>
        </html>
    );
}
