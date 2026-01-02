import React, { useState } from 'react';
import { User, Edit2, Check, Tag as TagIcon, StickyNote, RotateCcw } from 'lucide-react';

interface Player {
  id: number;
  name: string;
  seat_no: number;
  tags: string;
  level: number;
  note: string;
}

interface ActionCount {
  [key: string]: number;
}

interface PlayerCardProps {
  player: Player;
  actionCounts: ActionCount;
  onAction: (playerId: number, action: string) => void;
  onNameUpdate: (playerId: number, name: string) => void;
  onTagsUpdate: (playerId: number, tags: string) => void;
  onLevelUpdate: (playerId: number, level: number) => void;
  onNoteUpdate: (playerId: number, note: string) => void;
  onReset: (playerId: number) => void;
}

const ACTIONS = [
  { id: 'LIMP', label: 'Limp', color: 'bg-blue-600' },
  { id: 'PFR', label: 'PFR', color: 'bg-red-600' },
  { id: '3BET', label: '3B+', color: 'bg-orange-600' },
  { id: 'FOLD_TO_CB', label: 'F2CB', color: 'bg-slate-600' },
  { id: 'CBET', label: 'CB', color: 'bg-pink-600' },
  { id: 'XR', label: 'XR', color: 'bg-purple-600' },
];

const SHOWDOWN_ACTIONS = [
  { id: 'NUTS', label: 'NUTS', color: 'bg-yellow-600' },
  { id: 'VALUE', label: 'VAL', color: 'bg-emerald-600' },
  { id: 'MARGINAL', label: 'MAR', color: 'bg-cyan-600' },
  { id: 'BAD', label: 'BAD', color: 'bg-rose-700' },
  { id: 'MUCK', label: 'MUCK', color: 'bg-stone-600' },
];

const PRESET_TAGS = [
  { id: 'Station', color: 'bg-emerald-600', text: 'text-emerald-100' },
  { id: 'Maniac', color: 'bg-rose-600', text: 'text-rose-100' },
  { id: 'Tight', color: 'bg-slate-600', text: 'text-slate-100' },
  { id: 'Agg', color: 'bg-orange-600', text: 'text-orange-100' },
  { id: 'Fish', color: 'bg-blue-600', text: 'text-blue-100' },
  { id: 'Shark', color: 'bg-indigo-700', text: 'text-indigo-100' },
  { id: 'GTO', color: 'bg-purple-600', text: 'text-purple-100' },
  { id: 'ABC', color: 'bg-cyan-600', text: 'text-cyan-100' },
];

