export function Loading() {
    return (
        <div className="flex items-center justify-center py-12">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        </div>
    )
}

export function LoadingCard() {
    return (
        <div className="bg-gray-800 rounded-lg p-6 animate-pulse border border-gray-700">
            <div className="h-8 bg-gray-700 rounded mb-4 w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded mb-2 w-full"></div>
            <div className="h-4 bg-gray-700 rounded mb-4 w-5/6"></div>
            <div className="h-2 bg-gray-700 rounded w-full"></div>
            <div className="mt-4 flex justify-between">
                <div className="h-6 bg-gray-700 rounded w-24"></div>
                <div className="h-6 bg-gray-700 rounded w-20"></div>
            </div>
        </div>
    )
}

export function LoadingGrid({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <LoadingCard key={i} />
            ))}
        </div>
    )
}
