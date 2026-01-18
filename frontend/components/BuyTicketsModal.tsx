'use client'

import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { RaffleABI } from '../config/abis/Raffle'
import { parseEther, formatEther } from 'viem'

interface BuyTicketsModalProps {
    raffleAddress: `0x${string}`
    ticketPrice: bigint
    maxTickets: bigint
    totalTicketsSold: bigint
    onClose: () => void
    onSuccess: () => void
}

export function BuyTicketsModal({
    raffleAddress,
    ticketPrice,
    maxTickets,
    totalTicketsSold,
    onClose,
    onSuccess,
}: BuyTicketsModalProps) {
    const [ticketAmount, setTicketAmount] = useState(1)

    const { writeContract, data: hash, isPending, error } = useWriteContract()

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    })

    const availableTickets = Number(maxTickets - totalTicketsSold)
    const totalCost = ticketPrice * BigInt(ticketAmount)

    const handleBuyTickets = () => {
        writeContract({
            address: raffleAddress,
            abi: RaffleABI,
            functionName: 'buyTickets',
            args: [BigInt(ticketAmount)],
            value: totalCost,
        })
    }

    if (isSuccess) {
        setTimeout(() => {
            onSuccess()
            onClose()
        }, 2000)
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 border border-gray-700">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Buy Tickets</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {/* Ticket Amount Input */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Number of Tickets
                        </label>
                        <input
                            type="number"
                            min="1"
                            max={availableTickets}
                            value={ticketAmount}
                            onChange={(e) => setTicketAmount(Math.min(Number(e.target.value), availableTickets))}
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <p className="text-sm text-gray-400 mt-1">
                            Available: {availableTickets} tickets
                        </p>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Price per ticket:</span>
                            <span className="text-white">{formatEther(ticketPrice)} ETH</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Quantity:</span>
                            <span className="text-white">{ticketAmount}</span>
                        </div>
                        <div className="h-px bg-gray-600 my-2"></div>
                        <div className="flex justify-between">
                            <span className="text-white font-semibold">Total:</span>
                            <span className="text-white font-bold text-lg">
                                {formatEther(totalCost)} ETH
                            </span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500 text-red-400 rounded-lg p-3 text-sm">
                            {error.message}
                        </div>
                    )}

                    {/* Success Message */}
                    {isSuccess && (
                        <div className="bg-green-500/10 border border-green-500 text-green-400 rounded-lg p-3 text-sm">
                            Tickets purchased successfully!
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleBuyTickets}
                            disabled={isPending || isConfirming || ticketAmount < 1}
                            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${isPending || isConfirming || ticketAmount < 1
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            {isPending
                                ? 'Confirming...'
                                : isConfirming
                                    ? 'Buying...'
                                    : 'Buy Tickets'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
