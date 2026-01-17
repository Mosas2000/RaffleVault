import { Header } from '@/components/Header'

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
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Browse Raffles
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Create Raffle
            </button>
          </div>
        </div>

        {/* Raffles Grid Placeholder */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white mb-8">Active Raffles</h2>
          <div className="text-center text-gray-400 py-16 border-2 border-dashed border-gray-700 rounded-lg">
            Raffle list coming soon...
          </div>
        </div>
      </main>
    </div>
  )
}
