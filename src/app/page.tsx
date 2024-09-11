"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    main();
  }, []);

  const main = () => {
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    let space = 70;
    let drawing = false;
    let initialX = 0;
    let initialY = 0;
    const rectangles: {
      x: number;
      y: number;
      height: number;
      width: number;
    }[] = [];

    const startDrawing = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      initialX = clientX;
      initialY = clientY;
      drawing = true;
    };

    const draw = (e: MouseEvent) => {
      if (!drawing) return;
      const { clientX, clientY } = e;
      let dynamicHeight = clientY - initialY;
      let dynamicWidth = clientX - initialX;

      if (Math.abs(dynamicHeight) < 140) {
        dynamicHeight = dynamicHeight < 0 ? -140 : 140;
      }
      if (Math.abs(dynamicWidth) < 140) {
        dynamicWidth = dynamicWidth < 0 ? -140 : 140;
      }

      const width = Math.abs(dynamicWidth);
      const height = Math.abs(dynamicHeight);

      const x = dynamicWidth < 0 ? initialX - width : initialX;
      const y = dynamicHeight < 0 ? initialY - height : initialY;

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      rectangles.forEach((rect) => {
        ctx.beginPath();
        ctx.moveTo(rect.x - space, rect.y);
        ctx.lineTo(rect.x + rect.width - space, rect.y);
        ctx.lineTo(rect.x + rect.width - space, rect.y + rect.height);
        ctx.lineTo(rect.x - space, rect.y + rect.height);
        ctx.lineTo(rect.x - space, rect.y);
        ctx.stroke();

        ctx.fillText(
          `${rect.height}px`,
          rect.x + rect.width - space + 5,
          rect.y + rect.height / 2,
        );
        ctx.fillText(`${rect.width}px`, rect.x - space / 2, rect.y - 5);
      });

      ctx.beginPath();
      ctx.moveTo(x - space, y);
      ctx.lineTo(x + width - space, y);
      ctx.lineTo(x + width - space, y + height);
      ctx.lineTo(x - space, y + height);
      ctx.lineTo(x - space, y);
      ctx.stroke();

      ctx.fillText(`${height}px`, x + width - space + 5, y + height / 2);
      ctx.fillText(`${width}px`, x - space / 2, y - 5);
    };

    const stopDrawing = (e: MouseEvent) => {
      if (drawing) {
        const { clientX, clientY } = e;
        let dynamicHeight = clientY - initialY;
        let dynamicWidth = clientX - initialX;

        if (Math.abs(dynamicHeight) < 140) {
          dynamicHeight = dynamicHeight < 0 ? -140 : 140;
        }
        if (Math.abs(dynamicWidth) < 140) {
          dynamicWidth = dynamicWidth < 0 ? -140 : 140;
        }

        const height = Math.abs(dynamicHeight);
        const width = Math.abs(dynamicWidth);

        const x = dynamicWidth < 0 ? initialX - width : initialX;
        const y = dynamicHeight < 0 ? initialY - height : initialY;

        rectangles.push({ x, y, height, width });
      }
      drawing = false;
      ctx.closePath();
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);
  };

  return (
    <main>
      <canvas id="myCanvas"></canvas>
    </main>
  );
}
