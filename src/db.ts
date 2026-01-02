import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import localforage from 'localforage';

let SQL: SqlJsStatic;
let db: Database;

const DB_KEY = 'vrc_poker_db';

export const initDB = async (): Promise<Database> => {
  if (db) return db;

  SQL = await initSqlJs({
    locateFile: file => `/${file}`
  });

  const savedData = await localforage.getItem<Uint8Array>(DB_KEY);
  
  if (savedData) {
    db = new SQL.Database(savedData);
    // Ensure columns exist (for existing databases)
    try { db.run("ALTER TABLE players ADD COLUMN level INTEGER DEFAULT 1"); } catch(e) {}
    try { db.run("ALTER TABLE players ADD COLUMN tags TEXT DEFAULT ''"); } catch(e) {}
    try { db.run("ALTER TABLE players ADD COLUMN note TEXT DEFAULT ''"); } catch(e) {}
  } else {
    db = new SQL.Database();
    // Initialize tables
    db.run(`
      CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT DEFAULT '',
        seat_no INTEGER UNIQUE,
        tags TEXT DEFAULT '',
        level INTEGER DEFAULT 1,
        note TEXT DEFAULT ''
      );
      CREATE TABLE IF NOT EXISTS action_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER,
        action_type TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(player_id) REFERENCES players(id)
      );
    `);

    // Initialize 8 seats
    for (let i = 1; i <= 8; i++) {
      db.run('INSERT INTO players (seat_no, name) VALUES (?, ?)', [i, `Player ${i}`]);
    }
    await saveDB();
  }

  return db;
};

export const saveDB = async () => {
  if (db) {
    const data = db.export();
    await localforage.setItem(DB_KEY, data);
  }
};

export const getPlayers = () => {
  const res = db.exec("SELECT * FROM players ORDER BY seat_no ASC");
  if (res.length === 0) return [];
  const columns = res[0].columns;
  return res[0].values.map(row => {
    const obj: any = {};
    columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
};

export const getAllPastPlayers = () => {
  const res = db.exec("SELECT DISTINCT name, tags, level, note FROM players WHERE name != ''");
  if (res.length === 0) return [];
  const columns = res[0].columns;
  return res[0].values.map(row => {
    const obj: any = {};
    columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
};

export const loadPlayerToSeat = async (seatId: number, playerData: any) => {
  db.run(
    "UPDATE players SET name = ?, tags = ?, level = ?, note = ? WHERE id = ?",
    [playerData.name, playerData.tags, playerData.level, playerData.note, seatId]
  );
  await saveDB();
};

export const getActionCounts = () => {
  const res = db.exec(`
    SELECT player_id, action_type, COUNT(*) as count 
    FROM action_logs 
    GROUP BY player_id, action_type
  `);
  if (res.length === 0) return [];
  const columns = res[0].columns;
  return res[0].values.map(row => {
    const obj: any = {};
    columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
};

export const addAction = async (playerId: number, actionType: string) => {
  db.run("INSERT INTO action_logs (player_id, action_type) VALUES (?, ?)", [playerId, actionType]);
  await saveDB();
};

export const updatePlayerName = async (playerId: number, name: string) => {
  db.run("UPDATE players SET name = ? WHERE id = ?", [name, playerId]);
  await saveDB();
};

export const updatePlayerTags = async (playerId: number, tags: string) => {
  db.run("UPDATE players SET tags = ? WHERE id = ?", [tags, playerId]);
  await saveDB();
};

export const updatePlayerLevel = async (playerId: number, level: number) => {
  db.run("UPDATE players SET level = ? WHERE id = ?", [level, playerId]);
  await saveDB();
};

export const updatePlayerNote = async (playerId: number, note: string) => {
  db.run("UPDATE players SET note = ? WHERE id = ?", [note, playerId]);
  await saveDB();
};

export const resetPlayerSeat = async (playerId: number) => {
  // 名前、タグ、レベル、メモを初期化
  db.run("UPDATE players SET name = '', tags = '', level = 1, note = '' WHERE id = ?", [playerId]);
  // そのプレイヤーのアクション履歴のみ削除
  db.run("DELETE FROM action_logs WHERE player_id = ?", [playerId]);
  await saveDB();
};

export const resetActions = async () => {
  db.run("DELETE FROM action_logs");
  await saveDB();
};

export const exportDB = async () => {
  const data = db.export();
  const blob = new Blob([data], { type: "application/x-sqlite3" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vrc_poker_tracker.sqlite";
  a.click();
  URL.revokeObjectURL(url);
};

export const importDB = async (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = new Uint8Array(reader.result as ArrayBuffer);
        // 新しいデータベースインスタンスを作成して既存のdbを差し替える
        const newDb = new SQL.Database(data);
        db = newDb;
        // 永続化ストレージも更新
        await localforage.setItem(DB_KEY, data);
        resolve();
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

