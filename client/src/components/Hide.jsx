export default function Hide() {
  return (
    <div className="flex justify-center items-center gap-10 px-4 py-2">
      
      {/* Black Screen */}
      <div className="group">
        <button className="px-3 py-1 text-sm bg-gray-200 text-black rounded-md shadow-sm hover:bg-gray-300 transition">
          Black Screen
        </button>

        <div className="hidden group-hover:block fixed inset-0 bg-black z-[9999] cursor-none" />
      </div>

      {/* No Internet */}
      <div className="group">
        <button className="px-3 py-1 text-sm bg-gray-200 text-black rounded-md shadow-sm hover:bg-gray-300 transition">
          No Internet
        </button>

        <div className="hidden group-hover:block fixed inset-0 z-[9999]">
          <img
            src="No-internet.png"
            alt="preview"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

    </div>
  );
}