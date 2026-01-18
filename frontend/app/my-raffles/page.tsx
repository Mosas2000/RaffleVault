'use client'

import { useState } from 'react'
import { Header } from '../../components/Header'
import { useAccount, useReadContracts } from 'wagmi'
import { useRafflesByCreator } from '../../hooks/useRaffleData'
import { RaffleCard } from '../../components/RaffleCard'
import { RaffleABI } from '../../config/abis/Raffle'
import Link from 'next/link'

export default function MyRafflesPage() {
    const { address, isConnected } = useAccount()
    const [activeTab, setActiveTab] = useState<'created' | 'participated'>('created')

    const { data: createdRaffles, isLoading: isLoadingCreated } = useRafflesByCreator(
        address as `0x${string}`
    )

    // Fetch info for created raffles
    const createdContracts = (createdRaffles as `0x${string}`[] || []).map((raffleAddress) => ({
        address: raffleAddress,
        abi: RaffleABI,
        functionName: 'getRaffleInfo',
    }))

    const { data: createdRafflesData, isLoading: isLoadingCreatedData } = useReadContracts({
        contracts: createdContracts,
    })

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔒</div>
                        <h2 className="text-2xl font-bold text-white mb-4">
                            Connect Your Wallet
                        </h2>
                        <p className="text-gray-400 mb-8">
                            Connect your wallet to view your raffles
                        </p>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-white mb-8">My Raffles</h1>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-gray-700">
                    <button
                        onClick={() => setActiveTab('created')}
                        className={`pb-4 px-6 font-semibold transition-colors ${activeTab === 'created'
                                ? 'text-blue-400 border-b-2 border-blue-400'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Created by Me
                    </button>
                    <button
                        onClick={() => setActiveTab('participated')}
                        className={`pb-4 px-6 font-semibold transition-colors ${activeTab === 'participated'
                                ? 'text-blue-400 border-b-2 border-blue-400'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Participated
                    </button>
                </div>

                {/* Created Raffles Tab */}
                {activeTab === 'created' && (
                    <div>
                        {isLoadingCreated || isLoadingCreatedData ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="bg-gray-800 rounded-lg p-6 animate-pulse border border-gray-700"
                                    >
                                        <div className="h-8 bg-gray-700 rounded mb-4"></div>
                                        <div className="h-4 bg-gray-700 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-700 rounded mb-4"></div>
                                        <div className="h-2 bg-gray-700 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        ) : !createdRaffles || createdRaffles.length === 0 ? (
                            <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-lg">
                                <div className="text-6xl mb-4">🎟️</div>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    No Raffles Created Yet
                                </h3>
                                <p className="text-gray-400 mb-6">
                                    Create your first raffle to get started!
                                </p>
                                <Link
                                    href="/create"
                                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    Create Raffle
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {createdRaffles.map((raffleAddress, index) => {
                                    const raffleData = createdRafflesData?.[index]?.result
                                    if (!raffleData) return null

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
                                    ] = raffleData as [
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

                                    return (
                                        <RaffleCard
                                            key={raffleAddress as string}
                                            address={raffleAddress as string}
                                            creator={creator}
                                            ticketPrice={ticketPrice}
                                            maxTickets={maxTickets}
                                            totalTicketsSold={totalTicketsSold}
                                            prizeAmount={prizeAmount}
                                            endTime={endTime}
                                            state={state}
                                        />
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Participated Tab */}
                {activeTab === 'participated' && (
                    <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-lg">
                        <div className="text-6xl mb-4">🎫</div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            Participated Raffles
                        </h3>
                        <p className="text-gray-400 mb-6">
                            This feature will show raffles you've purchased tickets for
                        </p>
                        <p className="text-sm text-gray-500">
                            Coming soon...
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}
