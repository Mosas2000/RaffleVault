'use client'

import { RaffleCard } from './RaffleCard'
import { useAllRaffles } from '../hooks/useRaffleData'
import { useReadContracts } from 'wagmi'
import { RaffleABI } from '../config/abis/Raffle'

export function RaffleGrid() {
    const { data: raffleAddresses, isLoading } = useAllRaffles()

    // Fetch info for all raffles
    const raffleContracts = (raffleAddresses as `0x${string}`[] || []).map((address) => ({
        address,
        abi: RaffleABI,
        functionName: 'getRaffleInfo',
    }))

    const { data: rafflesData, isLoading: isLoadingData } = useReadContracts({
        contracts: raffleContracts,
    })

    if (isLoading || isLoadingData) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
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
        )
    }

    if (!raffleAddresses || raffleAddresses.length === 0) {
        return (
            <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-lg">
                <div className="text-6xl mb-4">🎟️</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                    No raffles yet
                </h3>
                <p className="text-gray-400 mb-6">
                    Be the first to create a raffle!
                </p>
                <a
                    href="/create"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                    Create Raffle
                </a>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {raffleAddresses.map((address, index) => {
                const raffleData = rafflesData?.[index]?.result
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
                        key={address as string}
                        address={address as string}
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
    )
}
