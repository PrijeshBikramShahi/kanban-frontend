'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from '@/lib/axios';
import Navbar from '@/components/Navbar';
import BoardCard from '@/components/BoardCard';

export default function BoardsPage() {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');

  // Fetch user's boards
  const { data: boards, isLoading, refetch } = useQuery({
    queryKey: ['boards'],
    queryFn: async () => {
      const response = await axios.get('/boards');
      return response.data.data;
    },
  });

  // Create board mutation
  const createBoardMutation = useMutation({
    mutationFn: async (boardData: { name: string; description?: string }) => {
      const response = await axios.post('/boards', boardData);
      return response.data.data;
    },
    onSuccess: (newBoard) => {
      // Close modal and clear form
      setIsCreateModalOpen(false);
      setNewBoardName('');
      setNewBoardDescription('');
      
      // Refetch boards to include the new one
      refetch();
      
      // Navigate to the new board
      router.push(`/boards/${newBoard._id}`);
    },
  });

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
    }
  }, [router]);

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBoardName.trim()) {
      alert('Board name is required');
      return;
    }

    createBoardMutation.mutate({
      name: newBoardName.trim(),
      description: newBoardDescription.trim(),
    });
  };

  const handleBoardClick = (boardId: string) => {
    router.push(`/boards/${boardId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-text-secondary">Loading boards...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      
      {/* Header */}
      <div className="border-b border-dark-border bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Your Boards</h1>
              <p className="mt-1 text-text-secondary">
                {boards && boards.length > 0 
                  ? `You have ${boards.length} board${boards.length === 1 ? '' : 's'}`
                  : 'Create your first board to get started'
                }
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-accent-primary hover:bg-accent-light text-white px-6 py-3 rounded-card font-medium transition-colors shadow-card hover:shadow-card-hover"
            >
              + Create New Board
            </button>
          </div>
        </div>
      </div>

      {/* Boards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {boards && boards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board: any) => (
              <BoardCard
                key={board._id}
                board={board}
                onClick={() => handleBoardClick(board._id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 bg-dark-hover rounded-2xl flex items-center justify-center">
              <svg className="w-12 h-12 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">No boards yet</h3>
            <p className="text-text-secondary mb-8">Create your first board to start organizing your tasks</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-accent-primary hover:bg-accent-light text-white px-8 py-3 rounded-card font-medium transition-colors"
            >
              Create Your First Board
            </button>
          </div>
        )}
      </div>

      {/* Create Board Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-surface rounded-card shadow-card border border-dark-border w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Create New Board</h2>
              
              <form onSubmit={handleCreateBoard}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="boardName" className="block text-sm font-medium text-text-secondary mb-2">
                      Board Name *
                    </label>
                    <input
                      type="text"
                      id="boardName"
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      className="w-full px-3 py-2 bg-dark-input border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                      placeholder="Enter board name"
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="boardDescription" className="block text-sm font-medium text-text-secondary mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      id="boardDescription"
                      value={newBoardDescription}
                      onChange={(e) => setNewBoardDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-dark-input border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                      placeholder="Describe what this board is for..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 px-4 py-2 text-text-secondary hover:text-text-primary border border-dark-border rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createBoardMutation.isPending}
                    className="flex-1 px-4 py-2 bg-accent-primary hover:bg-accent-light text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createBoardMutation.isPending ? 'Creating...' : 'Create Board'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}