const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, 
  actionCounts, 
  onAction, 
  onNameUpdate, 
  onTagsUpdate, 
  onLevelUpdate, 
  onNoteUpdate,
  onReset
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(player.name);
  const [showTags, setShowTags] = useState(false);

  const activeTagIds = player.tags ? player.tags.split(',') : [];
  
  // Get the background color from the first active tag if any
  const getHeaderColor = () => {
    if (activeTagIds.length === 0) return 'bg-slate-800';
    const firstTag = PRESET_TAGS.find(t => t.id === activeTagIds[0]);
    return firstTag ? firstTag.color : 'bg-slate-800';
  };

  const handleNameSave = () => {
    onNameUpdate(player.id, tempName);
    setIsEditing(false);
  };

  const handleLevelChange = (delta: number) => {
    const newLevel = Math.max(1, (player.level || 1) + delta);
    onLevelUpdate(player.id, newLevel);
  };

  const handleResetClick = () => {
    if (window.confirm(`${player.name || `Seat ${player.seat_no}`} のデータを保存してリセットしますか？`)) {
      onReset(player.id);
    }
  };

  const toggleTag = (tagId: string) => {
    let newTags;
    if (activeTagIds.includes(tagId)) {
      newTags = activeTagIds.filter(t => t !== tagId);
    } else {
      newTags = [...activeTagIds, tagId];
    }
    onTagsUpdate(player.id, newTags.join(','));
  };

  return (
    <div className={`${getHeaderColor()} rounded-lg p-3 shadow-lg border border-slate-700 w-full flex flex-col gap-2 transition-colors duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="bg-black/30 p-1 rounded-full shrink-0">
            <User size={14} className="text-white" />
          </div>
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="bg-black/40 text-white text-xs px-1 py-0.5 rounded border border-white/20 w-20 outline-none"
                autoFocus
                onBlur={handleNameSave}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              />
            </div>
          ) : (
            <div className="flex items-center gap-1 overflow-hidden">
              <span className="text-xs font-black text-white truncate drop-shadow-md">
                {player.name || `Seat ${player.seat_no}`}
              </span>
              <button onClick={() => setIsEditing(true)} className="text-white/60 hover:text-white shrink-0">
                <Edit2 size={10} />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <div className="flex items-center bg-black/30 rounded border border-white/10 px-1 mr-1">
            <button 
              onClick={() => handleLevelChange(-1)}
              className="text-[10px] text-white/50 hover:text-white px-1 font-bold"
            >
              -
            </button>
            <div className="flex items-center text-[10px] font-black text-white">
              <span className="mr-0.5 text-white/70">Lv</span>
              <input
                type="number"
                value={player.level || 1}
                onChange={(e) => onLevelUpdate(player.id, parseInt(e.target.value) || 1)}
                className="bg-transparent w-6 text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-black"
              />
            </div>
            <button 
              onClick={() => handleLevelChange(1)}
              className="text-[10px] text-white/50 hover:text-white px-1 font-bold"
            >
              +
            </button>
          </div>
          <button 
            onClick={() => setShowTags(!showTags)}
            className={`p-1 rounded ${showTags ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}
          >
            <TagIcon size={12} />
          </button>
          <button 
            onClick={handleResetClick}
            className="p-1 rounded text-white/50 hover:text-red-300 transition-colors"
            title="この席をリセット"
          >
            <RotateCcw size={12} />
          </button>
          <span className="text-[9px] font-mono text-white/40 font-bold">#{player.seat_no}</span>
        </div>
      </div>

      {/* Note Display (Always shown) */}
      <div className="bg-black/20 rounded border border-white/5 p-1.5">
        <textarea
          value={player.note || ''}
          onChange={(e) => onNoteUpdate(player.id, e.target.value)}
          placeholder="メモを入力..."
          className="w-full bg-transparent text-[10px] text-white placeholder:text-white/20 outline-none resize-none h-10 leading-tight font-medium"
        />
      </div>

      {/* Tags Panel */}
      {showTags && (
        <div className="flex flex-wrap gap-1 p-1 bg-black/20 rounded border border-white/5">
          {PRESET_TAGS.map(tag => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`text-[8px] px-1.5 py-0.5 rounded-sm font-black transition-all ${
                activeTagIds.includes(tag.id) 
                  ? `${tag.color} text-white ring-1 ring-white/50` 
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {tag.id}
            </button>
          ))}
        </div>
      )}

      {/* Active Tags Display */}
      {!showTags && activeTagIds.length > 0 && (
        <div className="flex flex-wrap gap-1 h-4 overflow-hidden">
          {activeTagIds.map(tagId => {
            const tag = PRESET_TAGS.find(t => t.id === tagId);
            return (
              <span key={tagId} className={`text-[8px] px-1 ${tag?.color || 'bg-slate-700'} text-white rounded-sm font-bold border border-white/10`}>
                {tagId}
              </span>
            );
          })}
        </div>
      )}

      {/* Action Grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(player.id, action.id)}
            className={`${action.color} hover:brightness-110 active:scale-95 transition-all p-1.5 rounded flex flex-col items-center justify-center min-h-[38px]`}
          >
            <span className="text-[8px] font-bold text-white uppercase leading-none mb-0.5">
              {action.label}
            </span>
            <span className="text-xs font-black text-white leading-none">
              {actionCounts[action.id] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Showdown Row (3rd row) */}
      <div className="grid grid-cols-5 gap-1 mt-0.5">
        {SHOWDOWN_ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(player.id, action.id)}
            className={`${action.color} hover:brightness-110 active:scale-95 transition-all p-1 rounded flex flex-col items-center justify-center min-h-[34px]`}
          >
            <span className="text-[7px] font-black text-white uppercase leading-none mb-0.5 tracking-tighter">
              {action.label}
            </span>
            <span className="text-[10px] font-black text-white leading-none">
              {actionCounts[action.id] || 0}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PlayerCard;
