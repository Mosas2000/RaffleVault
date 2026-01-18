import { Loading } from '../components/Loading'

export default function LoadingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center">
                <div className="text-4xl mb-4">🎟️</div>
                <Loading />
                <p className="text-gray-400 mt-4">Loading RaffleVault...</p>
            </div>
        </div>
    )
}
