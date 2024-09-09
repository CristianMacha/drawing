'use client'

import { useEffect } from "react";

export default function Home() {

  useEffect(() => {
    main()
  }, []);

  const main = () => {
    const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    let space = 70;
    let drawing = false;
    let initialX = 0;
    let initialY = 0;
    const rectangles: { x: number; y: number; height: number; width: number }[] = [];

    const startDrawing = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      initialX = clientX;
      initialY = clientY;
      drawing = true;
    };

    const draw = (e: MouseEvent) => {
      if (!drawing) return;
      const { clientX, clientY } = e;
      let dynamicHeight = clientY - initialY; // Ajustar la altura dinámicamente
      let dynamicWidth = clientX - initialX;

      // Asegurar que la altura sea al menos 50 píxeles
      if (Math.abs(dynamicHeight) < 140) {
        dynamicHeight = dynamicHeight < 0 ? -140 : 140;
      }
      // Limpiar el canvas antes de dibujar
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Redibujar todos los rectángulos anteriores
      rectangles.forEach(rect => {
        ctx.beginPath();
        ctx.moveTo(rect.x - space, rect.y);
        ctx.lineTo(rect.x + space, rect.y);
        ctx.lineTo(rect.x + space, rect.y + rect.height);
        ctx.lineTo(rect.x - space, rect.y + rect.height);
        ctx.lineTo(rect.x - space, rect.y);
        ctx.stroke();

        ctx.fillText(`${rect.height}px`, rect.x + space + 5, rect.y + rect.height / 2);
        ctx.fillText(`${rect.width}px`, rect.x - space / 2, rect.y - 5);
      });

      // Dibujar el rectángulo actual
      ctx.beginPath();
      ctx.moveTo(initialX - space, initialY);
      ctx.lineTo(initialX + space, initialY);
      ctx.lineTo(initialX + space, initialY + dynamicHeight);
      ctx.lineTo(initialX - space, initialY + dynamicHeight);
      ctx.lineTo(initialX - space, initialY);
      ctx.stroke();

       // Dibujar la rama del rectángulo principal
       if (Math.abs(dynamicWidth) > 0) {
        ctx.beginPath();
        ctx.moveTo(initialX, initialY + dynamicHeight / 2);
        ctx.lineTo(initialX + dynamicWidth, initialY + dynamicHeight / 2);
        ctx.lineTo(initialX + dynamicWidth, initialY + dynamicHeight / 2 + dynamicHeight);
        ctx.lineTo(initialX, initialY + dynamicHeight / 2 + dynamicHeight);
        ctx.lineTo(initialX, initialY + dynamicHeight / 2);
        ctx.stroke();

        // Agregar medidas a la rama
        ctx.fillText(`${dynamicHeight}px`, initialX + dynamicWidth + 5, initialY + dynamicHeight / 2 + dynamicHeight / 2);
        ctx.fillText(`${Math.abs(dynamicWidth)}px`, initialX + dynamicWidth / 2, initialY + dynamicHeight / 2 - 5);
      }

      ctx.fillText(`${dynamicHeight}px`, initialX + space + 5, initialY + dynamicHeight / 2);
      ctx.fillText(`${space * 2}px`, initialX - space / 2, initialY - 5);
    };

    const stopDrawing = (e: MouseEvent) => {
      if (drawing) {
        const { clientY } = e;
        let dynamicHeight = clientY - initialY;

        if (Math.abs(dynamicHeight) < 1400) {
          dynamicHeight = dynamicHeight < 0 ? -140 : 140;
        }

        rectangles.push({ x: initialX, y: initialY, height: dynamicHeight, width: space * 2 });
      }
      drawing = false;
      ctx.closePath();
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

  }


  const handleClick = (e: any, ctx: CanvasRenderingContext2D) => {
    console.log('click', e);
    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY);
    ctx.lineTo(e.clientX + 100, e.clientY + 100);
    ctx.stroke();
    ctx.closePath();
  }

  return (
    <main>
      <canvas id="myCanvas" onResize={() => console.log('resize')}></canvas>
    </main>
  );
}
