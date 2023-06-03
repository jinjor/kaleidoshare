import React, { useCallback, useState } from "react";
import View from "./View";
import World, { WorldOptions } from "./World";
import SettingEditor, { SettingsEditorController } from "./SettingEditor";
import { Settings, Output, User, Content } from "../../schema/schema.js";
import Operation from "./Operation";
import { createContent, updateContent } from "../domain/io";
import { generate } from "../domain/generate";
import { MessageContext } from "./MessageBar";
import { RoutingContext } from "../Routing";
import examples from "../domain/example";

// |--- worldSize --|-|--- viewSize ---|-|-- opetaionSize --|
//                  gap                gap
const worldSize = 300;
const viewSize = 300;
const operationSize = 340;
const upperHeight = 300;
const gap = (960 - (worldSize + viewSize + operationSize)) / 2;

const spinnerRadiusRatio = 0.5;
const worldOptions: WorldOptions = {
  size: worldSize,
  spinnerRadiusRatio,
  clipRadiusRatio: 0.25,
};
export default function Editor(props: {
  user: User | null;
  initiallyPreview: boolean;
  content: Content | null;
}) {
  const { user, initiallyPreview, content } = props;

  const routingContext = React.useContext(RoutingContext)!;
  const messageContext = React.useContext(MessageContext)!;

  const [preview, setPreview] = React.useState(initiallyPreview);
  const [settings, setSettings] = useState<Settings | null>(
    content?.settings ?? null
  );
  const [selectedExampleIndex, setSelectedExampleIndex] = useState<number>(0);
  const usedSettings = settings ?? examples[selectedExampleIndex].settings;
  const [output, setOutput] = useState<Output>(
    content?.output ?? generate(spinnerRadiusRatio, usedSettings)
  );
  const [world, setWorld] = useState<World | null>(null);
  const [settingsController, setSettingsController] =
    useState<SettingsEditorController | null>(null);
  const [saved, setSaved] = useState<boolean>(true);
  const [warningShown, setWarningShown] = useState<boolean>(false);

  const handleWorldReady = useCallback((world: World) => {
    setWorld(world);
  }, []);
  const handleSettingsEditorReady = useCallback(
    (controller: SettingsEditorController) => {
      setSettingsController(controller);
    },
    []
  );
  const handlePreview =
    output != null
      ? () => {
          if (content != null) {
            routingContext.changeUrl(
              `/contents/${content.author}/${content.id}`
            );
          }
          setPreview(true);
        }
      : null;
  const quitPreview = () => {
    if (content != null) {
      routingContext.changeUrl(
        `/contents/${content.author}/${content.id}/edit`
      );
    }
    setPreview(false);
  };
  const handleRegenerate =
    settings == null
      ? () => {
          const example = examples[selectedExampleIndex];
          setOutput(generate(spinnerRadiusRatio, example.settings));
        }
      : settingsController != null && !warningShown
      ? () => {
          settingsController.save();
        }
      : null;
  const handlePublish =
    settings && saved
      ? async (userName: string) => {
          try {
            if (content == null) {
              const contentId = await createContent(userName, settings, output);
              routingContext.goTo(
                `/contents/${userName}/${contentId}/edit`,
                true
              );
            } else {
              await updateContent(content.author, content.id, settings, output);
            }
          } catch (e) {
            messageContext.setError(e);
          }
        }
      : null;
  const handleChange = useCallback(() => {
    setSaved(false);
  }, []);
  const handleApply = useCallback((json: any) => {
    const settings = json as Settings;
    const output: Output = generate(spinnerRadiusRatio, settings);
    setSettings(settings);
    setOutput(output);
    // 保存操作の直後にフォーマットされ handleChange が呼ばれてしまうため、
    // その後に saved を true にする
    setTimeout(() => {
      setSaved(true);
    }, 100);
  }, []);
  const handleWarningShownChange = useCallback((warningShown) => {
    setWarningShown(warningShown);
  }, []);

  if (world && preview) {
    return (
      <>
        {/** World の状態をリセットされないように HTML 構造を下と合わせておく */}
        <div>
          <World
            options={worldOptions}
            output={output}
            onReady={handleWorldReady}
          />
        </div>
        <div
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#111",
          }}
          onClick={quitPreview}
        >
          <div
            style={{
              backgroundColor: "#111",
              maxWidth: "90vh",
              maxHeight: "90vh",
              position: "relative",
              width: "90vw",
              height: "90vw",
            }}
          >
            <View size={viewSize * 2} world={world} settings={usedSettings} />
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <div
        style={{
          display: "flex",
          gap,
          maxWidth: "100vw",
          overflow: "scroll",
        }}
      >
        <World
          options={worldOptions}
          output={output}
          onReady={handleWorldReady}
        />
        <div
          style={{
            backgroundColor: "#111",
            width: viewSize,
            height: viewSize,
            position: "relative",
            minWidth: viewSize,
          }}
        >
          {world && (
            <View size={viewSize} world={world} settings={usedSettings} />
          )}
        </div>
        <Operation
          width={operationSize}
          height={upperHeight}
          user={user}
          onPreview={handlePreview}
          onRegenerate={handleRegenerate}
          onPublish={handlePublish}
          content={content}
        />
      </div>
      {settings != null ? (
        <SettingEditor
          settings={settings}
          onChange={handleChange}
          onApply={handleApply}
          onReady={handleSettingsEditorReady}
          onWarningShownChange={handleWarningShownChange}
        />
      ) : (
        <div
          className="form"
          style={{ alignItems: "flex-start", display: "inline-flex" }}
        >
          <div className="form-title">Getting started</div>
          <div>
            <div className="select">
              <select
                style={{ minWidth: "20ch" }}
                defaultValue={selectedExampleIndex}
                onChange={(e) => {
                  const index = Number(e.target.value);
                  setSelectedExampleIndex(index);
                  setOutput(
                    generate(spinnerRadiusRatio, examples[index].settings)
                  );
                }}
              >
                {examples.map((example, index) => (
                  <option key={index} value={index}>
                    {example.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="button primary"
              onClick={(e) => {
                e.preventDefault();
                setSettings(examples[selectedExampleIndex].settings);
              }}
            >
              Start editing
            </button>
          </div>
        </div>
      )}
    </>
  );
}
