import { create } from 'zustand';
import { pomodoroApi } from '../services/pomodoroApi';
import type { Task } from '../types';

interface TaskStore {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (title: string, targetPomodoros: number) => void;
  updateTask: (id: string, changes: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setFocusTask: (id?: string) => void;
  incrementFocusTask: () => void;
  focusTask?: Task;
}

function persist(tasks: Task[]) {
  void pomodoroApi.saveTasks(tasks);
}

function normalizeTargetPomodoros(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(24, Math.max(1, Math.round(value)));
}

function syncFocusTask(tasks: Task[]) {
  return tasks.find((task) => task.isFocus && !task.done) ?? tasks.find((task) => task.isFocus);
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  focusTask: undefined,
  setTasks: (tasks) => set({ tasks, focusTask: syncFocusTask(tasks) }),
  addTask: (title, targetPomodoros) => {
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      targetPomodoros: normalizeTargetPomodoros(targetPomodoros),
      completedPomodoros: 0,
      done: false,
      isFocus: get().tasks.every((item) => !item.isFocus || item.done),
      createdAt: new Date().toISOString(),
    };
    const tasks = [task, ...get().tasks];
    set({ tasks, focusTask: syncFocusTask(tasks) });
    persist(tasks);
  },
  updateTask: (id, changes) => {
    const tasks = get().tasks.map((task) => {
      if (task.id !== id) return task;
      return {
        ...task,
        ...changes,
        targetPomodoros: changes.targetPomodoros === undefined ? task.targetPomodoros : normalizeTargetPomodoros(changes.targetPomodoros),
      };
    });
    set({ tasks, focusTask: syncFocusTask(tasks) });
    persist(tasks);
  },
  deleteTask: (id) => {
    const tasks = get().tasks.filter((task) => task.id !== id);
    set({ tasks, focusTask: syncFocusTask(tasks) });
    persist(tasks);
  },
  setFocusTask: (id) => {
    const tasks = get().tasks.map((task) => ({ ...task, isFocus: !task.done && task.id === id }));
    set({ tasks, focusTask: syncFocusTask(tasks) });
    persist(tasks);
  },
  incrementFocusTask: () => {
    const focusTask = get().tasks.find((task) => task.isFocus);
    if (!focusTask) return;
    const tasks = get().tasks.map((task) =>
      task.id === focusTask.id
        ? {
            ...task,
            completedPomodoros: task.completedPomodoros + 1,
            done: task.completedPomodoros + 1 >= task.targetPomodoros,
          }
        : task,
    );
    set({ tasks, focusTask: syncFocusTask(tasks) });
    persist(tasks);
  },
}));
