"use client";

import { PatientLayout } from "@/components/patient/patient-layout";
import React, { useEffect, useState, useRef } from "react";
import { useExp } from "@/components/exp/exp-context";

// Enhanced Goal model to track timestamps and XP application state
interface Goal {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number; // ms epoch
  completedAt?: number | null; // ms epoch when completed
  // whether the creation 5 XP was already awarded (helps if older stored items exist)
  creationXpAwarded?: boolean;
  // whether the 24h resolution (+10 or -10) has been applied
  resolutionApplied?: boolean;
  // status for UI: active | overdue | completed
  status?: "active" | "overdue" | "completed";
}

const LOCAL_STORAGE_KEY = "patient_health_goals_v1";

function loadGoals(): Goal[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveGoals(goals: Goal[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(goals));
  }
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [loaded, setLoaded] = useState(false);
  const { addExp } = useExp();
  const timerRef = useRef<number | null>(null);

  const DAY_MS = 24 * 60 * 60 * 1000;

  useEffect(() => {
    const stored = loadGoals();
    setGoals(stored);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveGoals(goals);
  }, [goals, loaded]);

  // Check goals for 24hr resolution: apply +10 if completed within 24h, or -10 and mark overdue if not completed
  useEffect(() => {
    function checkGoals() {
      setGoals(prev => {
        const now = Date.now();
        let changed = false;
        const updated = prev.map(g => {
          // ensure defaults
          const goal = { status: g.status ?? "active", creationXpAwarded: !!g.creationXpAwarded, resolutionApplied: !!g.resolutionApplied, ...g } as Goal;

          // if creation XP wasn't awarded (older items), don't auto-award here to avoid surprise; assume past
          if (!goal.creationXpAwarded) {
            // For newly created in-session goals we always set this on creation; older ones remain false
            // Leave as-is
          }

          // if already resolved, nothing to do
          if (goal.resolutionApplied) return goal;

          // if completed and within 24h -> apply +10
                if (goal.completed && goal.completedAt && goal.completedAt - goal.createdAt <= DAY_MS) {
                  addExp(10, 'goal:completed-within-24h', { goalId: goal.id });
            goal.resolutionApplied = true;
            goal.status = "completed";
            changed = true;
            return goal;
          }

          // if not completed and now past 24h -> apply -10 and mark overdue
          if (!goal.completed && now - goal.createdAt >= DAY_MS) {
            addExp(-10, 'goal:overdue-24h', { goalId: goal.id });
            goal.resolutionApplied = true;
            goal.status = "overdue";
            changed = true;
            return goal;
          }

          return goal;
        });
        return changed ? updated : prev;
      });
    }

    // initial check
    checkGoals();
    // poll every minute
    timerRef.current = window.setInterval(checkGoals, 60 * 1000) as unknown as number;
    return () => {
      if (timerRef.current) clearInterval(timerRef.current as unknown as number);
    };
  }, [addExp]);

  const addGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    const createdAt = Date.now();
    const g: Goal = {
      id: createdAt.toString(),
      text: newGoal.trim(),
      completed: false,
      createdAt,
      completedAt: null,
      creationXpAwarded: true,
      resolutionApplied: false,
      status: "active",
    };
  // award creation XP (+5)
  addExp(5, 'goal:create', { goalId: g.id });
    setGoals(prev => [g, ...prev]);
    setNewGoal("");
  };

  const toggleGoal = (id: string) => {
    setGoals(prev => {
      return prev.map(g => {
        if (g.id !== id) return g;
        const now = Date.now();
        const toggled = { ...g } as Goal;
        toggled.completed = !g.completed;
        if (toggled.completed) {
          toggled.completedAt = now;
          // if completed within 24h and resolution not yet applied -> award +10
          if (!toggled.resolutionApplied && toggled.completedAt - toggled.createdAt <= DAY_MS) {
            addExp(10, 'goal:completed-within-24h', { goalId: toggled.id });
            toggled.resolutionApplied = true;
            toggled.status = "completed";
          } else {
            toggled.status = "completed";
          }
        } else {
          // un-checking a completed goal: clear completedAt but do not reverse applied XP
            // If the goal was just un-checked within 24 hours of completion and the +10
            // resolution was applied for completion, reverse that XP award.
            const now = Date.now()
            const DAY_MS = 24 * 60 * 60 * 1000
            if (toggled.completedAt && (now - toggled.completedAt) <= DAY_MS && toggled.resolutionApplied && toggled.status === "completed") {
              // reverse the completion award (-10)
              try {
                addExp(-10, 'goal:revert-completed-within-24h', { goalId: toggled.id })
              } catch {}
              // clear resolution so it can be applied again later if re-completed
              toggled.resolutionApplied = false
              toggled.status = "active"
            } else {
              // clear completedAt but do not reverse applied XP
              toggled.completedAt = null;
              // If the goal was overdue previously, keep status; otherwise set active
              if (!toggled.resolutionApplied) toggled.status = "active";
            }
        }
        return toggled;
      });
    });
  };

  const deleteGoal = (id: string) => {
    // If a goal is deleted within 24 hours of creation, apply a -5 XP penalty
    setGoals(prev => {
      const toDelete = prev.find(g => g.id === id);
          if (toDelete) {
        try {
          const now = Date.now();
          if (toDelete.creationXpAwarded && now - toDelete.createdAt < DAY_MS) {
            // reverse the creation award by deducting 5 XP
                addExp(-5, 'goal:deleted-within-24h', { goalId: toDelete.id });
          }
        } catch (e) {
          // swallow errors to avoid blocking deletion
        }
      }
      return prev.filter(goal => goal.id !== id);
    });
  };

  return (
    <PatientLayout>
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Personal Health Goals</h1>
        <form onSubmit={addGoal} className="flex gap-2 mb-6">
          <input
            type="text"
            className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring"
            placeholder="Add a new goal..."
            value={newGoal}
            onChange={e => setNewGoal(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add
          </button>
        </form>

        <ul className="space-y-3">
          {goals.length === 0 && (
            <li className="text-gray-500 text-center">No goals yet. Add one above!</li>
          )}
          {goals.map(goal => (
            <li
              key={goal.id}
              className={`flex items-center justify-between p-3 rounded border ${goal.status === "overdue" ? "bg-red-50 border-red-300" : goal.completed ? "bg-green-50 border-green-300" : "bg-white border-gray-200"}`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={goal.completed}
                  onChange={() => toggleGoal(goal.id)}
                  className="h-5 w-5 text-green-600"
                />
                <div>
                  <div className={goal.completed ? "line-through text-gray-400" : ""}>{goal.text}</div>
                  <div className="text-xs text-gray-500">Created: {new Date(goal.createdAt).toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {goal.status === "overdue" && <span className="text-sm text-red-600">Overdue (-10 XP applied)</span>}
                {goal.status === "completed" && goal.resolutionApplied && <span className="text-sm text-green-600">Completed (+10 XP applied)</span>}
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="text-red-500 hover:text-red-700 px-2"
                  title="Delete goal"
                >
                  &times;
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </PatientLayout>
  );
}