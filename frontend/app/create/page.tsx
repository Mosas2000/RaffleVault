'use client'

import { useState } from 'react'
import { Header } from '../../components/Header'
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { RaffleFactoryABI } from '../../config/abis/RaffleFactory'
import { RAFFLE_FACTORY_ADDRESS } from '../../config/contracts'
import { parseEther } from 'viem'
import { useRouter } from 'next/navigation'

export default function CreateRafflePage() {
    const router = useRouter()
    const { isConnected } = useAccount()

    const [formData, setFormData] = useState({
        ticketPrice: '',
        maxTickets: '',
        duration: '7', // days
        minimumTickets: '',
        prizeAmount: '',
    })

    const { writeContract, data: hash, isPending, error } = useWriteContract()

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isConnected) {
            alert('Please connect your wallet first')
            return
        }

        try {
            const durationInSeconds = BigInt(Number(formData.duration) * 24 * 60 * 60)

            writeContract({
                address: RAFFLE_FACTORY_ADDRESS,
                abi: RaffleFactoryABI,
                functionName: 'createRaffle',
                args: [
                    parseEther(formData.ticketPrice),
                    BigInt(formData.maxTickets),
                    durationInSeconds,
                    BigInt(formData.minimumTickets),
                ],
                value: parseEther(formData.prizeAmount),
            })
        } catch (err) {
            console.error('Error creating raffle:', err)
        }
    }

    if (isSuccess) {
        setTimeout(() => {
            router.push('/')
        }, 2000)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-4xl font-bold text-white mb-8">Create New Raffle</h1>

                    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-8 border border-gray-700 space-y-6">
                        {/* Prize Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Prize Amount (ETH) *
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                required
                                value={formData.prizeAmount}
                                onChange={(e) => setFormData({ ...formData, prizeAmount: e.target.value })}
                                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="1.0"
                            />
                            <p className="text-sm text-gray-400 mt-1">
                                The ETH amount that will be sent to the contract as the prize
                            </p>
                        </div>

                        {/* Ticket Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Ticket Price (ETH) *
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                required
                                value={formData.ticketPrice}
                                onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="0.01"
                            />
                        </div>

                        {/* Max Tickets */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Maximum Tickets *
                            </label>
                            <input
                                type="number"
                                min="2"
                                required
                                value={formData.maxTickets}
                                onChange={(e) => setFormData({ ...formData, maxTickets: e.target.value })}
                                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="100"
                            />
                            <p className="text-sm text-gray-400 mt-1">
                                Must be at least 2
                            </p>
                        </div>

                        {/* Minimum Tickets */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Minimum Tickets Required *
                            </label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={formData.minimumTickets}
                                onChange={(e) => setFormData({ ...formData, minimumTickets: e.target.value })}
                                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="10"
                            />
                            <p className="text-sm text-gray-400 mt-1">
                                Raffle will be cancelled if this many tickets aren't sold
                            </p>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Duration (Days) *
                            </label>
                            <select
                                required
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="1">1 Day</option>
                                <option value="3">3 Days</option>
                                <option value="7">7 Days</option>
                                <option value="14">14 Days</option>
                                <option value="30">30 Days</option>
                            </select>
                        </div>

                        {/* Summary */}
                        <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                            <h3 className="font-semibold text-white mb-2">Summary</h3>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Prize Pool:</span>
                                <span className="text-white">{formData.prizeAmount || '0'} ETH</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Potential Revenue:</span>
                                <span className="text-white">
                                    {(Number(formData.ticketPrice || 0) * Number(formData.maxTickets || 0)).toFixed(4)} ETH
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Platform Fee (2.5%):</span>
                                <span className="text-white">
                                    {((Number(formData.ticketPrice || 0) * Number(formData.maxTickets || 0)) * 0.025).toFixed(4)} ETH
                                </span>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500 text-red-400 rounded-lg p-4">
                                Error: {error.message}
                            </div>
                        )}

                        {/* Success Message */}
                        {isSuccess && (
                            <div className="bg-green-500/10 border border-green-500 text-green-400 rounded-lg p-4">
                                Raffle created successfully! Redirecting...
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isPending || isConfirming || !isConnected}
                            className={`w-full py-4 rounded-lg font-semibold transition-colors ${isPending || isConfirming || !isConnected
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            {!isConnected
                                ? 'Connect Wallet to Create'
                                : isPending
                                    ? 'Confirming Transaction...'
                                    : isConfirming
                                        ? 'Creating Raffle...'
                                        : 'Create Raffle'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    )
}
