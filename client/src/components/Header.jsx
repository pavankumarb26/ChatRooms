import { useState } from "react";

export default function Header({ room, users = [], onLeave }) {
  const count = Array.isArray(users) ? users.length : 0;
  const [showUsers, setShowUsers] = useState(false);

  return (
    <div className="relative bg-white/80 border-b border-slate-200/80 shadow-sm px-4 py-3.5 flex items-center justify-between z-50 backdrop-blur-md">
      <button onClick={onLeave} className="text-sm text-slate-500 hover:text-slate-950 transition-colors font-semibold bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-lg shadow-sm">
        ← Leave Room
      </button>

      <div className="flex flex-col items-center relative">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Room: <span className="text-indigo-600 font-extrabold">{room}</span>
        </h2>
        <div 
          onClick={() => setShowUsers(!showUsers)}
          onMouseEnter={() => setShowUsers(true)}
          onMouseLeave={() => setShowUsers(false)}
          className="flex items-center gap-1.5 mt-0.5 cursor-pointer select-none bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-full border border-slate-200/60 transition-colors relative"
        >
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] text-slate-500 font-bold tracking-wide">
            <span className="font-extrabold text-indigo-600">{count}</span>{" "}
            {count === 1 ? "USER" : "USERS"} ONLINE
          </span>

          {showUsers && count > 0 && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
              <div className="px-3 py-1 border-b border-slate-100 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Active Users
              </div>
              <ul className="max-h-40 overflow-y-auto mt-1">
                {users.map((u, i) => (
                  <li key={u.tabId || i} className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    <span className="truncate">{u.name}</span>
                    <span className="text-[9px] text-slate-400 ml-auto">#{u.tabId}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="w-24" />
    </div>
  );
}