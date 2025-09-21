import React, { useState } from 'react';
import { createGoal } from '../../api/goals';

export default function GoalForm({ onGoalCreated }) {
  const [goal, setGoal] = useState({ goal_name: '', target_amount: '', deadline: '' });
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const created = await createGoal({
        goal_name: goal.goal_name,
        target_amount: Number(goal.target_amount),
        deadline: goal.deadline
      });
      onGoalCreated(created);
      setGoal({ goal_name: '', target_amount: '', deadline: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mb-4 flex gap-2">
      <input required className="border p-2 rounded flex-1" placeholder="Nombre de la meta" value={goal.goal_name}
        onChange={e=> setGoal({...goal, goal_name: e.target.value})} />
      <input required type="number" className="border p-2 rounded w-32" placeholder="Monto" value={goal.target_amount}
        onChange={e=> setGoal({...goal, target_amount: e.target.value})} />
      <input required type="date" className="border p-2 rounded" value={goal.deadline}
        onChange={e=> setGoal({...goal, deadline: e.target.value})} />
      <button disabled={loading} className="bg-blue-600 text-white px-4 rounded">{loading ? '...' : 'Agregar'}</button>
    </form>
  );
}
