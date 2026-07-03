import { forwardRef, useRef, useEffect, useState } from "react";
import moment from "moment";

function messageTimestamp(msg) {
  const raw = msg?.createdAt ?? msg?.dateTime;
  if (raw == null || raw === "") return null;
  if (typeof raw === "object" && raw !== null && "$date" in raw) {
    return raw.$date;
  }
  return raw;
}

/** Clear relative labels (e.g. "1 minute ago", "2 hours ago") instead of vague "a few seconds ago". */
function formatMessageTime(dateInput) {
  if (dateInput == null || dateInput === "") return "";
  const then = moment(dateInput);
  if (!then.isValid()) return "";
  const now = moment();
  const sec = Math.max(0, now.diff(then, "seconds"));
  const min = now.diff(then, "minutes");
  const hrs = now.diff(then, "hours");
  const days = now.diff(then, "days");

  if (sec < 10) return "Just now";
  if (sec < 60) return `${sec} second${sec === 1 ? "" : "s"} ago`;
  if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return then.format("MMM D, YYYY [at] h:mm A");
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
}

function CopyIcon() {
  return (
    <svg
      className="copy-icon"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      className="trash-icon"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

const getAvatarColor = (name) => {
  const colors = [
    "bg-emerald-500 text-white",
    "bg-sky-500 text-white",
    "bg-amber-500 text-white",
    "bg-rose-500 text-white",
    "bg-indigo-500 text-white",
    "bg-teal-500 text-white",
    "bg-violet-500 text-white",
    "bg-fuchsia-500 text-white"
  ];
  let hash = 0;
  const cleanName = name || "Anonymous";
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % colors.length);
  return colors[index];
};

const getInitials = (name) => {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
};

function renderFormattedMessage(message) {
  if (typeof message !== "string") return message;

  const parts = message.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith("```") && part.endsWith("```")) {
      const match = part.match(/^```(\w*)\n?([\s\S]*?)```$/);
      const language = match ? match[1] : "";
      const code = match ? match[2] : part.slice(3, -3);

      return (
        <div key={index} className="my-2 overflow-x-auto rounded-xl border border-slate-700 bg-slate-900 text-slate-100 p-3.5 font-mono text-xs text-left max-w-full shadow-inner">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-sans border-b border-slate-800 pb-1.5 mb-1.5 select-none">
            <span>{language || "code"}</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(code);
              }}
              className="hover:text-white transition-colors"
            >
              Copy
            </button>
          </div>
          <pre className="whitespace-pre overflow-x-auto">
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    return (
      <span key={index} className="whitespace-pre-wrap">
        {part}
      </span>
    );
  });
}

function CustomAudioPlayer({ src, isOwn }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch((err) => console.log("Playback error:", err));
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration || 0);
  };

  const handleScrub = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const value = Number(e.target.value);
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const formatAudioTime = (time) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 65);
    const displaySecs = secs >= 60 ? 59 : secs;
    return `${mins}:${displaySecs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`flex items-center gap-3 p-2.5 rounded-xl border w-[220px] select-none ${
      isOwn 
        ? "bg-white/90 text-slate-800 border-indigo-100/75 shadow-sm" 
        : "bg-slate-100 text-slate-800 border-slate-200"
    }`}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      
      <button
        onClick={togglePlay}
        type="button"
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:scale-105 transition active:scale-95 text-white ${
          isOwn ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-800 hover:bg-slate-900"
        }`}
      >
        {isPlaying ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="4" width="4" height="16" rx="1"/>
            <rect x="16" y="4" width="4" height="16" rx="1"/>
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleScrub}
          className={`h-1 w-full cursor-pointer appearance-none rounded-lg accent-current ${
            isOwn ? "bg-slate-200" : "bg-slate-350"
          }`}
        />
        <div className="flex justify-between text-[8px] opacity-75 font-mono text-slate-500">
          <span>{formatAudioTime(currentTime)}</span>
          <span>{formatAudioTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}

