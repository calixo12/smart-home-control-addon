import ConnectionSettings from "../ConnectionSettings";

export default function ConnectionSettingsExample() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <ConnectionSettings
        onSave={(url, token) =>
          console.log("Saved connection:", { url, token: "***" })
        }
        initialUrl="http://homeassistant.local:8123"
      />
    </div>
  );
}
