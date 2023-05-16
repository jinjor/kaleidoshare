import React, { useCallback, useState } from "react";
import View from "./View";
import World from "./World";

const worldSize = 320;
const viewSize = 320;

export default function Editor(props: { preview: boolean }) {
  const { preview } = props;

  const [worldOptions, setWorldOptions] = useState({
    size: worldSize,
    numBalls: 15,
    spinnerRadiusRatio: 0.5,
    clipRadiusRatio: 0.25,
    ballRadiusRatio: 0.045,
    ballRadiusVarRatio: 0.035,
  });
  const [world, setWorld] = useState<World | null>(null);

  const handleReady = useCallback((world: World) => {
    setWorld(world);
  }, []);
  return (
    <>
      <div style={{ display: "flex", gap: 10 }}>
        <World options={worldOptions} hidden={preview} onReady={handleReady} />
        {world && <View size={viewSize} world={world} />}
      </div>
    </>
  );
}
