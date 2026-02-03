import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  listId: string;
  assignees: User[];
  status: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

interface List {
  _id: string;
  name: string;
  boardId: string;
  tasks: Task[];
  position: number;
  createdAt: string;
  updatedAt: string;
}

interface Board {
  _id: string;
  name: string;
  description: string;
  members: User[];
  lists: List[];
  createdAt: string;
  updatedAt: string;
}

interface BoardState {
  currentBoard: Board | null;
  lists: List[];
  tasks: Task[];
  
  // Actions
  setBoard: (board: Board) => void;
  clearBoard: () => void;
  
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, sourceListId: string, targetListId: string) => void;
  
  addList: (list: List) => void;
  updateList: (listId: string, updates: Partial<List>) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  currentBoard: null,
  lists: [],
  tasks: [],

  setBoard: (board) => {
    const lists = board.lists || [];
    const tasks = lists.flatMap((list) => list.tasks || []);
    
    set({
      currentBoard: board,
      lists,
      tasks,
    });
  },

  clearBoard: () => {
    set({
      currentBoard: null,
      lists: [],
      tasks: [],
    });
  },

  addTask: (task) => {
    set((state) => {
      const updatedLists = state.lists.map((list) =>
        list._id === task.listId
          ? { ...list, tasks: [...list.tasks, task] }
          : list
      );

      return {
        tasks: [...state.tasks, task],
        lists: updatedLists,
      };
    });
  },

  updateTask: (taskId, updates) => {
    set((state) => {
      const updatedTasks = state.tasks.map((task) =>
        task._id === taskId ? { ...task, ...updates } : task
      );

      const updatedLists = state.lists.map((list) => ({
        ...list,
        tasks: list.tasks.map((task) =>
          task._id === taskId ? { ...task, ...updates } : task
        ),
      }));

      return {
        tasks: updatedTasks,
        lists: updatedLists,
      };
    });
  },

  deleteTask: (taskId) => {
    set((state) => {
      const task = state.tasks.find((t) => t._id === taskId);
      if (!task) return state;

      const updatedTasks = state.tasks.filter((t) => t._id !== taskId);
      const updatedLists = state.lists.map((list) =>
        list._id === task.listId
          ? { ...list, tasks: list.tasks.filter((t) => t._id !== taskId) }
          : list
      );

      return {
        tasks: updatedTasks,
        lists: updatedLists,
      };
    });
  },

  moveTask: (taskId, sourceListId, targetListId) => {
    set((state) => {
      const task = state.tasks.find((t) => t._id === taskId);
      if (!task) return state;

      const movedTask = { ...task, listId: targetListId };

      const updatedTasks = state.tasks.map((t) =>
        t._id === taskId ? movedTask : t
      );

      const updatedLists = state.lists.map((list) => {
        if (list._id === sourceListId) {
          return {
            ...list,
            tasks: list.tasks.filter((t) => t._id !== taskId),
          };
        }
        if (list._id === targetListId) {
          return {
            ...list,
            tasks: [...list.tasks, movedTask],
          };
        }
        return list;
      });

      return {
        tasks: updatedTasks,
        lists: updatedLists,
      };
    });
  },

  addList: (list) => {
    set((state) => ({
      lists: [...state.lists, list],
    }));
  },

  updateList: (listId, updates) => {
    set((state) => ({
      lists: state.lists.map((list) =>
        list._id === listId ? { ...list, ...updates } : list
      ),
    }));
  },
}));
