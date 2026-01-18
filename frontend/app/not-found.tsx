import Link from 'next/link'
import { Header } from '../components/Header'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="text-center py-20">
                    <div className="text-9xl font-bold text-gray-700 mb-4">404</div>
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Page Not Found
                    </h1>
                    <p className="text-xl text-gray-400 mb-8">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link
                            href="/"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Go Home
                        </Link>
                        <Link
                            href="/create"
                            className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Create Raffle
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}
