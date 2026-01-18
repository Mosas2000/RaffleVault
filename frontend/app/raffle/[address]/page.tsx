'use client'

import { useParams } from 'next/navigation'
import { Header } from '../../../components/Header'
import { useRaffleInfo, useRaffleParticipants } from '../../../hooks/useRaffleData'
import { formatEther } from 'viem'
import { useAccount } from 'wagmi'
import Link from 'next/link'

export default function RafflePage() {
    const params = useParams()
    const address = params.address as `0x${string}`
    const { address: userAddress } = useAccount()

    const { data: raffleInfo, isLoading } = useRaffleInfo(address)
    const { data: participants } = useRaffleParticipants(address)

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-12 bg-gray-700 rounded mb-4"></div>
                        <div className="h-64 bg-gray-700 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!raffleInfo) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <Header />
                <div className="container mx-auto px-4 py-8 text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Raffle Not Found</h1>
                    <Link href="/" className="text-blue-400 hover:text-blue-300">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        )
    }

    const [
        creator,
        ticketPrice,
        maxTickets,
        endTime,
        prizeAmount,
        minimumTickets,
        totalTicketsSold,
        state,
        winner,
    ] = raffleInfo as [
        `0x${string}`,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        number,
        `0x${string}`
    ]

    const progress = Number((totalTicketsSold * 100n) / maxTickets)
    const timeRemaining = Number(endTime) * 1000 - Date.now()
    const isActive = state === 0 && timeRemaining > 0

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <Header />

            <main className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <Link href="/" className="text-blue-400 hover:text-blue-300 mb-6 inline-block">
                    ← Back to Raffles
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Prize Pool */}
                        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
                            <h1 className="text-4xl font-bold text-white mb-4">
                                {formatEther(prizeAmount)} ETH Prize
                            </h1>
                            <p className="text-gray-400">
                                Raffle Address: {address}
                            </p>
                        </div>

                        {/* Progress */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h2 className="text-xl font-bold text-white mb-4">Ticket Sales</h2>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Progress</span>
                                <span className="text-white font-semibold">
                                    {totalTicketsSold.toString()}/{maxTickets.toString()} tickets
                                </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                                <div
                                    className="bg-blue-500 h-3 rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="text-center text-2xl font-bold text-white">
                                {progress.toFixed(1)}% Sold
                            </div>
                        </div>

                        {/* Participants */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h2 className="text-xl font-bold text-white mb-4">
                                Participants ({participants?.length || 0})
                            </h2>
                            <div className="max-h-64 overflow-y-auto space-y-2">
                                {participants && participants.length > 0 ? (
                                    participants.map((participant, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center p-3 bg-gray-700/50 rounded"
                                        >
                                            <span className="text-gray-300 font-mono text-sm">
                                                {participant}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-center py-4">
                                        No participants yet
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Buy Tickets */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h2 className="text-xl font-bold text-white mb-4">Buy Tickets</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400">Ticket Price</label>
                                    <div className="text-2xl font-bold text-white">
                                        {formatEther(ticketPrice)} ETH
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400">Number of Tickets</label>
                                    <input
                                        type="number"
                                        min="1"
                                        defaultValue="1"
                                        className="w-full bg-gray-700 text-white rounded px-4 py-2 mt-1"
                                    />
                                </div>
                                <button
                                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${isActive
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                        }`}
                                    disabled={!isActive}
                                >
                                    {isActive ? 'Buy Tickets' : 'Raffle Ended'}
                                </button>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h2 className="text-xl font-bold text-white mb-4">Details</h2>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-sm text-gray-400">Creator</div>
                                    <div className="text-white font-mono text-sm">
                                        {creator.slice(0, 6)}...{creator.slice(-4)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400">Status</div>
                                    <div className={`font-semibold ${isActive ? 'text-green-400' : 'text-red-400'}`}>
                                        {isActive ? 'Active' : 'Ended'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400">Minimum Tickets</div>
                                    <div className="text-white">{minimumTickets.toString()}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400">Ends At</div>
                                    <div className="text-white">
                                        {new Date(Number(endTime) * 1000).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
