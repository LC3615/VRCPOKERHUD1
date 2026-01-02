import React, { useEffect, useState } from 'react';
import { initDB, getPlayers, getActionCounts, addAction, updatePlayerName, updatePlayerTags, updatePlayerLevel, updatePlayerNote, resetPlayerSeat, resetActions, exportDB } from './db';
import PlayerCard from './components/PlayerCard';
import { Database } from 'lucide-react';

function App() {
  const [dbReady, setDbReady] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
  const [counts, setCounts] = useState<any[]>([]);

  const refreshData = () => {
    setPlayers(getPlayers());
    setCounts(getActionCounts());
  };

  useEffect(() => {
    initDB().then(() => {
      setDbReady(true);
      refreshData();
    });
  }, []);

  const handleAction = async (playerId: number, action: string) => {
    await addAction(playerId, action);
    refreshData();
  };

  const handleNameUpdate = async (playerId: number, name: string) => {
    await updatePlayerName(playerId, name);
    refreshData();
  };

  const handleTagsUpdate = async (playerId: number, tags: string) => {
    await updatePlayerTags(playerId, tags);
    refreshData();
  };

  const handleLevelUpdate = async (playerId: number, level: number) => {
    await updatePlayerLevel(playerId, level);
    refreshData();
  };

  const handleNoteUpdate = async (playerId: number, note: string) => {
    await updatePlayerNote(playerId, note);
    refreshData();
  };

  const handlePlayerReset = async (playerId: number) => {
    await resetPlayerSeat(playerId);
    refreshData();
  };

  const handleReset = async () => {
    if (window.confirm('すべてのカウントをリセットしますか？')) {
      await resetActions();
      refreshData();
    }
  };

  if (!dbReady) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-slate-900 text-white">
        <div className="text-center">
          <Database className="animate-bounce mx-auto mb-4" size={48} />
          <p className="text-xl font-bold">SQLite Initializing...</p>
        </div>
      </div>
    );
  }

  // Split players into top 4 and bottom 4 for 8MAX (4+4)
  const topRow = players.slice(0, 4);
  const bottomRow = players.slice(4, 8);

  const getPlayerCounts = (playerId: number) => {
    const playerCounts: { [key: string]: number } = {};
    counts
      .filter((c) => c.player_id === playerId)
      .forEach((c) => {
        playerCounts[c.action_type] = c.count;
      });
    return playerCounts;
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-slate-200 p-4 font-sans flex flex-col items-center">
      <header className="w-full max-w-6xl flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter text-white">
            VRC <span className="text-blue-500">POKER</span> HUD
          </h1>
          <p className="text-[10px] text-slate-500 uppercase font-bold">8-MAX (4+4) カチカチ君 Edition</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded border border-slate-700 transition-colors"
          >
            RESET
          </button>
          <button
            onClick={exportDB}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded border border-blue-500 text-white transition-colors"
          >
            EXPORT SQL
          </button>
        </div>
      </header>

      <main className="w-full max-w-6xl grid grid-rows-[1fr_auto_1fr] gap-6 flex-1">
        {/* Top Row: 4 Players */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {topRow.map((p) => (
            <PlayerCard
              key={p.id}
              player={p}
              actionCounts={getPlayerCounts(p.id)}
              onAction={handleAction}
              onNameUpdate={handleNameUpdate}
              onTagsUpdate={handleTagsUpdate}
              onLevelUpdate={handleLevelUpdate}
              onNoteUpdate={handleNoteUpdate}
              onReset={handlePlayerReset}
            />
          ))}
        </div>

        {/* Center: Table Decor / Stats Summary */}
        <div className="flex items-center justify-center py-4">
          <div className="w-full h-[2px] bg-slate-800 relative">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-8 py-2 rounded-full border border-slate-800">
              <span className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">
                VRC POKER TABLE
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Row: 4 Players */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {bottomRow.map((p) => (
            <PlayerCard
              key={p.id}
              player={p}
              actionCounts={getPlayerCounts(p.id)}
              onAction={handleAction}
              onNameUpdate={handleNameUpdate}
              onTagsUpdate={handleTagsUpdate}
              onLevelUpdate={handleLevelUpdate}
              onNoteUpdate={handleNoteUpdate}
              onReset={handlePlayerReset}
            />
          ))}
        </div>
      </main>

      <footer className="mt-8 text-[10px] text-slate-600 font-medium uppercase tracking-widest">
        Powered by SQLite WASM & React
      </footer>
    </div>
  );
}

export default App;
