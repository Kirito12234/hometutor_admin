"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

const STORAGE_KEY = "admin_favorites";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setFavorites(parsed);
      }
    } catch (parseError) {
      setFavorites([]);
    }
  }, []);

  const persistFavorites = (nextFavorites) => {
    setFavorites(nextFavorites);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextFavorites));
  };

  const addFavorite = () => {
    const clean = draft.trim();
    if (!clean) {
      return;
    }
    if (favorites.includes(clean)) {
      return;
    }
    persistFavorites([clean, ...favorites]);
    setDraft("");
  };

  const removeFavorite = (item) => {
    const nextFavorites = favorites.filter((favorite) => favorite !== item);
    persistFavorites(nextFavorites);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-100">
        <Sidebar />
        <main className="ml-64 p-6">
          <Navbar title="Favorites" />

          <section className="card mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Add Favorite</h2>
            <p className="mt-1 text-sm text-slate-600">Store quick notes or links you use often.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <input
                className="input max-w-sm"
                onChange={(event) => setDraft(event.target.value)}
                placeholder="e.g. Pending teacher approvals"
                type="text"
                value={draft}
              />
              <button className="btn-primary" onClick={addFavorite} type="button">
                Add
              </button>
            </div>
          </section>

          <section className="card">
            <h2 className="text-lg font-semibold text-slate-900">Saved Favorites</h2>
            {favorites.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No favorites saved yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {favorites.map((item) => (
                  <li key={item} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                    <span className="text-sm text-slate-700">{item}</span>
                    <button className="text-xs font-medium text-red-600" onClick={() => removeFavorite(item)} type="button">
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
