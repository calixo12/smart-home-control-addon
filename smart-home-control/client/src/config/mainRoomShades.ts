export interface MainRoomShade {
  id: string;
  displayName: string;
  position: "top-left" | "top-right" | "middle-left" | "middle-right" | "bottom-left" | "bottom-right";
  isDimmable: boolean;
}

export const MAIN_ROOM_SHADES: MainRoomShade[] = [
  {
    id: "cover.kitchen_shade_l",
    displayName: "Kitchen Shade L",
    position: "top-left",
    isDimmable: true,
  },
  {
    id: "cover.kitchen_shade_r",
    displayName: "Kitchen Shade R",
    position: "top-right",
    isDimmable: true,
  },
  {
    id: "cover.dining_room_window",
    displayName: "Dining Room Window",
    position: "middle-left",
    isDimmable: true,
  },
  {
    id: "cover.dining_room_slider",
    displayName: "Dining Room Slider",
    position: "middle-right",
    isDimmable: true,
  },
  {
    id: "cover.great_room_side_windows",
    displayName: "Great Room Side Windows",
    position: "bottom-left",
    isDimmable: true,
  },
  {
    id: "cover.great_room_slider_right",
    displayName: "Slider Right",
    position: "bottom-right",
    isDimmable: true,
  },
];
