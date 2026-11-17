"use client";

import {
  MouseEvent as ReactMouseEvent,
  useRef,
  useState,
} from "react";

import { useEditorStore } from "@/store/useEditorStore";
import { EditorElement } from "@/types/editor";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function Canvas() {
  const canvasRef = useRef<HTMLDivElement>(null);

  const {
    activeTool,
    elements,
    selectedElementId,
    zoom,
    showGrid,
    snapToGrid,
    addElement,
    updateElement,
    selectElement,
    setActiveTool,
  } = useEditorStore();

  const [draggingId, setDraggingId] = useState<string | null>(null);

  const [dragOffset, setDragOffset] = useState({
    x: 0,
    y: 0,
  });

  const getCanvasPosition = (
    event: ReactMouseEvent<HTMLDivElement>
  ) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return {
        x: 0,
        y: 0,
      };
    }

    const rect = canvas.getBoundingClientRect();

    let x = (event.clientX - rect.left) / zoom;
    let y = (event.clientY - rect.top) / zoom;

    if (snapToGrid) {
      const gridSize = 10;

      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
    }

    return {
      x,
      y,
    };
  };

  const createElement = (
    type: EditorElement["type"],
    x: number,
    y: number
  ) => {
    const base: EditorElement = {
      id: createId(),

      type,

      name:
        type.charAt(0).toUpperCase() +
        type.slice(1),

      x,
      y,

      width: 160,
      height: 120,

      rotation: 0,
      opacity: 100,

      visible: true,
      locked: false,

      fill: "#6C5DD3",

      stroke: "#6C5DD3",
      strokeWidth: 0,

      borderRadius: 12,
    };

    if (type === "rectangle") {
      base.width = 180;
      base.height = 120;
      base.borderRadius = 12;
    }

    if (type === "circle") {
      base.width = 140;
      base.height = 140;
      base.borderRadius = 9999;
    }

    if (type === "frame") {
      base.width = 420;
      base.height = 280;

      base.fill = "#FFFFFF";

      base.stroke = "#D9DCE5";
      base.strokeWidth = 1;

      base.borderRadius = 0;
    }

    if (type === "text") {
      base.width = 240;
      base.height = 50;

      base.text = "Type something";

      base.fontSize = 28;
      base.fontWeight = 600;

      base.textAlign = "left";

      base.color = "#111827";

      base.fill = "transparent";
    }

    if (type === "line") {
      base.width = 180;
      base.height = 2;

      base.fill = "#111827";
      base.borderRadius = 0;
    }

    addElement(base);
  };

  const handleCanvasClick = (
    event: ReactMouseEvent<HTMLDivElement>
  ) => {
    if (event.target !== event.currentTarget) return;

    if (activeTool === "select") {
      selectElement(null);
      return;
    }

    const { x, y } = getCanvasPosition(event);

    if (
      activeTool === "frame" ||
      activeTool === "text" ||
      activeTool === "rectangle" ||
      activeTool === "circle" ||
      activeTool === "line"
    ) {
      createElement(activeTool, x, y);

      setActiveTool("select");
    }
  };

  const handleElementMouseDown = (
    event: ReactMouseEvent<HTMLDivElement>,
    element: EditorElement
  ) => {
    event.stopPropagation();

    if (element.locked) return;

    selectElement(element.id);

    if (activeTool !== "select") return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    const mouseX =
      (event.clientX - rect.left) / zoom;

    const mouseY =
      (event.clientY - rect.top) / zoom;

    setDragOffset({
      x: mouseX - element.x,
      y: mouseY - element.y,
    });

    setDraggingId(element.id);
  };

  const handleMouseMove = (
    event: ReactMouseEvent<HTMLDivElement>
  ) => {
    if (!draggingId) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const element = elements.find(
      (item) => item.id === draggingId
    );

    if (!element || element.locked) return;

    const rect = canvas.getBoundingClientRect();

    let x =
      (event.clientX - rect.left) / zoom -
      dragOffset.x;

    let y =
      (event.clientY - rect.top) / zoom -
      dragOffset.y;

    if (snapToGrid) {
      const gridSize = 10;

      x =
        Math.round(x / gridSize) *
        gridSize;

      y =
        Math.round(y / gridSize) *
        gridSize;
    }

    x = Math.max(
      0,
      Math.min(x, 1080 - element.width)
    );

    y = Math.max(
      0,
      Math.min(y, 720 - element.height)
    );

    updateElement(element.id, {
      x,
      y,
    });
  };

  const stopDragging = () => {
    setDraggingId(null);
  };

  return (
    <section className="workspace-scroll relative h-full min-w-0 flex-1 overflow-auto bg-[#F4F5F7]">

      {/* Workspace Area */}
      <div className="flex min-h-full min-w-[1150px] items-start justify-center px-16 py-8">

        {/* Zoom Wrapper */}
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
          }}
        >
          {/* Canvas */}
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
            className="relative h-[720px] w-[1080px] overflow-hidden bg-white shadow-[0_20px_60px_rgba(17,24,39,0.08)]"
            style={
              showGrid
                ? {
                    backgroundImage: `
                      linear-gradient(#EDEEF2 1px, transparent 1px),
                      linear-gradient(90deg, #EDEEF2 1px, transparent 1px)
                    `,
                    backgroundSize: "20px 20px",
                  }
                : undefined
            }
          >

            {/* Empty State */}
            {elements.length === 0 && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">

                <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#F1EBFF]">
                  <img
                    src="/images/favicon.svg"
                    alt="DesignHub"
                    className="h-10 w-auto"
                  />
                </div>

                <h1 className="mt-6 text-[30px] font-bold tracking-[-1px] text-[#111827]">
                  Welcome to Design
                  <span className="text-[#6C5DD3]">
                    Hub
                  </span>
                </h1>

                <p className="mt-3 max-w-[500px] text-center text-[15px] leading-7 text-[#6B7280]">
                  Choose a tool from the left sidebar and click anywhere
                  on the canvas to start designing.
                </p>

              </div>
            )}

            {/* Elements */}
            {elements
              .filter((element) => element.visible)
              .map((element) => {
                const selected =
                  selectedElementId === element.id;

                return (
                  <div
                    key={element.id}
                    onMouseDown={(event) =>
                      handleElementMouseDown(
                        event,
                        element
                      )
                    }
                    style={{
                      position: "absolute",

                      left: element.x,
                      top: element.y,

                      width: element.width,
                      height: element.height,

                      opacity:
                        element.opacity / 100,

                      transform: `rotate(${element.rotation}deg)`,

                      cursor: element.locked
                        ? "not-allowed"
                        : activeTool === "select"
                        ? draggingId === element.id
                          ? "grabbing"
                          : "grab"
                        : "default",

                      zIndex:
                        selectedElementId ===
                        element.id
                          ? 10
                          : 1,
                    }}
                    className={
                      selected
                        ? "outline outline-2 outline-[#6C5DD3] outline-offset-2"
                        : ""
                    }
                  >

                    {/* Rectangle */}
                    {element.type ===
                      "rectangle" && (
                      <div
                        className="h-full w-full"
                        style={{
                          backgroundColor:
                            element.fill,

                          borderRadius:
                            element.borderRadius,

                          border:
                            element.strokeWidth
                              ? `${element.strokeWidth}px solid ${element.stroke}`
                              : "none",
                        }}
                      />
                    )}

                    {/* Circle */}
                    {element.type ===
                      "circle" && (
                      <div
                        className="h-full w-full rounded-full"
                        style={{
                          backgroundColor:
                            element.fill,

                          border:
                            element.strokeWidth
                              ? `${element.strokeWidth}px solid ${element.stroke}`
                              : "none",
                        }}
                      />
                    )}

                    {/* Frame */}
                    {element.type ===
                      "frame" && (
                      <div
                        className="h-full w-full"
                        style={{
                          backgroundColor:
                            element.fill,

                          border: `${element.strokeWidth ?? 1}px solid ${
                            element.stroke ??
                            "#D9DCE5"
                          }`,
                        }}
                      />
                    )}

                    {/* Line */}
                    {element.type ===
                      "line" && (
                      <div
                        className="h-full w-full"
                        style={{
                          backgroundColor:
                            element.fill,
                        }}
                      />
                    )}

                    {/* Text */}
                    {element.type ===
                      "text" && (
                      <div
                        className="h-full w-full overflow-hidden"
                        style={{
                          fontSize:
                            element.fontSize,

                          fontWeight:
                            element.fontWeight,

                          color:
                            element.color,

                          textAlign:
                            element.textAlign,

                          lineHeight: 1.2,

                          userSelect: "none",
                        }}
                      >
                        {element.text}
                      </div>
                    )}

                    {/* Image */}
                    {element.type ===
                      "image" &&
                      element.src && (
                        <img
                          src={element.src}
                          alt={element.name}
                          draggable={false}
                          className="h-full w-full object-cover"
                        />
                      )}

                    {/* Selection corners */}
                    {selected && (
                      <>
                        <div className="absolute -left-[5px] -top-[5px] h-[9px] w-[9px] rounded-[2px] border border-[#6C5DD3] bg-white" />

                        <div className="absolute -right-[5px] -top-[5px] h-[9px] w-[9px] rounded-[2px] border border-[#6C5DD3] bg-white" />

                        <div className="absolute -bottom-[5px] -left-[5px] h-[9px] w-[9px] rounded-[2px] border border-[#6C5DD3] bg-white" />

                        <div className="absolute -bottom-[5px] -right-[5px] h-[9px] w-[9px] rounded-[2px] border border-[#6C5DD3] bg-white" />
                      </>
                    )}

                  </div>
                );
              })}

          </div>

        </div>

      </div>

    </section>
  );
}