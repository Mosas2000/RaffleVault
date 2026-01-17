'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'

export function Header() {
    return (
        <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="text-2xl">🎟️</div>
                        <span className="text-xl font-bold text-white">RaffleVault</span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/"
                            className="text-gray-300 hover:text-white transition-colors"
                        >
                            Raffles
                        </Link>
                        <Link
                            href="/create"
                            className="text-gray-300 hover:text-white transition-colors"
                        >
                            Create Raffle
                        </Link>
                        <Link
                            href="/my-raffles"
                            className="text-gray-300 hover:text-white transition-colors"
                        >
                            My Raffles
                        </Link>
                    </nav>

                    {/* Wallet Connection */}
                    <div className="flex items-center space-x-4">
                        <ConnectButton
                            showBalance={false}
                            chainStatus="icon"
                        />
                    </div>
                </div>
            </div>
        </header>
    )
}
