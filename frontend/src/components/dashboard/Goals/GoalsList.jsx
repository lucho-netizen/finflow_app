import React, { useEffect, useState } from 'react';
import { getGoals } from '../../api/goals';
import GoalForm from './GoalForm';

export default function GoalsList() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getGoals().then(data => {
      if(mounted) setGoals(data || []);
      setLoading(false);
    });
    return () => { mounted = false; }
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-4">🎯 Metas financieras</h2>
      <GoalForm onGoalCreated={(g)=> setGoals(prev => [g, ...prev])} />
      {loading ? <p>Cargando metas...</p> : (
        goals.length === 0 ? <p className="text-gray-500">No tienes metas registradas</p> : (
          <ul className="space-y-3">
            {goals.map(goal => {
              const progress = (Number(goal.current_progress || 0) / Number(goal.target_amount || 1)) * 100;
              return (
                <li key={goal.id} className="border p-3 rounded-lg flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{goal.goal_name}</span>
                    <span className="text-sm text-gray-500">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${progress}%`, backgroundColor: '#16a34a' }} />
                  </div>
                  <small className="text-gray-500">Meta: {goal.target_amount} | Plazo: {new Date(goal.deadline).toLocaleDateString()}</small>
                </li>
              );
            })}
          </ul>
        )
      )}
    </div>
  );
}
