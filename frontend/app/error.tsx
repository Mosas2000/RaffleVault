'use client'

import { useEffect } from 'react'
import { Header } from '../components/Header'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Error:', error)
    }, [error])

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto text-center py-20">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Something Went Wrong
                    </h1>
                    <p className="text-xl text-gray-400 mb-2">
                        An unexpected error occurred
                    </p>
                    {error.message && (
                        <p className="text-sm text-gray-500 mb-8 font-mono bg-gray-800 p-4 rounded-lg border border-gray-700">
                            {error.message}
                        </p>
                    )}
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={reset}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Try Again
                        </button>
                        <a
                            href="/"
                            className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
                        >
                            Go Home
                        </a>
                    </div>
                </div>
            </main>
        </div>
    )
}
