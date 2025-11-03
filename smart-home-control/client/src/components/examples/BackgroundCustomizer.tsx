import { useState } from "react";
import BackgroundCustomizer from "../BackgroundCustomizer";

export default function BackgroundCustomizerExample() {
  const [background, setBackground] = useState(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background }}
    >
      <BackgroundCustomizer
        currentBackground={background}
        onBackgroundChange={setBackground}
      />
    </div>
  );
}
