'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
  task: {
    _id: string;
    title: string;
    description: string;
    assignees: any[];
    createdAt: string;
  };
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-dark-bg border border-dark-border rounded-button p-4 hover:border-accent-primary transition-all cursor-pointer group"
    >
      {/* Task Title */}
      <h4 className="font-medium text-text-primary mb-2 group-hover:text-accent-primary transition-colors">
        {task.title}
      </h4>

      {/* Task Description (if exists) */}
      {task.description && (
        <p className="text-sm text-text-secondary mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Footer - Assignees and Date */}
      <div className="flex items-center justify-between mt-3">
        {/* Assignees */}
        {task.assignees && task.assignees.length > 0 ? (
          <div className="flex -space-x-2">
            {task.assignees.slice(0, 3).map((assignee: any, index: number) => (
              <div
                key={assignee._id || index}
                className="w-6 h-6 rounded-full bg-accent-primary flex items-center justify-center text-white text-xs font-medium border-2 border-dark-bg"
                title={assignee.name}
              >
                {assignee.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            ))}
            {task.assignees.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-dark-hover flex items-center justify-center text-text-muted text-xs font-medium border-2 border-dark-bg">
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
        ) : (
          <div /> 
        )}

        {/* Date */}
        <div className="flex items-center gap-1 text-xs text-text-muted">
          <svg
            className="w-3 h-3"
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
          <span>{formatDate(task.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
