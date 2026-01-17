'use client'

import Link from 'next/link'
import { formatEther } from 'viem'

interface RaffleCardProps {
    address: string
    creator: string
    ticketPrice: bigint
    maxTickets: bigint
    totalTicketsSold: bigint
    prizeAmount: bigint
    endTime: bigint
    state: number
}

export function RaffleCard({
    address,
    creator,
    ticketPrice,
    maxTickets,
    totalTicketsSold,
    prizeAmount,
    endTime,
    state
}: RaffleCardProps) {
    const progress = Number((totalTicketsSold * 100n) / maxTickets)
    const timeRemaining = Number(endTime) * 1000 - Date.now()
    const isActive = state === 0 && timeRemaining > 0

    const formatTimeRemaining = (ms: number) => {
        if (ms <= 0) return 'Ended'
        const days = Math.floor(ms / (1000 * 60 * 60 * 24))
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        if (days > 0) return `${days}d ${hours}h`
        if (hours > 0) return `${hours}h`
        return 'Less than 1h'
    }

    return (
        <Link href={`/raffle/${address}`}>
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-all hover:scale-105 border border-gray-700 hover:border-blue-500">
                {/* Prize Amount */}
                <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-1">Prize Pool</div>
                    <div className="text-3xl font-bold text-white">
                        {formatEther(prizeAmount)} ETH
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Tickets Sold</span>
                        <span className="text-white font-semibold">
                            {totalTicketsSold.toString()}/{maxTickets.toString()}
                        </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Ticket Price</span>
                        <span className="text-white">{formatEther(ticketPrice)} ETH</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Time Remaining</span>
                        <span className={isActive ? "text-green-400" : "text-red-400"}>
                            {formatTimeRemaining(timeRemaining)}
                        </span>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isActive
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                        {isActive ? 'Active' : 'Ended'}
                    </span>
                    <span className="text-sm text-gray-400">
                        {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                </div>
            </div>
        </Link>
    )
}
