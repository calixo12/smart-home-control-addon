import ConnectionStatus from "../ConnectionStatus";

export default function ConnectionStatusExample() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-screen">
      <ConnectionStatus status="connected" />
      <ConnectionStatus status="connecting" />
      <ConnectionStatus status="disconnected" />
    </div>
  );
}
