// API helpers for Goals
const BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

export async function getGoals() {
  const res = await fetch(`${BASE}/goals/`, { credentials: "include" });
  return res.json();
}

export async function createGoal(payload) {
  const res = await fetch(`${BASE}/goals/`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateGoal(id, payload) {
  const res = await fetch(`${BASE}/goals/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteGoal(id) {
  const res = await fetch(`${BASE}/goals/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return res.ok;
}
