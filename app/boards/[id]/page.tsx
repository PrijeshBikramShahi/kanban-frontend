'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import axios from '@/lib/axios';
import { useBoardStore } from '@/store/boardStore';
import { initializeSocket, getSocket, disconnectSocket } from '@/lib/socket';
import Navbar from '@/components/Navbar';
import KanbanColumn from '@/components/KanbanColumn';
import TaskModal from '@/components/TaskModal';
import TaskCard from '@/components/TaskCard';

export default function BoardPage() {
  const router = useRouter();
  const params = useParams();
  const boardId = params.id as string;
  
  const { setBoard, clearBoard, addTask, updateTask, deleteTask, moveTask, lists } = useBoardStore();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<any>(null);
  const [isAddingList, setIsAddingList] = useState(false); 
  const [newListName, setNewListName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch board data
  const { data: board, isLoading } = useQuery({
    queryKey: ['board', boardId],
    queryFn: async () => {
      const response = await axios.get(`/boards/${boardId}`);
      return response.data.data;
    },
    enabled: !!boardId,
  });

  // Move task mutation
  const moveTaskMutation = useMutation({
    mutationFn: async ({ taskId, targetListId }: { taskId: string; targetListId: string }) => {
      const response = await axios.put(`/tasks/${taskId}`, { listId: targetListId });
      return response.data.data;
    },
  });

  // Create list mutation
  const createListMutation = useMutation({
    mutationFn: async (listData: { name: string; boardId: string }) => {
      const response = await axios.post('/lists', listData);
      return response.data.data;
    },
    onSuccess: (newList) => {
      // Update board store to include the new list
      if (board) {
        setBoard({
          ...board,
          lists: [...board.lists, newList],
        });
      }
      
      // Reset form
      setNewListName('');
      setIsAddingList(false);

      // Emit socket event
      const socket = getSocket();
      if (socket) {
        socket.emit('list-created', {
          boardId,
          list: newList,
        });
      }
    },
  });

  const handleAddList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      createListMutation.mutate({
        name: newListName.trim(),
        boardId,
      });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = lists.flatMap(list => list.tasks).find(t => t._id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const targetListId = over.id as string;

    // Find source list
    const sourceList = lists.find(list => 
      list.tasks.some(task => task._id === taskId)
    );

    if (!sourceList || sourceList._id === targetListId) return;

    // Update local state immediately
    moveTask(taskId, sourceList._id, targetListId);

    // Update on server
    moveTaskMutation.mutate({ taskId, targetListId });

    // Emit socket event
    const socket = getSocket();
    if (socket) {
      socket.emit('task-moved', {
        boardId,
        taskId,
        sourceListId: sourceList._id,
        targetListId,
        task: { listId: targetListId },
      });
    }
  };

  // Initialize board in store and Socket.IO
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    if (board) {
      setBoard(board);

      // Initialize socket
      const socket = initializeSocket(token);
      socket.emit('join-board', boardId);

      // Socket event listeners
      socket.on('task-created', (task) => {
        addTask(task);
      });

      socket.on('task-updated', (task) => {
        updateTask(task._id, task);
      });

      socket.on('task-moved', ({ taskId, sourceListId, targetListId, task }) => {
        moveTask(taskId, sourceListId, targetListId);
        updateTask(taskId, task);
      });

      socket.on('task-deleted', ({ taskId }) => {
        deleteTask(taskId);
      });

      return () => {
        socket.emit('leave-board', boardId);
        socket.off('task-created');
        socket.off('task-updated');
        socket.off('task-moved');
        socket.off('task-deleted');
      };
    }
  }, [board, boardId, setBoard, addTask, updateTask, deleteTask, moveTask, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearBoard();
      disconnectSocket();
    };
  }, [clearBoard]);

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-text-secondary">Loading board...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <p className="text-text-primary text-xl">Board not found</p>
            <button
              onClick={() => router.push('/boards')}
              className="mt-4 text-accent-primary hover:text-accent-light"
            >
              Go back to boards
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Navbar />
      
      {/* Board Header */}
      <div className="border-b border-dark-border bg-dark-surface">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {board.name}
              </h1>
              {board.description && (
                <p className="mt-1 text-sm text-text-secondary">
                  {board.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {board.members && board.members.length > 0 && (
                <div className="flex -space-x-2">
                  {board.members.slice(0, 3).map((member: any, index: number) => (
                    <div
                      key={member._id || index}
                      className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center text-white text-sm font-medium border-2 border-dark-surface"
                      title={member.name}
                    >
                      {member.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  ))}
                  {board.members.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-dark-hover flex items-center justify-center text-text-muted text-xs font-medium border-2 border-dark-surface">
                      +{board.members.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="min-w-max h-full px-4 sm:px-6 lg:px-8 py-6">
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-6 h-full">
              {board.lists && board.lists.length > 0 ? (
                board.lists.map((list: any) => (
                  <KanbanColumn
                    key={list._id}
                    list={list}
                    onTaskClick={handleTaskClick}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center w-full">
                  <p className="text-text-secondary">No lists found</p>
                </div>
              )}
              
              {/* Add List Column */}
              <div className="flex flex-col w-80 flex-shrink-0">
                {isAddingList ? (
                  <div className="bg-dark-surface rounded-card p-4 h-full">
                    <form onSubmit={handleAddList} className="space-y-3">
                      <h3 className="font-semibold text-text-primary mb-2">Add New List</h3>
                      <input
                        type="text"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        placeholder="Enter list name..."
                        autoFocus
                        className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-button text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={createListMutation.isPending}
                          className="flex-1 bg-accent-primary hover:bg-accent-hover text-white font-medium py-2 px-4 rounded-button transition-colors disabled:opacity-50"
                        >
                          {createListMutation.isPending ? 'Creating...' : 'Create List'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingList(false);
                            setNewListName('');
                          }}
                          className="flex-1 border border-dark-border text-text-secondary py-2 px-4 rounded-button hover:bg-dark-hover transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingList(true)}
                    className="bg-dark-surface hover:bg-dark-hover border-2 border-dashed border-dark-border rounded-card p-4 h-full transition-colors flex items-center justify-center text-text-secondary hover:text-text-primary"
                  >
                    <div className="text-center">
                      <svg
                        className="w-8 h-8 mx-auto mb-2 text-text-muted"
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
                      <span className="text-sm font-medium">Add List</span>
                    </div>
                  </button>
                )}
              </div>
            </div>
            <DragOverlay>
              {activeTask ? (
                <div className="rotate-3">
                  <TaskCard task={activeTask} onClick={() => {}} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Task Modal */}
      {isTaskModalOpen && selectedTask && (
        <TaskModal task={selectedTask} onClose={handleCloseModal} />
      )}
    </div>
  );
}
