"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const MIN_SIZE = 50;
  const space = 0;

  const [rectangles, setRectangles] = useState<
    { x: number; y: number; width: number; height: number }[]
  >([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [contextMenuContent, setContextMenuContent] = useState({
    id: -1,
    x: 0,
    y: 0,
  });
  const [modalContent, setModalContent] = useState({
    id: -1,
    width: MIN_SIZE,
    height: MIN_SIZE,
    x: -1,
    y: -1,
  });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  let hasDragged = false;
  const [dragDirection, setDragDirection] = useState<
    "horizontal" | "vertical" | null
  >(null);
  const [directionX, setDirectionX] = useState<0 | 1>(0);
  const [directionY, setDirectionY] = useState<0 | 1>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const drawAllRectangles = () => {
      clearCanvas(ctx);
      drawRectangles(ctx);
    };

    const getMousePos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const startDrawing = (e: MouseEvent) => {
      if (e.button !== 0) return;

      const { x, y } = getMousePos(e);
      setInitialPos({ x, y });
      setIsDrawing(true);
      hasDragged = false;
      setDragDirection(null);
    };

    const draw = (e: MouseEvent) => {
      if (e.button !== 0 || !isDrawing) return;

      const { x, y } = getMousePos(e);
      hasDragged = true;

      if (dragDirection === null) {
        if (Math.abs(x - initialPos.x) > Math.abs(y - initialPos.y)) {
          setDragDirection("horizontal");
        } else {
          setDragDirection("vertical");
        }
      }

      if (x < initialPos.x) {
        setDirectionX(1);
      } else {
        setDirectionX(0);
      }

      if (y < initialPos.y) {
        setDirectionY(1);
      } else {
        setDirectionY(0);
      }

      let dynamicWidth = MIN_SIZE;
      let dynamicHeight = MIN_SIZE;
      let rectX = initialPos.x;
      let rectY = initialPos.y;

      if (dragDirection === "horizontal") {
        dynamicWidth = Math.max(MIN_SIZE, Math.abs(x - initialPos.x));
        rectX = x < initialPos.x ? initialPos.x - dynamicWidth : initialPos.x;
      } else if (dragDirection === "vertical") {
        dynamicHeight = Math.max(MIN_SIZE, Math.abs(y - initialPos.y));
        rectY = y < initialPos.y ? initialPos.y - dynamicHeight : initialPos.y;
      }

      drawAllRectangles();
      drawRectangle(ctx, rectX, rectY, dynamicWidth, dynamicHeight);
    };

    const stopDrawing = (e: MouseEvent) => {
      if (e.button !== 0 || !isDrawing) return;

      if (hasDragged) {
        const { x, y } = getMousePos(e);
        let width = MIN_SIZE;
        let height = MIN_SIZE;
        let rectX = initialPos.x;
        let rectY = initialPos.y;

        if (dragDirection === "horizontal") {
          width = Math.max(MIN_SIZE, Math.abs(x - initialPos.x));
          rectX = x < initialPos.x ? initialPos.x - width : initialPos.x;
        } else if (dragDirection === "vertical") {
          height = Math.max(MIN_SIZE, Math.abs(y - initialPos.y));
          rectY = y < initialPos.y ? initialPos.y - height : initialPos.y;
        }
        console.log(
          "Xi:",
          x,
          " Yi:",
          y,
          " w:",
          width,
          " h:",
          height,
          " DX:",
          directionX,
          " DY:",
          directionY
        );

        setRectangles((prevRects) => [
          ...prevRects,
          { x: rectX, y: rectY, width, height },
        ]);
      }
      setIsDrawing(false);
      hasDragged = false;
      drawAllRectangles();
    };

    const handleClick = (e: MouseEvent) => {
      if (e.button !== 0 || hasDragged) return;

      const { x, y } = getMousePos(e);
      detectTextClick(ctx, x, y);
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      if (e.button !== 2 || hasDragged) return;

      const { x, y } = getMousePos(e);
      const rectIndex = detectRectangleHover(x, y);
      if (rectIndex !== -1) {
        setContextMenuPosition({ x: e.clientX, y: e.clientY });
        setContextMenuContent({ id: rectIndex, x: e.clientX, y: e.clientY });
        setContextMenuVisible(true);
      }
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("dblclick", handleClick);
    canvas.addEventListener("contextmenu", handleContextMenu);

    drawAllRectangles();

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("dblclick", handleClick);
      canvas.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [isDrawing, rectangles, dragDirection, directionX, directionY]);

  const clearCanvas = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };

  const drawRectangle = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x - space, y);
    ctx.lineTo(x + width - space, y);
    ctx.lineTo(x + width - space, y + height);
    ctx.lineTo(x - space, y + height);
    ctx.lineTo(x - space, y);
    ctx.stroke();
    ctx.fillText(`${height} in`, x + width - space + 5, y + height / 2);
    ctx.fillText(`${width} in`, x - space / 2, y - 5);
  };

  const drawRectangles = (ctx: CanvasRenderingContext2D) => {
    rectangles.forEach((rect) => {
      drawRectangle(ctx, rect.x, rect.y, rect.width, rect.height);
    });
  };

  const detectTextClick = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ) => {
    rectangles.forEach((rect, index) => {
      const heightTextX = rect.x + rect.width - space + 5;
      const heightTextY = rect.y + rect.height / 2;
      const widthTextX = rect.x - space / 2;
      const widthTextY = rect.y - 5;

      if (
        x >= heightTextX &&
        x <= heightTextX + ctx.measureText(`${rect.height}px`).width &&
        y >= heightTextY - 8 &&
        y <= heightTextY + 8
      ) {
        setModalContent({
          id: index,
          width: rect.width,
          height: rect.height,
          x: rect.x,
          y: rect.y,
        });
        setModalVisible(true);
      }

      if (
        x >= widthTextX &&
        x <= widthTextX + ctx.measureText(`${rect.width}px`).width &&
        y >= widthTextY - 8 &&
        y <= widthTextY + 8
      ) {
        setModalContent({
          id: index,
          width: rect.width,
          height: rect.height,
          x: rect.x,
          y: rect.y,
        });
        setModalVisible(true);
      }
    });
  };

  const detectRectangleHover = (x: number, y: number) => {
    for (let i = 0; i < rectangles.length; i++) {
      const rect = rectangles[i];
      if (
        x >= rect.x &&
        x <= rect.x + rect.width &&
        y >= rect.y &&
        y <= rect.y + rect.height
      ) {
        return i;
      }
    }
    return -1;
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleSave = () => {
    if (modalContent.id !== -1) {
      setRectangles((prevRects) =>
        prevRects.map((rect, index) =>
          index === modalContent.id
            ? {
                ...rect,
                width: modalContent.width,
                height: modalContent.height,
                x: modalContent.x,
                y: modalContent.y,
              }
            : rect
        )
      );
    }
    setModalVisible(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = Number(value);
    setModalContent((prevContent) => ({
      ...prevContent,
      [name]: numericValue >= 0 ? numericValue : 0,
    }));
  };

  const handleEdit = () => {
    if (contextMenuContent.id !== -1) {
      const rect = rectangles[contextMenuContent.id];
      setModalContent({
        id: contextMenuContent.id,
        width: rect.width,
        height: rect.height,
        x: rect.x,
        y: rect.y,
      });
      setContextMenuVisible(false);
      setModalVisible(true);
    }
  };

  const handleDelete = () => {
    if (contextMenuContent.id !== -1) {
      setRectangles((prevRects) =>
        prevRects.filter((_, index) => index !== contextMenuContent.id)
      );
      setContextMenuVisible(false);
    }
  };

  return (
    <main>
      <canvas ref={canvasRef} id="canvas">
        Your browser does not support the HTML5 canvas tag.
      </canvas>

      {/* Modal */}
      {modalVisible && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeModal}
        >
          <div
            className="bg-white p-5 rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Edit Rectangle</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Pos. X:
                <input
                  type="number"
                  name="x"
                  value={modalContent.x}
                  onChange={handleInputChange}
                  className="ml-2 border border-gray-300 p-1"
                />
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Pos. Y:
                <input
                  type="number"
                  name="y"
                  value={modalContent.y}
                  onChange={handleInputChange}
                  className="ml-2 border border-gray-300 p-1"
                />
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Width:
                <input
                  type="number"
                  name="width"
                  value={modalContent.width}
                  onChange={handleInputChange}
                  className="ml-2 border border-gray-300 p-1"
                />
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Height:
                <input
                  type="number"
                  name="height"
                  value={modalContent.height}
                  onChange={handleInputChange}
                  className="ml-2 border border-gray-300 p-1"
                />
              </label>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white py-1 px-4 rounded"
              >
                Save
              </button>
              <button
                onClick={closeModal}
                className="bg-red-500 text-white py-1 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu Modal */}
      {contextMenuVisible && contextMenuPosition && (
        <div
          className="fixed"
          style={{
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
            backgroundColor: "white",
            border: "1px solid #ccc",
            padding: "10px",
            borderRadius: "5px",
            zIndex: 1000,
          }}
        >
          <ul className="list-none m-0 p-0">
            <li>
              <button
                onClick={handleEdit}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Edit
              </button>
            </li>
            <li>
              <button
                onClick={handleDelete}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Delete
              </button>
            </li>
          </ul>
        </div>
      )}
    </main>
  );
}
