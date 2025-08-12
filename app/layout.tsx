import type { Metadata } from "next";
import primaryFont from './fonts';

export const metadata: Metadata = {
	title: "Apex",
	description: "Your Personal AI Voice Assistant",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${primaryFont.className}`}>
				{children}
			</body>
		</html>
	);
}