const MessageList = forwardRef(
  ({ messages, feedback, apiBase, onDeleteMessage }, ref) => {
    const bottomRef = useRef(null);
    const [copiedId, setCopiedId] = useState(null);
    const [timeTick, setTimeTick] = useState(0);

    useEffect(() => {
      const id = window.setInterval(() => setTimeTick((t) => t + 1), 45_000);
      return () => window.clearInterval(id);
    }, []);

    useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, feedback]);

    void timeTick;

    const buildCopyText = (msg) => {
      const rawId = msg.document?._id ?? msg.documentId;
      const fileId = rawId != null && rawId !== "" ? String(rawId) : "";
      const fileName = msg.document?.fileName || "file";
      const isFile = msg.kind === "file" && fileId;
      if (!isFile) return msg.message || "";
      const q = (n) => encodeURIComponent(n || "");
      const url = `${apiBase}/api/files/${q(fileId)}?original=${q(fileName)}`;
      return `${msg.message || fileName}\n${url}`;
    };

    const handleCopy = async (msg, rowKey) => {
      await copyToClipboard(buildCopyText(msg));
      setCopiedId(rowKey);
      setTimeout(() => setCopiedId((c) => (c === rowKey ? null : c)), 1500);
    };

    return (
      <ul
        ref={ref}
        className="flex flex-col gap-4 py-3"
      >
        {messages.map((msg, index) => {
          const rawId = msg.document?._id ?? msg.documentId;
          const fileId = rawId != null && rawId !== "" ? String(rawId) : "";
          const fileName = msg.document?.fileName || "file";
          const mimeType = msg.document?.mimeType || "";

          const isFile = msg.kind === "file" && fileId.length > 0;

          const isImage =
            isFile &&
            (mimeType.startsWith("image/") ||
              /\.(png|jpe?g|gif|webp)$/i.test(fileName));

          const isAudio =
            isFile &&
            (mimeType.startsWith("audio/") ||
              /\.(webm|wav|mp3|ogg|m4a)$/i.test(fileName));

          const fileSrc = isFile
            ? `${apiBase}/api/files/${encodeURIComponent(fileId)}?inline=1`
            : "";

          const downloadHref = isFile
            ? `${apiBase}/api/files/${encodeURIComponent(fileId)}?original=${encodeURIComponent(fileName)}`
            : "";

          const key = msg._id != null ? String(msg._id) : `m-${index}`;

          return (
            <li
              key={key}
              className={`flex ${
                msg.isOwn ? "justify-end" : "justify-start"
              } px-2`}
            >
              {msg.isOwn ? (
                // OWN MESSAGE (Right aligned)
                <div className="flex flex-col gap-1 max-w-[75%] items-end">
                  
                  {/* Timestamp header */}
                  <span className="text-[8px] font-bold text-slate-400 mr-1 uppercase tracking-wider select-none">
                    {formatMessageTime(messageTimestamp(msg))}
                  </span>

                  {/* Own Message Bubble Container with Left Padding so hover state covers the toolbar gap */}
                  <div className="relative group pl-14 w-full flex justify-end">
                    
                    {/* Floating Actions on Hover - Positioned inside the pl-14 container boundary to prevent hover loss */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-1.5 hidden group-hover:flex items-center gap-1 select-none z-20 bg-white border border-red-200 rounded-lg p-1 shadow-md animate-in fade-in duration-100">
                      <button
                        onClick={() => handleCopy(msg, key)}
                        className="p-1 text-red-600 hover:text-red-950 hover:bg-red-50 rounded transition-colors"
                        title="Copy text"
                      >
                        <CopyIcon />
                        {copiedId === key && <span className="text-[8px] text-red-600 font-bold ml-0.5">✓</span>}
                      </button>
                      {onDeleteMessage && (
                        <button
                          onClick={() => onDeleteMessage(msg._id)}
                          className="p-1 text-red-600 hover:text-red-950 hover:bg-red-50 transition-colors rounded"
                          title="Delete message"
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </div>

                    {/* Own Message Bubble (Vibrant indigo-violet gradient) */}
                    <div className="p-3 rounded-2xl rounded-tr-none bg-gradient-to-tr from-indigo-600 to-violet-600 text-white border border-indigo-600/30 shadow-md shadow-indigo-500/10 text-sm break-words text-left w-auto max-w-full">
                      {isImage && (
                        <img
                          src={fileSrc}
                          alt={fileName || "attachment"}
                          className="rounded-lg mb-2 max-h-60 w-full object-contain border border-indigo-700/20"
                          loading="lazy"
                        />
                      )}

                      {!isFile && (
                        <div className="whitespace-pre-wrap leading-relaxed font-semibold">
                          {renderFormattedMessage(msg.message)}
                        </div>
                      )}

                      {isFile && !isImage && (
                        <div>
                          {isAudio ? (
                            <div className="my-1">
                              <CustomAudioPlayer src={fileSrc} isOwn={true} />
                              <p className="text-[9px] mt-1 font-semibold text-indigo-200 truncate max-w-[200px]">{fileName}</p>
                            </div>
                          ) : (
                            <div>
                              <p className="mb-1.5 font-semibold leading-relaxed">{msg.message}</p>
                              <a
                                href={downloadHref}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center text-xs font-bold underline text-indigo-200 hover:text-white"
                              >
                                Download Attachment
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // OTHER MESSAGE (Left aligned with initials avatar)
                <div className="flex gap-2 max-w-[80%] items-start">
                  
                  {/* Initials Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-[11px] uppercase shadow-sm shrink-0 mt-3 select-none ${getAvatarColor(msg.name)}`}>
                    {getInitials(msg.name)}
                  </div>

                  <div className="flex flex-col gap-1 min-w-0">
                    
                    {/* Sender name & time header row */}
                    <div className="flex items-baseline gap-2 px-1">
                      <span className="text-xs font-bold text-slate-800">{msg.name}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider select-none">
                        {formatMessageTime(messageTimestamp(msg))}
                      </span>
                    </div>

                    {/* Other Message Bubble Container */}
                    <div className="relative w-full">
                      {/* Other's Message Bubble */}
                      <div className="p-3 pr-10 rounded-2xl rounded-tl-none bg-white text-slate-800 border border-slate-200/90 shadow-sm text-sm break-words text-left relative w-full">
                        
                        {/* Permanent Controls inside the bubble corner to avoid overlap/hiding */}
                        <div className="absolute top-2.5 right-2.5 flex items-center select-none z-10">
                          <button
                            onClick={() => handleCopy(msg, key)}
                            className="p-0.5 text-slate-400 hover:text-slate-700 transition-colors"
                            title="Copy text"
                          >
                            <CopyIcon />
                            {copiedId === key && <span className="text-[8px] text-emerald-600 ml-0.5">✓</span>}
                          </button>
                        </div>

                        {isImage && (
                          <img
                            src={fileSrc}
                            alt={fileName || "attachment"}
                            className="rounded-lg mb-2 max-h-60 w-full object-contain border border-slate-100"
                            loading="lazy"
                          />
                        )}

                        {!isFile && (
                          <div className="whitespace-pre-wrap leading-relaxed font-semibold">
                            {renderFormattedMessage(msg.message)}
                          </div>
                        )}

                        {isFile && !isImage && (
                          <div>
                            {isAudio ? (
                              <div className="my-1">
                                <CustomAudioPlayer src={fileSrc} isOwn={false} />
                                <p className="text-[9px] mt-1 font-semibold text-slate-400 truncate max-w-[200px]">{fileName}</p>
                              </div>
                            ) : (
                              <div>
                                <p className="mb-1.5 font-semibold leading-relaxed">{msg.message}</p>
                                <a
                                  href={downloadHref}
                                  download
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center text-xs font-bold underline text-indigo-600 hover:text-indigo-700"
                                >
                                  Download Attachment
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}

        {/* Typing Feedback */}
        {feedback && (
          <li className="flex justify-start px-2 py-1 animate-pulse">
            <div className="flex gap-2 max-w-[80%] items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase bg-slate-200 text-slate-500 shadow-sm shrink-0 select-none">
                💬
              </div>
              <div className="p-2.5 rounded-2xl bg-white text-slate-500 rounded-bl-none border border-slate-200 shadow-sm text-xs flex items-center gap-2">
                <span className="font-semibold text-slate-700">{feedback}</span>
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          </li>
        )}

        {/* Auto Scroll Anchor */}
        <div ref={bottomRef}></div>
      </ul>
    );
  }
);

export default MessageList;
