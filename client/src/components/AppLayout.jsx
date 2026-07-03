export default function AppLayout({ children }) {
  const year = new Date().getFullYear();

  return (
    <div className="flex h-screen flex-col bg-gradient-to-tr from-slate-50 via-slate-50 to-indigo-50/40 text-slate-800 antialiased font-sans overflow-hidden">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md shadow-sm shrink-0">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-sm font-black text-white shadow-md shadow-indigo-600/10"
              aria-hidden
            >
              RC
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-bold tracking-tight text-slate-900">
                RoomChat
              </p>
              <p className="hidden text-xs text-slate-500 sm:block">
                Real-time collaborative workspaces · Socket.IO
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
            PRO v2.0
          </span>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>

      <footer className="border-t border-slate-200/60 bg-slate-50/40 py-4 text-center text-xs text-slate-400 shrink-0">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p>
            © {year} RoomChat · Encrypted channels · Real-time synced whiteboard and voice messaging
          </p>
        </div>
      </footer>
    </div>
  );
}
