export type Tool =
  | "select"
  | "frame"
  | "text"
  | "rectangle"
  | "circle"
  | "line"
  | "image";

export type ElementType =
  | "frame"
  | "text"
  | "rectangle"
  | "circle"
  | "line"
  | "image";

export interface EditorElement {
  id: string;

  type: ElementType;

  name: string;

  x: number;
  y: number;

  width: number;
  height: number;

  rotation: number;

  opacity: number;

  visible: boolean;
  locked: boolean;

  fill?: string;

  stroke?: string;
  strokeWidth?: number;

  borderRadius?: number;

  text?: string;

  fontSize?: number;
  fontWeight?: number;

  textAlign?: "left" | "center" | "right";

  color?: string;

  src?: string;
}

export interface EditorState {
  projectName: string;

  activeTool: Tool;

  elements: EditorElement[];

  selectedElementId: string | null;

  zoom: number;

  showGrid: boolean;

  snapToGrid: boolean;
}