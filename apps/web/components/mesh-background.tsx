"use client";

import { useEffect, useRef } from "react";

type MeshPoint = {
  ox: number;
  oy: number;
  x: number;
  y: number;
};

type MouseState = {
  x: number;
  y: number;
  active: boolean;
};

const GRID_SPACING = 42;
const INFLUENCE_RADIUS = 220;
const MAX_FORCE = 36;
const LERP_FACTOR = 0.12;
const LINE_COLOR = "rgba(134, 239, 172, 0.9)";
const CANVAS_ALPHA = 0.06;

export function MeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<MouseState>({
    x: 0,
    y: 0,
    active: false
  });

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    const parent = canvas.parentElement;

    if (!context || !parent) {
      return;
    }

    let animationFrameId = 0;
    let rows = 0;
    let columns = 0;
    let points: MeshPoint[] = [];
    let width = 0;
    let height = 0;

    const mouse = mouseRef.current;

    const buildPoints = (nextWidth: number, nextHeight: number) => {
      columns = Math.ceil(nextWidth / GRID_SPACING) + 3;
      rows = Math.ceil(nextHeight / GRID_SPACING) + 3;
      points = [];

      for (let row = 0; row < rows; row += 1) {
        const oy = row * GRID_SPACING - GRID_SPACING;

        for (let column = 0; column < columns; column += 1) {
          const ox = column * GRID_SPACING - GRID_SPACING;
          points.push({ ox, oy, x: ox, y: oy });
        }
      }
    };

    const resizeCanvas = () => {
      const bounds = parent.getBoundingClientRect();
      const nextWidth = Math.max(Math.ceil(bounds.width), 1);
      const nextHeight = Math.max(Math.ceil(bounds.height), 1);
      const dpr = window.devicePixelRatio || 1;

      width = nextWidth;
      height = nextHeight;

      canvas.width = Math.round(nextWidth * dpr);
      canvas.height = Math.round(nextHeight * dpr);
      canvas.style.width = `${nextWidth}px`;
      canvas.style.height = `${nextHeight}px`;

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(dpr, dpr);

      buildPoints(nextWidth, nextHeight);

      if (!mouse.active) {
        mouse.x = nextWidth / 2;
        mouse.y = nextHeight / 2;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const bounds = parent.getBoundingClientRect();
      mouse.x = event.clientX - bounds.left;
      mouse.y = event.clientY - bounds.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = width / 2;
      mouse.y = height / 2;
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      
      // Glow radial sob a malha — só quando o mouse está ativo
      if (mouse.active) {
        const glowRadius = 180;
        const gradient = context.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, glowRadius
        );
        gradient.addColorStop(0, "rgba(34, 197, 94, 0.07)");
        gradient.addColorStop(1, "rgba(34, 197, 94, 0)");

        context.globalAlpha = 1;
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
      }

      context.globalAlpha = CANVAS_ALPHA;
      context.lineWidth = 1;
      context.strokeStyle = LINE_COLOR;

      for (let index = 0; index < points.length; index += 1) {
        const point = points[index];
        let targetX = point.ox;
        let targetY = point.oy;

        if (mouse.active) {
          const distanceX = point.ox - mouse.x;
          const distanceY = point.oy - mouse.y;
          const distance = Math.hypot(distanceX, distanceY);

          if (distance > 0 && distance < INFLUENCE_RADIUS) {
            const force = ((1 - distance / INFLUENCE_RADIUS) ** 2) * MAX_FORCE;
            const directionX = distanceX / distance;
            const directionY = distanceY / distance;

            targetX = point.ox - directionX * force;
            targetY = point.oy - directionY * force;
          }
        }

        point.x += (targetX - point.x) * LERP_FACTOR;
        point.y += (targetY - point.y) * LERP_FACTOR;
      }

      for (let row = 0; row < rows; row += 1) {
        let nearMouse = false;
        if (mouse.active) {
          for (let column = 0; column < columns; column += 1) {
            const point = points[row * columns + column];
            if (Math.hypot(point.ox - mouse.x, point.oy - mouse.y) < INFLUENCE_RADIUS) {
              nearMouse = true;
              break;
            }
          }
        }

        context.globalAlpha = nearMouse ? 0.13 : CANVAS_ALPHA;
        context.beginPath();

        for (let column = 0; column < columns; column += 1) {
          const point = points[row * columns + column];

          if (column === 0) {
            context.moveTo(point.x, point.y);
          } else {
            context.lineTo(point.x, point.y);
          }
        }

        context.stroke();
      }

      for (let column = 0; column < columns; column += 1) {
        let nearMouse = false;
        if (mouse.active) {
          for (let row = 0; row < rows; row += 1) {
            const point = points[row * columns + column];
            if (Math.hypot(point.ox - mouse.x, point.oy - mouse.y) < INFLUENCE_RADIUS) {
              nearMouse = true;
              break;
            }
          }
        }

        context.globalAlpha = nearMouse ? 0.13 : CANVAS_ALPHA;
        context.beginPath();

        for (let row = 0; row < rows; row += 1) {
          const point = points[row * columns + column];

          if (row === 0) {
            context.moveTo(point.x, point.y);
          } else {
            context.lineTo(point.x, point.y);
          }
        }

        context.stroke();
      }

      context.globalAlpha = 1;
      animationFrameId = window.requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);

    resizeObserver.observe(parent);
    resizeCanvas();
    draw();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("blur", handleMouseLeave);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("blur", handleMouseLeave);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
