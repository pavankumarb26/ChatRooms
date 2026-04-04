export default function AppLayout({ children }) {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 text-slate-900 antialiased">
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm"
              aria-hidden
            >
              RC
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold tracking-tight text-slate-900">
                RoomChat
              </p>
              <p className="hidden text-xs text-slate-500 sm:block">
                Real-time rooms · Socket.IO
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">
            Beta
          </span>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col">{children}</main>

      <footer className="border-t border-slate-200/90 bg-white/90 py-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p>
            © {year} RoomChat · Private rooms · Messages &amp; files stored per
            room
          </p>
        </div>
      </footer>
    </div>
  );
}
