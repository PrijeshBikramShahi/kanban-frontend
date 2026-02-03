'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import axios from '@/lib/axios';
import { getSocket } from '@/lib/socket';
import { useBoardStore } from '@/store/boardStore';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  list: {
    _id: string;
    name: string;
    tasks: any[];
    boardId: string;
  };
  onTaskClick: (task: any) => void;
}

export default function KanbanColumn({ list, onTaskClick }: KanbanColumnProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const { addTask } = useBoardStore();
  
  const { setNodeRef } = useDroppable({
    id: list._id,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: { title: string; listId: string }) => {
      const response = await axios.post('/tasks', {
        ...taskData,
        status: list.name,
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      addTask(data);
      setNewTaskTitle('');
      setIsAddingTask(false);

      // Emit socket event
      const socket = getSocket();
      if (socket) {
        socket.emit('task-created', {
          boardId: list.boardId,
          task: data,
        });
      }
    },
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      createTaskMutation.mutate({
        title: newTaskTitle,
        listId: list._id,
      });
    }
  };

  const taskIds = list.tasks?.map((task) => task._id) || [];

  return (
    <div className="flex flex-col w-80 flex-shrink-0 bg-dark-surface rounded-card p-4 h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-text-primary">{list.name}</h3>
          <span className="text-xs text-text-muted bg-dark-bg px-2 py-0.5 rounded-full">
            {list.tasks?.length || 0}
          </span>
        </div>
      </div>

      {/* Tasks Container */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto space-y-3 min-h-[200px]"
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {list.tasks && list.tasks.length > 0 ? (
            list.tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={() => onTaskClick(task)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-text-muted text-sm">
              No tasks yet
            </div>
          )}
        </SortableContext>
      </div>

      {/* Add Task Button/Form */}
      <div className="mt-4 pt-4 border-t border-dark-border">
        {isAddingTask ? (
          <form onSubmit={handleAddTask} className="space-y-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Enter task title..."
              autoFocus
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-button text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent text-sm"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createTaskMutation.isPending}
                className="flex-1 bg-accent-primary hover:bg-accent-hover text-white text-sm font-medium py-1.5 px-3 rounded-button transition-colors disabled:opacity-50"
              >
                {createTaskMutation.isPending ? 'Adding...' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskTitle('');
                }}
                className="flex-1 border border-dark-border text-text-secondary text-sm py-1.5 px-3 rounded-button hover:bg-dark-hover transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingTask(true)}
            className="w-full py-2 text-text-secondary hover:text-text-primary hover:bg-dark-hover rounded-button transition-colors flex items-center justify-center gap-2 text-sm"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Task
          </button>
        )}
      </div>
    </div>
  );
}
