import { useState } from "react";

export default function Header({ room, users = [], onLeave }) {
  const count = Array.isArray(users) ? users.length : 0;
  const [showUsers, setShowUsers] = useState(false);

  return (
    <div className="relative bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between z-50">
      <button onClick={onLeave} className="text-sm text-gray-600 hover:text-black transition-colors font-medium">
        ← Back
      </button>

      <div className="flex flex-col items-center relative">
        <h2 className="text-lg font-semibold">
          Room: <span className="text-gray-600">{room}</span>
        </h2>
        <div 
          onClick={() => setShowUsers(!showUsers)}
          onMouseEnter={() => setShowUsers(true)}
          onMouseLeave={() => setShowUsers(false)}
          className="flex items-center gap-1.5 mt-1 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded-full transition-colors relative"
        >
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-500 font-medium">
            <span className="font-semibold text-black">{count}</span>{" "}
            {count === 1 ? "user" : "users"} online
          </span>

          {showUsers && count > 0 && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
              <div className="px-3 py-1 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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

      <div className="w-10" />
    </div>
  );
}