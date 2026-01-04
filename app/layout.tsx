import type { Metadata } from "next";
import primaryFont from './fonts';
import './global.css'

export const metadata: Metadata = {
	title: "Apex",
	description: "Your Personal AI Voice Assistant",
	icons: {
		icon: [
			{ url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
			{ url: '/favicon.svg', type: 'image/svg+xml' },
		],
		shortcut: '/favicon.ico',
		apple: '/apple-touch-icon.png',
	},
	manifest: '/site.webmanifest',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${primaryFont.className}`} suppressHydrationWarning>
				{children}
			</body>
		</html>
	);
}
