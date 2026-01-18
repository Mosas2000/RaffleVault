'use client'

import { RaffleCard } from './RaffleCard'
import { useAllRaffles } from '../hooks/useRaffleData'
import { useReadContracts } from 'wagmi'
import { RaffleABI } from '../config/abis/Raffle'
import { LoadingGrid } from './Loading'
import { EmptyState } from './EmptyState'

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
        return <LoadingGrid count={6} />
    }

    if (!raffleAddresses || raffleAddresses.length === 0) {
        return (
            <EmptyState
                icon="🎟️"
                title="No raffles yet"
                description="Be the first to create a raffle!"
                actionText="Create Raffle"
                actionHref="/create"
            />
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
