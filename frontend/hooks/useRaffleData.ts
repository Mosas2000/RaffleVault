import { useReadContract, useReadContracts } from 'wagmi'
import { RaffleABI } from '../config/abis/Raffle'
import { RaffleFactoryABI } from '../config/abis/RaffleFactory'
import { RAFFLE_FACTORY_ADDRESS } from '../config/contracts'

export function useAllRaffles() {
    return useReadContract({
        address: RAFFLE_FACTORY_ADDRESS,
        abi: RaffleFactoryABI,
        functionName: 'getAllRaffles',
    })
}

export function useRaffleInfo(raffleAddress: `0x${string}`) {
    return useReadContract({
        address: raffleAddress,
        abi: RaffleABI,
        functionName: 'getRaffleInfo',
    })
}

export function useTotalRaffles() {
    return useReadContract({
        address: RAFFLE_FACTORY_ADDRESS,
        abi: RaffleFactoryABI,
        functionName: 'getTotalRaffles',
    })
}

export function useRafflesByCreator(creator: `0x${string}`) {
    return useReadContract({
        address: RAFFLE_FACTORY_ADDRESS,
        abi: RaffleFactoryABI,
        functionName: 'getRafflesByCreator',
        args: [creator],
    })
}

export function useRaffleParticipants(raffleAddress: `0x${string}`) {
    return useReadContract({
        address: raffleAddress,
        abi: RaffleABI,
        functionName: 'getParticipants',
    })
}

export function useUserTicketCount(raffleAddress: `0x${string}`, user: `0x${string}`) {
    return useReadContract({
        address: raffleAddress,
        abi: RaffleABI,
        functionName: 'getTicketCount',
        args: [user],
    })
}
