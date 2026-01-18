import Link from 'next/link'

interface EmptyStateProps {
    icon?: string
    title: string
    description: string
    actionText?: string
    actionHref?: string
}

export function EmptyState({
    icon = '🎟️',
    title,
    description,
    actionText,
    actionHref,
}: EmptyStateProps) {
    return (
        <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-lg">
            <div className="text-6xl mb-4">{icon}</div>
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-gray-400 mb-6">{description}</p>
            {actionText && actionHref && (
                <Link
                    href={actionHref}
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                    {actionText}
                </Link>
            )}
        </div>
    )
}
