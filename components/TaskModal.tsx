'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { getSocket } from '@/lib/socket';
import { useBoardStore } from '@/store/boardStore';

interface TaskModalProps {
  task: {
    _id: string;
    title: string;
    description: string;
    listId: string;
    assignees: any[];
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  onClose: () => void;
}

export default function TaskModal({ task, onClose }: TaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [isEditing, setIsEditing] = useState(false);
  const { updateTask, deleteTask, currentBoard } = useBoardStore();

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (updates: { title?: string; description?: string }) => {
      const response = await axios.put(`/tasks/${task._id}`, updates);
      return response.data.data;
    },
    onSuccess: (data) => {
      updateTask(task._id, data);
      setIsEditing(false);

      // Emit socket event
      const socket = getSocket();
      if (socket && currentBoard) {
        socket.emit('task-updated', {
          boardId: currentBoard._id,
          task: data,
        });
      }
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      await axios.delete(`/tasks/${task._id}`);
    },
    onSuccess: () => {
      deleteTask(task._id);
      onClose();

      // Emit socket event
      const socket = getSocket();
      if (socket && currentBoard) {
        socket.emit('task-deleted', {
          boardId: currentBoard._id,
          taskId: task._id,
          listId: task.listId,
        });
      }
    },
  });

  const handleSave = () => {
    if (title.trim()) {
      updateTaskMutation.mutate({
        title: title.trim(),
        description: description.trim(),
      });
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-surface rounded-card shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Header */}
        <div className="sticky top-0 bg-dark-surface border-b border-dark-border p-6 flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-2xl font-bold bg-dark-bg border border-dark-border rounded-button px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                autoFocus
              />
            ) : (
              <h2 className="text-2xl font-bold text-text-primary">{task.title}</h2>
            )}
            <div className="flex items-center gap-2 mt-2 text-sm text-text-muted">
              <span>in {task.status}</span>
              <span>•</span>
              <span>Created {formatDate(task.createdAt)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-dark-hover rounded-button transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-text-secondary">
                Description
              </label>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-accent-primary hover:text-accent-light"
                >
                  Edit
                </button>
              )}
            </div>
            {isEditing ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-button text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary resize-none"
                placeholder="Add a description..."
              />
            ) : (
              <div className="text-text-secondary min-h-[100px] p-4 bg-dark-bg rounded-button whitespace-pre-wrap">
                {task.description || 'No description yet.'}
              </div>
            )}
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Assignees
            </label>
            {task.assignees && task.assignees.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {task.assignees.map((assignee: any) => (
                  <div
                    key={assignee._id}
                    className="flex items-center gap-2 bg-dark-bg px-3 py-2 rounded-button"
                  >
                    <div className="w-6 h-6 rounded-full bg-accent-primary flex items-center justify-center text-white text-xs font-medium">
                      {assignee.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm text-text-primary">{assignee.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-muted text-sm">No assignees yet</p>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dark-border">
            <div>
              <label className="block text-xs text-text-muted mb-1">Created</label>
              <p className="text-sm text-text-primary">{formatDate(task.createdAt)}</p>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Last Updated</label>
              <p className="text-sm text-text-primary">{formatDate(task.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-dark-surface border-t border-dark-border p-6 flex items-center justify-between">
          <button
            onClick={handleDelete}
            disabled={deleteTaskMutation.isPending}
            className="text-error hover:bg-error/10 px-4 py-2 rounded-button transition-colors disabled:opacity-50 flex items-center gap-2"
          >
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            {deleteTaskMutation.isPending ? 'Deleting...' : 'Delete Task'}
          </button>

          <div className="flex gap-3">
            {isEditing && (
              <>
                <button
                  onClick={() => {
                    setTitle(task.title);
                    setDescription(task.description);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 border border-dark-border text-text-secondary rounded-button hover:bg-dark-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateTaskMutation.isPending}
                  className="bg-accent-primary hover:bg-accent-hover text-white font-medium py-2 px-6 rounded-button transition-colors disabled:opacity-50"
                >
                  {updateTaskMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
            {!isEditing && (
              <button
                onClick={onClose}
                className="px-6 py-2 border border-dark-border text-text-secondary rounded-button hover:bg-dark-hover transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
