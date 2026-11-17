"use client";

import { create } from "zustand";

import {
  EditorElement,
  Tool,
} from "@/types/editor";

interface EditorStore {
  projectName: string;

  activeTool: Tool;

  elements: EditorElement[];

  selectedElementId: string | null;

  zoom: number;

  showGrid: boolean;
  snapToGrid: boolean;

  setProjectName: (name: string) => void;

  setActiveTool: (tool: Tool) => void;

  // Supabase-тан дизайнды жүктеу үшін
  setElements: (elements: EditorElement[]) => void;

  addElement: (element: EditorElement) => void;

  updateElement: (
    id: string,
    updates: Partial<EditorElement>
  ) => void;

  removeElement: (id: string) => void;

  selectElement: (id: string | null) => void;

  setZoom: (zoom: number) => void;

  toggleGrid: () => void;

  toggleSnap: () => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  projectName: "Untitled Project",

  activeTool: "select",

  elements: [],

  selectedElementId: null,

  zoom: 1,

  showGrid: false,

  snapToGrid: false,

  setProjectName: (name) =>
    set({
      projectName: name,
    }),

  setActiveTool: (tool) =>
    set({
      activeTool: tool,
    }),

  // Барлық элементті бірден store-ға қояды
  setElements: (elements) =>
    set({
      elements,
      selectedElementId: null,
    }),

  addElement: (element) =>
    set((state) => ({
      elements: [...state.elements, element],

      selectedElementId: element.id,

      activeTool: "select",
    })),

  updateElement: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((element) =>
        element.id === id
          ? {
              ...element,
              ...updates,
            }
          : element
      ),
    })),

  removeElement: (id) =>
    set((state) => ({
      elements: state.elements.filter(
        (element) => element.id !== id
      ),

      selectedElementId:
        state.selectedElementId === id
          ? null
          : state.selectedElementId,
    })),

  selectElement: (id) =>
    set({
      selectedElementId: id,
    }),

  setZoom: (zoom) =>
    set({
      zoom: Math.min(
        Math.max(zoom, 0.25),
        4
      ),
    }),

  toggleGrid: () =>
    set((state) => ({
      showGrid: !state.showGrid,
    })),

  toggleSnap: () =>
    set((state) => ({
      snapToGrid: !state.snapToGrid,
    })),
}));