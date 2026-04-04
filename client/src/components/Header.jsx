export default function Header({ room, users = [], onLeave }) {
  const count = Array.isArray(users) ? users.length : 0;

  return (
    <div className="bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between">
      <button onClick={onLeave} className="text-sm text-gray-600 hover:text-black">
        ← Back
      </button>

      <div className="flex flex-col items-center">
        <h2 className="text-lg font-semibold">
          Room: <span className="text-gray-600">{room}</span>
        </h2>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-500">
            <span className="font-semibold text-black">{count}</span>{" "}
            {count === 1 ? "user" : "users"} online
          </span>
        </div>
      </div>

      <div className="w-10" />
    </div>
  );
}