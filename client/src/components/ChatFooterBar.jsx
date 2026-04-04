/** Small footer inside the chat card (below the composer). */
export default function ChatFooterBar({ room }) {
  return (
    <div className="border-t border-slate-100 bg-slate-50/80 px-3 py-2.5 text-center sm:px-4">
      <p className="text-[11px] leading-relaxed text-slate-500 sm:text-xs">
        Room code{" "}
        <span className="font-mono font-medium text-slate-700">{room}</span>
        <span className="mx-1.5 text-slate-300">·</span>
        Delete only your own messages
        <span className="mx-1.5 text-slate-300 sm:inline">·</span>
        <span className="block sm:inline">Ctrl+Enter to send</span>
      </p>
    </div>
  );
}
