import { useState } from "react";
import CreateRoom from "../components/CreateRoom";
import JoinRoom from "../components/JoinRoom";
import { FiMessageCircle, FiPlus, FiArrowRight } from "react-icons/fi";

export default function Home({ onRoomJoined }) {
  const [page, setPage] = useState("");

  const goHome = () => setPage("");

  if (page === "create") {
    return <CreateRoom onRoomJoined={onRoomJoined} onBack={goHome} />;
  }

  if (page === "join") {
    return <JoinRoom onRoomJoined={onRoomJoined} onBack={goHome} />;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/70 p-8 text-center shadow-2xl shadow-slate-200/40 backdrop-blur-xl ring-1 ring-slate-200/50 relative overflow-hidden">
        
        {/* Decorative background glows */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl" />

        {/* Header */}
        <div className="mb-8 relative z-10">
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl text-white shadow-lg shadow-indigo-500/10">
            <FiMessageCircle />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Collaborative Rooms</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            Secure, temporary workspaces for your team
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-4 relative z-10">
          
          {/* Create Room Card */}
          <div
            onClick={() => setPage("create")}
            className="group flex justify-between items-center p-5 rounded-2xl border border-slate-200 bg-white/80 cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-50/10 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5"
          >
            <div className="text-left">
              <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">Create Workroom</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Start a fresh private workspace
              </p>
            </div>
            <span className="w-8 h-8 rounded-xl bg-slate-50 text-slate-450 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200 border border-slate-100">
              <FiPlus />
            </span>
          </div>

          {/* Join Room Card */}
          <div
            onClick={() => setPage("join")}
            className="group flex justify-between items-center p-5 rounded-2xl border border-slate-200 bg-white/80 cursor-pointer hover:border-violet-500/50 hover:bg-violet-50/10 transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/5 hover:-translate-y-0.5"
          >
            <div className="text-left">
              <h3 className="font-semibold text-slate-800 group-hover:text-violet-600 transition-colors">Join Workroom</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Access room with password
              </p>
            </div>
            <span className="w-8 h-8 rounded-xl bg-slate-50 text-slate-450 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-all duration-200 border border-slate-100">
              <FiArrowRight />
            </span>
          </div>

        </div>

        <p className="mt-8 text-[11px] text-slate-400 relative z-10 leading-relaxed font-medium">
          All workspace data (chat history, whiteboard draws, and file uploads) is automatically destroyed after 24 hours of inactivity.
        </p>
      </div>
    </div>
  );
}