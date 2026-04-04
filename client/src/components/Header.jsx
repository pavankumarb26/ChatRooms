export default function Header({ room, users = [], onLeave }) {
  const list = Array.isArray(users) ? users : [];
  const count = list.length;

  return (
    <div className="flex shrink-0 flex-col gap-3 border-b border-slate-200/90 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onLeave}
          className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:text-sm"
        >
          ← Back
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
            <span className="text-slate-500">Room</span>{" "}
            <span className="font-mono text-slate-800" title={room}>
              {room}
            </span>
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {list.slice(0, 6).map((u, i) => (
              <div
                key={i}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-700 ring-2 ring-white"
                title={u?.name || "User"}
              >
                {u?.name ? u.name[0].toUpperCase() : "?"}
              </div>
            ))}
            {count > 6 && (
              <span className="text-[11px] text-slate-500">+{count - 6}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 sm:flex-col sm:items-end sm:justify-center">
        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800 ring-1 ring-emerald-200/80">
          {count} online
        </span>
      </div>
    </div>
  );
}
