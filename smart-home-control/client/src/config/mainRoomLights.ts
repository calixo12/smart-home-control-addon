export interface MainRoomLight {
  id: string;
  displayName: string;
  position: "top-left" | "top-right" | "middle-left" | "middle-right" | "bottom-left" | "bottom-right";
  isDimmable: boolean;
}

export const MAIN_ROOM_LIGHTS: MainRoomLight[] = [
  {
    id: "light.kitchen_main_lights",
    displayName: "Main Lights",
    position: "top-left",
    isDimmable: true,
  },
  {
    id: "light.kitchen_sink_pendants",
    displayName: "Sink Pendants",
    position: "top-right",
    isDimmable: true,
  },
  {
    id: "light.dining_room_main_lights",
    displayName: "Main Lights",
    position: "middle-left",
    isDimmable: true,
  },
  {
    id: "light.dining_room_chandelier",
    displayName: "Chandelier",
    position: "middle-right",
    isDimmable: true,
  },
  {
    id: "light.great_room_main_lights",
    displayName: "Main Lights",
    position: "bottom-left",
    isDimmable: true,
  },
  {
    id: "light.great_room_floor_lamp",
    displayName: "Floor Lamp",
    position: "bottom-right",
    isDimmable: true,
  },
];
