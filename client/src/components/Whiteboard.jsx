import { useEffect, useRef, useState } from "react";
import socket from "../socket";

export default function Whiteboard({ room, onClose }) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const drawingPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Support high PPI displays
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const context = canvas.getContext("2d");
    context.scale(2, 2);
    context.lineCap = "round";
    context.lineJoin = "round";
    contextRef.current = context;

    // Load initial whiteboard styling (white canvas background)
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, rect.width, rect.height);
  }, []);

  // Sync incoming draw strokes from Socket.IO
  useEffect(() => {
    const handleRemoteDraw = (drawData) => {
      const context = contextRef.current;
      if (!context) return;

      const { prevX, prevY, x, y, color: drawColor, size } = drawData;
      context.beginPath();
      context.strokeStyle = drawColor;
      context.lineWidth = size;
      context.moveTo(prevX, prevY);
      context.lineTo(x, y);
      context.stroke();
    };

    const handleRemoteClear = () => {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (!canvas || !context) return;
      const rect = canvas.getBoundingClientRect();
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, rect.width, rect.height);
    };

    socket.on("draw", handleRemoteDraw);
    socket.on("clear-canvas", handleRemoteClear);

    return () => {
      socket.off("draw", handleRemoteDraw);
      socket.off("clear-canvas", handleRemoteClear);
    };
  }, []);

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      
      // Save canvas contents before resize
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.drawImage(canvas, 0, 0);

      // Resize
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const context = canvas.getContext("2d");
      context.scale(2, 2);
      context.lineCap = "round";
      context.lineJoin = "round";
      contextRef.current = context;
      
      // Restore content
      context.drawImage(tempCanvas, 0, 0, rect.width, rect.height);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    // Support both mouse and touch events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    drawingPos.current = { x, y };
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const context = contextRef.current;
    if (!context) return;

    const { x, y } = getCoordinates(e);
    const prevPos = drawingPos.current;

    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    context.moveTo(prevPos.x, prevPos.y);
    context.lineTo(x, y);
    context.stroke();

    // Broadcast stroke to other users in room
    socket.emit("draw", {
      password: room,
      drawData: {
        prevX: prevPos.x,
        prevY: prevPos.y,
        x,
        y,
        color,
        size: brushSize,
      },
    });

    drawingPos.current = { x, y };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;
    
    const rect = canvas.getBoundingClientRect();
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, rect.width, rect.height);

    socket.emit("clear-canvas", { password: room });
  };

  const colors = [
    { name: "Black", hex: "#000000" },
    { name: "Red", hex: "#e11d48" },
    { name: "Blue", hex: "#2563eb" },
    { name: "Green", hex: "#16a34a" },
    { name: "Yellow", hex: "#ca8a04" },
    { name: "Eraser", hex: "#ffffff" },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-slate-50 border-t border-slate-200 lg:border-t-0 lg:border-l lg:w-[450px] shrink-0">
      
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white p-3 shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs text-slate-500 uppercase tracking-wider">Whiteboard</span>
          
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            {colors.map((c) => (
              <button
                key={c.hex}
                onClick={() => setColor(c.hex)}
                className={`relative h-6 w-6 rounded-full border transition hover:scale-110 ${
                  color === c.hex ? "ring-2 ring-slate-900 scale-105" : "border-slate-200"
                }`}
                style={{ backgroundColor: c.hex === "#ffffff" ? "#f8fafc" : c.hex }}
                title={c.name}
              >
                {c.hex === "#ffffff" && <span className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-500">🧼</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-slate-500">Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="h-1.5 w-16 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-slate-800"
            />
          </div>

          <button
            onClick={clearCanvas}
            className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
          >
            Clear
          </button>
          
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Canvas Drawing Area */}
      <div className="relative flex-1 overflow-hidden bg-white p-2">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="h-full w-full rounded-xl border border-slate-200 cursor-crosshair shadow-inner"
        />
      </div>
    </div>
  );
}
