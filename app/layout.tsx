import { Inter } from "next/font/google";
import Provider from "./provider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

/**
 * RootLayout component
 *
 * This component serves as the root layout for the application.
 * It includes the HTML structure and applies the Inter font.
 *
 * @param {Object} props - The properties object.
 * @param {React.ReactNode} props.children - The child components to be rendered within the layout.
 * @returns {JSX.Element} The rendered root layout component.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={inter.className} suppressHydrationWarning>
      <head />
      <body>
        {/* クライアント専用の Provider でラップ */}
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
