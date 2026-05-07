import './globals.css'
import Providers from '@/components/Providers'

export const metadata = {
    title: 'Cosmic Shooter',
    description: 'Onchain arcade game on Base',
    other: {
        'base:app_id': '69fc5dc94a40e072f8ead7d2',
    },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}
