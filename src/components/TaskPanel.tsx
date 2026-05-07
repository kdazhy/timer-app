import { useMemo, useState } from 'react';
import { useTaskStore } from '../stores/taskStore';

export function TaskPanel() {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState(4);
  const { tasks, focusTask, addTask, deleteTask, setFocusTask, updateTask } = useTaskStore();

  const activeTasks = useMemo(() => tasks.filter((task) => !task.done), [tasks]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    addTask(trimmed, target);
    setTitle('');
    setTarget(4);
  }

  return (
    <section className="panel task-panel">
      <div className="panel__heading">
        <span>今日任务</span>
        <strong>{activeTasks.length}</strong>
      </div>

      <div className="focus-task">
        <span>当前专注</span>
        <strong>{focusTask?.title ?? '还没有选择任务'}</strong>
        {focusTask && <small>{focusTask.completedPomodoros}/{focusTask.targetPomodoros} 个番茄</small>}
      </div>

      <form className="task-form" onSubmit={handleSubmit}>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="添加一个任务" />
        <input
          min={1}
          max={24}
          type="number"
          value={target}
          onChange={(event) => setTarget(Number(event.target.value))}
          onBlur={() => setTarget((value) => Math.min(24, Math.max(1, Math.round(value) || 1)))}
          aria-label="目标番茄数"
        />
        <button className="button button--primary" type="submit">添加</button>
      </form>

      <div className="task-list">
        {tasks.map((task) => (
          <article className={`task-card ${task.isFocus ? 'task-card--focus' : ''} ${task.done ? 'task-card--done' : ''}`} key={task.id}>
            <button className="task-card__main" onClick={() => setFocusTask(task.id)} disabled={task.done}>
              <strong>{task.title}</strong>
              <span>{task.completedPomodoros}/{task.targetPomodoros} 个番茄</span>
            </button>
            <button className="icon-button" onClick={() => updateTask(task.id, { done: !task.done })}>{task.done ? '恢复' : '完成'}</button>
            <button className="icon-button" onClick={() => deleteTask(task.id)}>删除</button>
          </article>
        ))}
      </div>
    </section>
  );
}
