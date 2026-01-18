import { Header } from '../components/Header'
import { RaffleGrid } from '../components/RaffleGrid'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center py-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to RaffleVault
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Decentralized raffles on Base - Transparent, Fair, Trustless
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="#raffles"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse Raffles
            </Link>
            <Link
              href="/create"
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Create Raffle
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div className="text-4xl mb-2">🎟️</div>
            <div className="text-2xl font-bold text-white mb-1">100%</div>
            <div className="text-gray-400">Transparent</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div className="text-4xl mb-2">⛓️</div>
            <div className="text-2xl font-bold text-white mb-1">On-Chain</div>
            <div className="text-gray-400">Verifiable</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div className="text-4xl mb-2">🔒</div>
            <div className="text-2xl font-bold text-white mb-1">Secure</div>
            <div className="text-gray-400">Trustless</div>
          </div>
        </div>

        {/* Raffles Grid */}
        <div id="raffles" className="mt-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">Active Raffles</h2>
            <Link
              href="/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              + Create Raffle
            </Link>
          </div>
          <RaffleGrid />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>RaffleVault - Built on Base</p>
        </div>
      </footer>
    </div>
  )
}
