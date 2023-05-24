import React, { useCallback, useState } from "react";
import View from "./View";
import World, { WorldOptions } from "./World";
import SettingEditor from "./SettingEditor";
import { Settings } from "../domain/settings";

const worldSize = 320;
const viewSize = 320;

export default function Editor(props: { preview: boolean }) {
  const { preview } = props;
  const settings: Settings = {
    background: "#502",
    generators: [
      {
        count: 5,
        shape: {
          type: "circle",
          radius: { min: 0.04, max: 0.11 },
          stroke: ["white", "yellow"],
          strokeWidth: 0.01,
        },
      },
      {
        count: 50,
        shape: {
          type: "rectangle",
          width: { min: 0.05, max: 0.12 },
          height: { min: 0.02, max: 0.03 },
          fill: ["cyan", "magenta", "yellow"],
        },
      },
    ],
  };
  const [worldOptions, setWorldOptions] = useState<WorldOptions>({
    size: worldSize,
    spinnerRadiusRatio: 0.5,
    clipRadiusRatio: 0.25,
    settings,
  });
  const [world, setWorld] = useState<World | null>(null);

  const handleReady = useCallback((world: World) => {
    setWorld(world);
  }, []);
  const handleApply = useCallback((json: any) => {
    setWorldOptions({ ...worldOptions, settings: json });
  }, []);
  return (
    <>
      <div style={{ display: "flex", gap: 10 }}>
        <World options={worldOptions} hidden={preview} onReady={handleReady} />
        {world && (
          <View
            size={viewSize}
            world={world}
            settings={worldOptions.settings}
          />
        )}
      </div>
      <SettingEditor settings={worldOptions.settings} onApply={handleApply} />
    </>
  );
}
