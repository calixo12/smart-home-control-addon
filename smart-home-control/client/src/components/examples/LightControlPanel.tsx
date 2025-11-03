import LightControlPanel from "../LightControlPanel";

export default function LightControlPanelExample() {
  return (
    <LightControlPanel
      light={{ id: "1", name: "Living Room", brightness: 75, state: "on" }}
      onBrightnessChange={(brightness) =>
        console.log("Brightness changed:", brightness)
      }
      onToggle={(state) => console.log("Light toggled:", state)}
    />
  );
}
