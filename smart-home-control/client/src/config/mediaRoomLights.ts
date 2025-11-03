export interface MediaRoomLight {
  id: string;
  displayName: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  isDimmable: boolean;
}

export const MEDIA_ROOM_LIGHTS: MediaRoomLight[] = [
  {
    id: "light.media_room_main_lights",
    displayName: "Main Lights",
    position: "top-left",
    isDimmable: true,
  },
  {
    id: "light.media_room_nook",
    displayName: "Nook",
    position: "top-right",
    isDimmable: true,
  },
  {
    id: "light.media_room_bar_pendants",
    displayName: "Bar Pendants",
    position: "bottom-left",
    isDimmable: true,
  },
  {
    id: "switch.downstairs_hallway_main_lights",
    displayName: "Hallway",
    position: "bottom-right",
    isDimmable: false,
  },
];
