'use client';

import { useRouter } from 'next/navigation';

interface BoardCardProps {
  board: {
    _id: string;
    name: string;
    description: string;
    members: any[];
    lists: any[];
    createdAt: string;
  };
  onClick?: () => void;
}

export default function BoardCard({ board, onClick }: BoardCardProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const taskCount = board.lists?.reduce(
    (acc, list: any) => acc + (list.tasks?.length || 0),
    0
  ) || 0;

  return (
    <button
      onClick={onClick || (() => router.push(`/boards/${board._id}`))}
      className="bg-dark-surface rounded-card shadow-card hover:shadow-card-hover border border-dark-border p-6 transition-all hover:scale-[1.02] text-left group"
    >
      {/* Board Name */}
      <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-accent-primary transition-colors">
        {board.name}
      </h3>

      {/* Board Description */}
      {board.description && (
        <p className="text-sm text-text-secondary mb-4 line-clamp-2">
          {board.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-xs text-text-muted">
        <div className="flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span>{taskCount} tasks</span>
        </div>
        <div className="flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{formatDate(board.createdAt)}</span>
        </div>
      </div>

      {/* Members */}
      {board.members && board.members.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {board.members.slice(0, 3).map((member: any, index: number) => (
              <div
                key={member._id || index}
                className="w-6 h-6 rounded-full bg-accent-primary flex items-center justify-center text-white text-xs font-medium border-2 border-dark-surface"
                title={member.name}
              >
                {member.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            ))}
            {board.members.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-dark-hover flex items-center justify-center text-text-muted text-xs font-medium border-2 border-dark-surface">
                +{board.members.length - 3}
              </div>
            )}
          </div>
          <span className="text-xs text-text-muted">
            {board.members.length} {board.members.length === 1 ? 'member' : 'members'}
          </span>
        </div>
      )}
    </button>
  );
}
