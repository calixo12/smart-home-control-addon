export interface PlayroomLight {
  id: string;
  displayName: string;
  position: "top-left" | "top-right" | "middle-left" | "middle-right" | "bottom-left" | "bottom-right";
  isDimmable: boolean;
}

export const PLAYROOM_LIGHTS: PlayroomLight[] = [
  {
    id: "light.playroom_main",
    displayName: "Main Light",
    position: "top-left",
    isDimmable: true,
  },
  {
    id: "light.playroom_accent",
    displayName: "Accent Light",
    position: "top-right",
    isDimmable: true,
  },
];
