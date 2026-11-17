"use client";

import {
  Copy,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
} from "lucide-react";

import { useEditorStore } from "@/store/useEditorStore";

export default function RightPanel() {
  const {
    elements,
    selectedElementId,
    updateElement,
    removeElement,
    showGrid,
    snapToGrid,
    toggleGrid,
    toggleSnap,
    addElement,
    selectElement,
  } = useEditorStore();

  const selectedElement = elements.find(
    (element) => element.id === selectedElementId
  );

  const duplicateElement = () => {
    if (!selectedElement) return;

    const duplicate = {
      ...selectedElement,
      id: `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`,
      name: `${selectedElement.name} Copy`,
      x: selectedElement.x + 20,
      y: selectedElement.y + 20,
    };

    addElement(duplicate);
  };

  const deleteElement = () => {
    if (!selectedElement) return;

    removeElement(selectedElement.id);
    selectElement(null);
  };

  return (
    <aside className="workspace-scroll h-full w-[300px] shrink-0 border-l border-[#E8E8ED] bg-white">

      {/* Tabs */}
      <div className="flex h-14 items-center border-b border-[#EEEEF2] px-5">

        <button className="h-full border-b-2 border-[#6C5DD3] px-1 text-sm font-semibold text-[#6C5DD3]">
          Design
        </button>

        <button className="ml-7 h-full px-1 text-sm text-[#8B8F99]">
          Prototype
        </button>

        <button className="ml-7 h-full px-1 text-sm text-[#8B8F99]">
          Inspect
        </button>

      </div>

      <div className="p-5">

        {/* ================================================= */}
        {/* NOTHING SELECTED */}
        {/* ================================================= */}

        {!selectedElement && (
          <>
            {/* Page */}
            <section>
              <h3 className="text-sm font-semibold text-[#111827]">
                Page
              </h3>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-[#E5E7EB] px-3 py-3">

                <div className="flex items-center gap-3">

                  <div className="h-5 w-5 rounded-md border border-[#D1D5DB] bg-[#F7F8FA]" />

                  <span className="text-xs font-medium text-[#374151]">
                    F7F8FA
                  </span>

                </div>

                <span className="text-xs text-[#9CA3AF]">
                  100%
                </span>

                <Eye
                  size={15}
                  className="text-[#9CA3AF]"
                />

              </div>
            </section>

            {/* Canvas */}
            <section className="mt-7 border-t border-[#EEEEF2] pt-6">

              <h3 className="text-sm font-semibold text-[#111827]">
                Canvas
              </h3>

              <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-[#4B5563]">

                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={toggleGrid}
                  className="h-4 w-4 accent-[#6C5DD3]"
                />

                Show Grid

              </label>

              <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-[#4B5563]">

                <input
                  type="checkbox"
                  checked={snapToGrid}
                  onChange={toggleSnap}
                  className="h-4 w-4 accent-[#6C5DD3]"
                />

                Snap to Grid

              </label>

            </section>

            {/* Background */}
            <section className="mt-7 border-t border-[#EEEEF2] pt-6">

              <h3 className="text-sm font-semibold text-[#111827]">
                Background
              </h3>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-[#E5E7EB] px-3 py-3">

                <div className="flex items-center gap-3">

                  <div className="h-5 w-5 rounded-md border border-[#D1D5DB] bg-white" />

                  <span className="text-xs font-medium text-[#374151]">
                    FFFFFF
                  </span>

                </div>

                <span className="text-xs text-[#9CA3AF]">
                  100%
                </span>

                <Eye
                  size={15}
                  className="text-[#9CA3AF]"
                />

              </div>

            </section>
          </>
        )}

        {/* ================================================= */}
        {/* SELECTED ELEMENT */}
        {/* ================================================= */}

        {selectedElement && (
          <>
            {/* Element Header */}
            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
                  Selected
                </p>

                <h3 className="mt-1 text-sm font-semibold capitalize text-[#111827]">
                  {selectedElement.name}
                </h3>
              </div>

              <div className="flex items-center gap-1">

                {/* Visible */}
                <button
                  onClick={() =>
                    updateElement(selectedElement.id, {
                      visible: !selectedElement.visible,
                    })
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-[#F5F5F8]"
                  title={
                    selectedElement.visible
                      ? "Hide"
                      : "Show"
                  }
                >
                  {selectedElement.visible ? (
                    <Eye size={15} />
                  ) : (
                    <EyeOff size={15} />
                  )}
                </button>

                {/* Lock */}
                <button
                  onClick={() =>
                    updateElement(selectedElement.id, {
                      locked: !selectedElement.locked,
                    })
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-[#F5F5F8]"
                  title={
                    selectedElement.locked
                      ? "Unlock"
                      : "Lock"
                  }
                >
                  {selectedElement.locked ? (
                    <Lock size={15} />
                  ) : (
                    <Unlock size={15} />
                  )}
                </button>

                {/* Duplicate */}
                <button
                  onClick={duplicateElement}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-[#F5F5F8]"
                  title="Duplicate"
                >
                  <Copy size={15} />
                </button>

                {/* Delete */}
                <button
                  onClick={deleteElement}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#EF4444] transition hover:bg-[#FEF2F2]"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>

              </div>
            </div>

            {/* Position */}
            <section className="mt-6 border-t border-[#EEEEF2] pt-5">

              <h4 className="mb-4 text-xs font-semibold text-[#111827]">
                Position
              </h4>

              <div className="grid grid-cols-2 gap-3">

                <PropertyNumber
                  label="X"
                  value={selectedElement.x}
                  onChange={(value) =>
                    updateElement(
                      selectedElement.id,
                      { x: value }
                    )
                  }
                />

                <PropertyNumber
                  label="Y"
                  value={selectedElement.y}
                  onChange={(value) =>
                    updateElement(
                      selectedElement.id,
                      { y: value }
                    )
                  }
                />

              </div>

            </section>

            {/* Size */}
            <section className="mt-6 border-t border-[#EEEEF2] pt-5">

              <h4 className="mb-4 text-xs font-semibold text-[#111827]">
                Size
              </h4>

              <div className="grid grid-cols-2 gap-3">

                <PropertyNumber
                  label="W"
                  value={selectedElement.width}
                  min={1}
                  onChange={(value) =>
                    updateElement(
                      selectedElement.id,
                      { width: value }
                    )
                  }
                />

                <PropertyNumber
                  label="H"
                  value={selectedElement.height}
                  min={1}
                  onChange={(value) =>
                    updateElement(
                      selectedElement.id,
                      { height: value }
                    )
                  }
                />

              </div>

            </section>

            {/* Appearance */}
            <section className="mt-6 border-t border-[#EEEEF2] pt-5">

              <h4 className="mb-4 text-xs font-semibold text-[#111827]">
                Appearance
              </h4>

              {/* Opacity */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-[#6B7280]">
                    Opacity
                  </span>

                  <span className="text-xs font-medium text-[#111827]">
                    {selectedElement.opacity}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedElement.opacity}
                  onChange={(event) =>
                    updateElement(
                      selectedElement.id,
                      {
                        opacity: Number(
                          event.target.value
                        ),
                      }
                    )
                  }
                  className="w-full accent-[#6C5DD3]"
                />
              </div>

              {/* Fill */}
              {selectedElement.type !== "text" && (
                <div className="mt-5">

                  <p className="mb-2 text-xs text-[#6B7280]">
                    Fill
                  </p>

                  <ColorInput
                    value={
                      selectedElement.fill ||
                      "#6C5DD3"
                    }
                    onChange={(value) =>
                      updateElement(
                        selectedElement.id,
                        { fill: value }
                      )
                    }
                  />

                </div>
              )}

              {/* Radius */}
              {selectedElement.type !== "line" &&
                selectedElement.type !== "text" && (
                  <div className="mt-5">

                    <PropertyNumber
                      label="Radius"
                      value={
                        selectedElement.borderRadius ||
                        0
                      }
                      min={0}
                      onChange={(value) =>
                        updateElement(
                          selectedElement.id,
                          {
                            borderRadius:
                              value,
                          }
                        )
                      }
                    />

                  </div>
                )}

            </section>

            {/* Stroke */}
            {selectedElement.type !== "text" && (
              <section className="mt-6 border-t border-[#EEEEF2] pt-5">

                <h4 className="mb-4 text-xs font-semibold text-[#111827]">
                  Stroke
                </h4>

                <ColorInput
                  value={
                    selectedElement.stroke ||
                    "#6C5DD3"
                  }
                  onChange={(value) =>
                    updateElement(
                      selectedElement.id,
                      { stroke: value }
                    )
                  }
                />

                <div className="mt-3">

                  <PropertyNumber
                    label="Width"
                    value={
                      selectedElement.strokeWidth ||
                      0
                    }
                    min={0}
                    onChange={(value) =>
                      updateElement(
                        selectedElement.id,
                        {
                          strokeWidth:
                            value,
                        }
                      )
                    }
                  />

                </div>

              </section>
            )}

            {/* Text Properties */}
            {selectedElement.type === "text" && (
              <section className="mt-6 border-t border-[#EEEEF2] pt-5">

                <h4 className="mb-4 text-xs font-semibold text-[#111827]">
                  Typography
                </h4>

                <textarea
                  value={selectedElement.text || ""}
                  onChange={(event) =>
                    updateElement(
                      selectedElement.id,
                      {
                        text: event.target.value,
                      }
                    )
                  }
                  className="min-h-[76px] w-full resize-none rounded-xl border border-[#E5E7EB] p-3 text-xs outline-none transition focus:border-[#6C5DD3]"
                />

                <div className="mt-4 grid grid-cols-2 gap-3">

                  <PropertyNumber
                    label="Size"
                    value={
                      selectedElement.fontSize ||
                      16
                    }
                    min={1}
                    onChange={(value) =>
                      updateElement(
                        selectedElement.id,
                        {
                          fontSize: value,
                        }
                      )
                    }
                  />

                  <PropertyNumber
                    label="Weight"
                    value={
                      selectedElement.fontWeight ||
                      400
                    }
                    min={100}
                    max={900}
                    step={100}
                    onChange={(value) =>
                      updateElement(
                        selectedElement.id,
                        {
                          fontWeight:
                            value,
                        }
                      )
                    }
                  />

                </div>

                <div className="mt-4">

                  <p className="mb-2 text-xs text-[#6B7280]">
                    Text Color
                  </p>

                  <ColorInput
                    value={
                      selectedElement.color ||
                      "#111827"
                    }
                    onChange={(value) =>
                      updateElement(
                        selectedElement.id,
                        { color: value }
                      )
                    }
                  />

                </div>

                {/* Align */}
                <div className="mt-4">

                  <p className="mb-2 text-xs text-[#6B7280]">
                    Alignment
                  </p>

                  <div className="grid grid-cols-3 gap-2">

                    {[
                      "left",
                      "center",
                      "right",
                    ].map((align) => (
                      <button
                        key={align}
                        onClick={() =>
                          updateElement(
                            selectedElement.id,
                            {
                              textAlign:
                                align as
                                  | "left"
                                  | "center"
                                  | "right",
                            }
                          )
                        }
                        className={`h-9 rounded-lg border text-xs capitalize transition ${
                          selectedElement.textAlign ===
                          align
                            ? "border-[#6C5DD3] bg-[#F1EDFF] font-semibold text-[#6C5DD3]"
                            : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8F8FA]"
                        }`}
                      >
                        {align}
                      </button>
                    ))}

                  </div>

                </div>

              </section>
            )}

          </>
        )}

      </div>

    </aside>
  );
}

/* ================================================= */
/* NUMBER INPUT */
/* ================================================= */

function PropertyNumber({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="flex h-10 items-center rounded-lg border border-[#E5E7EB] bg-white focus-within:border-[#6C5DD3]">

      <span className="w-8 shrink-0 text-center text-[11px] font-medium text-[#9CA3AF]">
        {label}
      </span>

      <input
        type="number"
        value={Math.round(value)}
        min={min}
        max={max}
        step={step}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        className="h-full min-w-0 flex-1 bg-transparent pr-2 text-xs text-[#111827] outline-none"
      />

    </div>
  );
}

/* ================================================= */
/* COLOR INPUT */
/* ================================================= */

function ColorInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex h-10 items-center gap-3 rounded-lg border border-[#E5E7EB] px-2 focus-within:border-[#6C5DD3]">

      <input
        type="color"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-6 w-7 cursor-pointer border-0 bg-transparent p-0"
      />

      <input
        value={value.toUpperCase()}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="min-w-0 flex-1 bg-transparent text-xs font-medium uppercase text-[#374151] outline-none"
      />

    </div>
  );
}