"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react";

const BLOCK_SIZE = 212;
const INTERVAL_MS = 8;

export type CheckerboardOverlayHandle = {
  startUncovering: () => void;
};

type CheckerboardOverlayProps = {
  active: boolean;
  onCovered?: () => void;
  onDone?: () => void;
};

type OverlayPhase = "idle" | "covering" | "covered" | "uncovering";

export const CheckerboardOverlay = forwardRef<
  CheckerboardOverlayHandle,
  CheckerboardOverlayProps
>(function CheckerboardOverlay({ active, onCovered, onDone }, ref) {
  const [visibleBlocks, setVisibleBlocks] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<OverlayPhase>("idle");
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const shuffledOrder = useRef<number[]>([]);
  const intervalRef = useRef<number | null>(null);
  const coveredCalledRef = useRef(false);
  const doneCalledRef = useRef(false);

  const { cols, rows, blocks } = useMemo(() => {
    if (viewport.width === 0 || viewport.height === 0) {
      return { cols: 0, rows: 0, blocks: [] as Array<{ index: number; left: number; top: number }> };
    }

    const nextCols = Math.ceil(viewport.width / BLOCK_SIZE) + 1;
    const nextRows = Math.ceil(viewport.height / BLOCK_SIZE) + 1;
    const nextBlocks = Array.from({ length: nextCols * nextRows }, (_, index) => ({
      index,
      left: (index % nextCols) * BLOCK_SIZE,
      top: Math.floor(index / nextCols) * BLOCK_SIZE
    }));

    return { cols: nextCols, rows: nextRows, blocks: nextBlocks };
  }, [viewport.height, viewport.width]);

  useImperativeHandle(ref, () => ({
    startUncovering: () => {
      if (shuffledOrder.current.length > 0) {
        setPhase("uncovering");
      }
    }
  }));

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!active || phase !== "idle" || blocks.length === 0) {
      return;
    }

    const order = Array.from({ length: blocks.length }, (_, index) => index);

    for (let index = order.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
    }

    shuffledOrder.current = order;
    coveredCalledRef.current = false;
    doneCalledRef.current = false;
    setVisibleBlocks(new Set());
    setPhase("covering");
  }, [active, blocks.length, phase]);

  useEffect(() => {
    if (
      phase === "covering" &&
      blocks.length > 0 &&
      !coveredCalledRef.current &&
      visibleBlocks.size >= Math.ceil(blocks.length * 0.75)
    ) {
      coveredCalledRef.current = true;
      onCovered?.();
    }
  }, [blocks.length, onCovered, phase, visibleBlocks]);

  useEffect(() => {
    if (phase === "uncovering" && !doneCalledRef.current && visibleBlocks.size === 0) {
      doneCalledRef.current = true;

      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      shuffledOrder.current = [];
      coveredCalledRef.current = false;
      setPhase("idle");
      onDone?.();
    }
  }, [onDone, phase, visibleBlocks]);

  useEffect(() => {
    if (phase !== "covering" && phase !== "uncovering") {
      return;
    }

    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
    }

    const order = phase === "covering"
      ? shuffledOrder.current
      : [...shuffledOrder.current].reverse();

    let pointer = 0;
    const total = order.length;

    intervalRef.current = window.setInterval(() => {
      const blockIndex = order[pointer];

      if (blockIndex === undefined) {
        if (intervalRef.current !== null) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        if (phase === "covering") {
          setPhase("covered");
        } else {
          setVisibleBlocks(new Set());
        }

        return;
      }

      setVisibleBlocks((current) => {
        const next = new Set(current);

        if (phase === "covering") {
          next.add(blockIndex);
        } else {
          next.delete(blockIndex);
        }

        return next;
      });

      pointer += 1;
    }, INTERVAL_MS);

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [onCovered, onDone, phase]);

  return (
    <>
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-50 overflow-hidden ${
          active ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {blocks.map((block) =>
          visibleBlocks.has(block.index) ? (
            <div
              key={block.index}
              className="checkerboard-block absolute"
              style={{
                width: BLOCK_SIZE,
                height: BLOCK_SIZE,
                left: block.left,
                top: block.top
              }}
            />
          ) : null
        )}
      </div>
      <style jsx>{`
        .checkerboard-block {
          background: #050505;
          border: 1px solid rgba(34, 197, 94, 0.15);
        }

        .checkerboard-block::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 1px;
          background: rgba(134, 239, 172, 0.12);
          animation: checkerboard-scan 1.2s linear infinite;
        }

        @keyframes checkerboard-scan {
          from {
            top: 0%;
          }
          to {
            top: 100%;
          }
        }
      `}</style>
    </>
  );
});
