import { useState } from "react";
import { Settings, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConnectionSettingsProps {
  onSave: (
    url: string, 
    token: string, 
    appName: string, 
    appleEntity: string,
    lampEntity: string,
    background: string,
    roomName: string,
    selectedRoom: string
  ) => void;
  initialUrl?: string;
  initialToken?: string;
  initialAppName?: string;
  initialAppleEntity?: string;
  initialLampEntity?: string;
  initialBackground?: string;
  initialRoomName?: string;
  initialSelectedRoom?: string;
}

export default function ConnectionSettings({
  onSave,
  initialUrl = "http://homeassistant.local:8123",
  initialToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI0MzZjYmU3ZmNlNGE0ODAxYjAwYjAzMjgzYTg4NzQyNyIsImlhdCI6MTc2MjA2MDc1NiwiZXhwIjoyMDc3NDIwNzU2fQ.dhTKhWOZmeGDsp9SxSdNKvAmmId41o0gCqF6TiMkJp4",
  initialAppName = "Smart Home",
  initialAppleEntity = "",
  initialLampEntity = "",
  initialBackground = "carbon-fiber",
  initialRoomName = "Media Room",
  initialSelectedRoom = "media-room",
}: ConnectionSettingsProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(initialUrl);
  const [token, setToken] = useState(initialToken);
  const [appName, setAppName] = useState(initialAppName);
  const [appleEntity, setAppleEntity] = useState(initialAppleEntity);
  const [lampEntity, setLampEntity] = useState(initialLampEntity);
  const [background, setBackground] = useState(initialBackground);
  const [roomName, setRoomName] = useState(initialRoomName);
  const [selectedRoom, setSelectedRoom] = useState(initialSelectedRoom);

  const predefinedBackgrounds = [
    { name: "Carbon Fiber", value: "carbon-fiber" },
    { name: "Pool Table", value: "pool-table" },
    { name: "Brushed Metal", value: "brushed-metal" },
    { name: "Marble", value: "marble" },
  ];

  const handleSave = () => {
    onSave(url, token, appName, appleEntity, lampEntity, background, roomName, selectedRoom);
    setOpen(false);
    console.log("Connection settings saved");
  };

  const roomOptions = [
    { id: "media-room", name: "Media Room" },
    { id: "main-room", name: "Main Room" },
    { id: "master-bedroom", name: "Master Bedroom" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="w-10 h-10 rounded-lg transition-all flex items-center justify-center"
          style={{
            background: "linear-gradient(145deg, #f0f0f0, #d0d0d0)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.5)",
            color: "#000000",
          }}
          data-testid="button-open-connection-settings"
        >
          <Settings className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connection Settings</DialogTitle>
          <DialogDescription>
            Configure your Home Assistant connection
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="app-name">App Name</Label>
            <Input
              id="app-name"
              type="text"
              placeholder="Smart Home"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              data-testid="input-app-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name (for Intercom)</Label>
            <Input
              id="room-name"
              type="text"
              placeholder="Media Room"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              data-testid="input-room-name"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-base font-bold">Room Configuration</Label>
            <div className="grid grid-cols-3 gap-3">
              {roomOptions.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setSelectedRoom(room.id)}
                  className="relative h-12 rounded-lg overflow-hidden transition-all"
                  style={{
                    background: selectedRoom === room.id 
                      ? "linear-gradient(145deg, #c8c8c8, #b0b0b0)"
                      : "linear-gradient(145deg, #f0f0f0, #d8d8d8)",
                    boxShadow: selectedRoom === room.id
                      ? "inset 0 2px 6px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.1)"
                      : "0 2px 4px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5)",
                    border: selectedRoom === room.id ? "2px solid #888" : "1px solid #aaa",
                  }}
                  data-testid={`button-room-${room.id}`}
                >
                  <div className="flex items-center justify-center h-full">
                    <span 
                      className="font-bold text-base"
                      style={{
                        color: selectedRoom === room.id ? "#2c2c2c" : "#4a4a4a",
                        textShadow: selectedRoom === room.id 
                          ? "none"
                          : "0 1px 0 rgba(255,255,255,0.8)",
                      }}
                    >
                      {room.name}
                    </span>
                    {selectedRoom === room.id && (
                      <Check className="w-4 h-4 ml-2" style={{ color: "#22c55e" }} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="ha-url">Home Assistant URL</Label>
            <Input
              id="ha-url"
              type="url"
              placeholder="http://homeassistant.local:8123"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              data-testid="input-ha-url"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ha-token">Long-Lived Access Token</Label>
            <Input
              id="ha-token"
              type="password"
              placeholder="Enter your access token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              data-testid="input-ha-token"
            />
          </div>

          <div className="space-y-3 pt-4 border-t">
            <Label className="text-base font-bold">Background Surface</Label>
            <div className="grid grid-cols-1 gap-3">
              {predefinedBackgrounds.map((bg) => (
                <button
                  key={bg.name}
                  type="button"
                  onClick={() => setBackground(bg.value)}
                  className="relative h-14 rounded-lg overflow-hidden transition-all"
                  style={{
                    background: background === bg.value 
                      ? "linear-gradient(145deg, #c8c8c8, #b0b0b0)"
                      : "linear-gradient(145deg, #f0f0f0, #d8d8d8)",
                    boxShadow: background === bg.value
                      ? "inset 0 2px 6px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.1)"
                      : "0 2px 4px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5)",
                    border: background === bg.value ? "2px solid #888" : "1px solid #aaa",
                  }}
                  data-testid={`button-background-${bg.name.toLowerCase().replace(" ", "-")}`}
                >
                  <div className="flex items-center justify-between px-4 h-full">
                    <span 
                      className="font-bold text-lg"
                      style={{
                        color: background === bg.value ? "#2c2c2c" : "#4a4a4a",
                        textShadow: background === bg.value 
                          ? "none"
                          : "0 1px 0 rgba(255,255,255,0.8)",
                      }}
                    >
                      {bg.name}
                    </span>
                    {background === bg.value && (
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{
                          background: "linear-gradient(145deg, #4ade80, #22c55e)",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)",
                        }}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSave}
            className="w-full"
            data-testid="button-save-connection"
          >
            <Check className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
