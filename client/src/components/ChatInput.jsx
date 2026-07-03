import { useRef, useState, useEffect } from "react";

export default function ChatInput({
  sendMessage,
  sendFeedback,
  name,
  room,
  apiBase,
  disabled = false,
}) {
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSec, setRecordSec] = useState(0);
  const [showEmoji, setShowEmoji] = useState(false);

  const fileRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled || isRecording) return;
    if (!input.trim()) return;
    sendMessage(input.replace(/\r\n/g, "\n"));
    setInput("");
    sendFeedback("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (disabled || isRecording) return;
      if (!input.trim()) return;
      sendMessage(input.replace(/\r\n/g, "\n"));
      setInput("");
      sendFeedback("");
    }
  };

  const uploadFile = async (file) => {
    if (disabled || !file || !room) return;

    setUploading(true);
    sendFeedback("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("room", room);
      fd.append("userName", name || "Anonymous");
      const caption = input.trim();
      if (caption) fd.append("caption", caption);

      const res = await fetch(`${apiBase}/api/upload`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed");
      if (caption) setInput("");
    } catch (err) {
      const fallback =
        err?.message === "Failed to fetch"
          ? "Upload failed: backend unreachable or blocked by CORS. Check server URL and CORS settings."
          : err?.message || "Upload failed";
      alert(fallback);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) uploadFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const startRecording = async () => {
    if (disabled || uploading) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioFile = new File([audioBlob], `voice-note-${Date.now()}.webm`, {
          type: "audio/webm",
        });

        stream.getTracks().forEach((track) => track.stop());
        uploadFile(audioFile);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSec(0);

      timerRef.current = setInterval(() => {
        setRecordSec((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert("Microphone access denied or audio recording failed: " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const popularEmojis = [
    "😀", "😂", "🥰", "👍", "👎", "❤️", "🔥", "💻",
    "⭐", "🚀", "👏", "🎉", "👀", "🤔", "💡", "⚠️"
  ];

  const addEmoji = (emoji) => {
    setInput((prev) => prev + emoji);
    setShowEmoji(false);
  };

  return (
    <div
      className="w-full max-w-full relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-500 bg-indigo-50/90 text-indigo-900 backdrop-blur-sm pointer-events-none">
          <span className="text-xl mb-1 animate-bounce">📥</span>
          <span className="text-xs font-semibold">Drop file to attach</span>
        </div>
      )}

      {/* Hidden File input */}
      <input
        ref={fileRef}
        type="file"
        id="chat-file"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.gif,.webp,.zip,.rar,.7z,.tar,.gz"
        onChange={handleFileChange}
        disabled={uploading || disabled}
        className="hidden"
      />

      {/* Message Form */}
      <form
        onSubmit={handleSubmit}
        className={`flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm relative focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-150 ${disabled ? "opacity-60" : ""}`}
      >
        <textarea
          value={input}
          rows={2}
          disabled={disabled || isRecording}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => !disabled && sendFeedback(`${name} is typing a message`)}
          onKeyDown={(e) => {
            if (!disabled) sendFeedback(`✍ ${name} is typing a message`);
            handleKeyDown(e);
          }}
          onBlur={() => sendFeedback("")}
          placeholder={
            isRecording
              ? "Recording voice note..."
              : disabled
              ? "Waiting for connection…"
              : "Message or paste code — Ctrl+Enter to send"
          }
          className="w-full resize-none rounded-lg border-0 p-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:bg-slate-50 font-medium"
        />

        <div className="flex items-center justify-between border-t border-slate-100 pt-2 shrink-0 relative">
          <div className="flex items-center gap-1">
            {/* File input click label */}
            <label
              htmlFor="chat-file"
              className={`rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              title="Attach a file"
            >
              📎
            </label>

            {/* Emoji Toggle */}
            <button
              type="button"
              disabled={disabled}
              onClick={() => setShowEmoji(!showEmoji)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              title="Insert Emoji"
            >
              😀
            </button>

            {/* Emoji Picker Popup */}
            {showEmoji && (
              <div className="absolute bottom-full left-0 mb-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 grid grid-cols-4 gap-1 animate-in fade-in duration-100">
                {popularEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => addEmoji(emoji)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-lg hover:bg-slate-50 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Audio Recorder button */}
            {!isRecording ? (
              <button
                type="button"
                disabled={disabled || uploading}
                onClick={startRecording}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition-colors"
                title="Record Voice Note"
              >
                🎤
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg text-rose-600 font-semibold text-xs animate-pulse">
                <span className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-ping" />
                <span>REC {formatTime(recordSec)}</span>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="bg-rose-600 text-white rounded px-1.5 py-0.5 hover:bg-rose-700 transition"
                >
                  Stop
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {uploading && <span className="text-xs text-slate-400 animate-pulse font-semibold">Uploading...</span>}
            <button
              type="submit"
              disabled={uploading || disabled || isRecording}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white transition shadow-md shadow-indigo-600/10 border border-indigo-700 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </form>

      <p className="mt-2 text-center text-[10px] text-slate-400 sm:text-left font-medium">
        Tip: Ctrl+Enter to send · Drag files directly onto input area to attach
      </p>
    </div>
  );
}
