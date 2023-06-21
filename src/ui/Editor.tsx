import React, { useCallback, useContext, useEffect, useState } from "react";
import View, { ViewApi } from "./View";
import World, { WorldApi } from "./World";
import SettingEditor, { SettingsEditorController } from "./SettingEditor";
import { Settings, Output, User, Content } from "../../schema/schema.js";
import Operation from "./Operation";
import { createContent, updateContent } from "../domain/io";
import { generate } from "../domain/generate";
import { MessageContext } from "./MessageBar";
import { RoutingContext } from "../Routing";
import { Example } from "../domain/example";

export default function Editor(props: {
  user: User | null;
  initiallyPreview: boolean;
  content: Content | null;
}) {
  const { user, initiallyPreview, content } = props;

  const routingContext = useContext(RoutingContext)!;
  const messageContext = useContext(MessageContext)!;
  const [examples, setExamples] = useState<Example[] | undefined>();
  const [preview, setPreview] = useState(initiallyPreview);
  const [settings, setSettings] = useState<Settings | undefined>(
    content?.settings
  );
  const [selectedExampleIndex, setSelectedExampleIndex] = useState<number>(0);
  const [output, setOutput] = useState<Output | undefined>(content?.output);
  const [world, setWorld] = useState<WorldApi | undefined>();
  const [settingsController, setSettingsController] =
    useState<SettingsEditorController | null>(null);
  const [saved, setSaved] = useState<boolean>(true);
  const [warningShown, setWarningShown] = useState<boolean>(false);
  const [viewApi, setViewApi] = useState<ViewApi | null>(null);

  useEffect(() => {
    import("../domain/example.js").then((module) => {
      const examples = module.default;
      setExamples(examples);
      if (output == null) {
        setOutput(generate(examples[selectedExampleIndex].settings));
      }
    });
  }, []);
  const handleWorldReady = useCallback((world: WorldApi) => {
    setWorld(world);
  }, []);
  const handleViewReady = useCallback((viewApi: ViewApi) => {
    setViewApi(viewApi);
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
              `/contents/${content.author}/${content.id}/show`
            );
          }
          setPreview(true);
        }
      : null;
  const quitPreview = () => {
    if (content != null) {
      routingContext.changeUrl(`/contents/${content.author}/${content.id}`);
    }
    setPreview(false);
  };
  const handleGenerate =
    settings == null
      ? examples != null
        ? () => {
            const example = examples[selectedExampleIndex];
            setOutput(generate(example.settings));
          }
        : null
      : settingsController != null && !warningShown
      ? () => {
          settingsController.save();
        }
      : null;
  const handlePublish =
    settings && output && saved && viewApi != null
      ? async (userName: string) => {
          const thumbnail = await viewApi.getImageString(100);
          const image = await viewApi.getImageString(300);
          // TODO: env を使う
          if (location.port === "5173") {
            // Example に転記するため
            console.log(JSON.stringify({ name: "", settings, thumbnail }));
          }
          if (content == null) {
            const contentId = await createContent(
              userName,
              settings,
              output,
              thumbnail,
              image
            );
            messageContext.setMessage("Published!");
            routingContext.goTo(`/contents/${userName}/${contentId}`, true);
          } else {
            await updateContent(
              content.author,
              content.id,
              settings,
              output,
              thumbnail,
              image
            );
            messageContext.setMessage("Saved!");
          }
        }
      : null;
  const handleChange = useCallback(() => {
    setSaved(false);
  }, []);
  const handleApply = useCallback((json: any) => {
    const settings = json as Settings;
    const output = generate(settings);
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

  if (world && output && preview) {
    return (
      <>
        {/** World の状態をリセットされないように HTML 構造を下と合わせておく */}
        <div>
          <World output={output} onReady={handleWorldReady} />
        </div>
        <View
          fullscreen={true}
          onQuitFullscreen={quitPreview}
          world={world}
          onReady={handleViewReady}
        />
      </>
    );
  }
  return (
    <>
      <div className="editor">
        <World output={output} onReady={handleWorldReady} />
        <View
          fullscreen={false}
          onQuitFullscreen={quitPreview}
          world={world}
          onReady={handleViewReady}
        />
        <Operation
          user={user}
          onPreview={handlePreview}
          onGenerate={handleGenerate}
          onPublish={handlePublish}
          coding={settings != null}
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
      ) : examples != null ? (
        <div className="horizontal-center">
          <div className="form" style={{ width: "100%" }}>
            <div className="form-title">Getting started</div>
            <div className="content-selector">
              {examples.map((example, index) => (
                <div
                  className={[
                    "content-selector-item",
                    selectedExampleIndex === index ? "selected" : "",
                  ].join(" ")}
                  key={example.name}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedExampleIndex(index);
                    setOutput(generate(examples[index].settings));
                  }}
                >
                  <img
                    src={example.thumbnail}
                    width={100}
                    height={100}
                    className="content-selector-item-image"
                  />
                  <div>{example.name}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center" }}>
              <button
                className="button primary"
                style={{ width: "200px" }}
                onClick={(e) => {
                  e.preventDefault();
                  setSettings(examples[selectedExampleIndex].settings);
                }}
              >
                Start editing
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
