import React, { ReactNode } from "react";
import SignupForm from "./SignupForm";
import { Content, User } from "../../schema/schema.js";
import { env } from "../domain/env";
import { MessageContext } from "./MessageBar";

export default function Operation(props: {
  user: User | null;
  width: number;
  height: number;
  onPreview: (() => void) | null;
  onGenerate: (() => void) | null;
  onPublish: ((userName: string) => void) | null;
  content: Content | null;
}) {
  const { user, width, height, onPreview, onGenerate, onPublish, content } =
    props;
  const [signupFormId, setSignupFormId] = React.useState<number | null>(null);

  const messageContext = React.useContext(MessageContext)!;
  const handlePublish = (userName: string) => {
    onPublish?.(userName);
  };
  // TODO: これも外でやる
  const handleTryPublish = async (
    event: React.FormEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    if (user != null) {
      await handlePublish(user.name);
      return;
    }
    setSignupFormId(Date.now());
  };
  const handleSignupSuccess = async (userName: string) => {
    setSignupFormId(null);
    await handlePublish(userName);
  };
  const handleSignupFailure = async (error: any) => {
    setSignupFormId(null);
    messageContext.setError(error);
  };
  const handleSignupCancel = async () => {
    setSignupFormId(null);
  };
  const handlePreview = async (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onPreview?.();
  };
  const commandToRegenerate = env.os === "mac" ? "⌘ + S" : "Ctrl + S";
  const allowedToPublish =
    !env.prod && (content == null || content.author === user?.name);
  return (
    <>
      <div className="form" style={{ width, height, boxSizing: "border-box" }}>
        <div className="form-item">
          <button
            className="button wide"
            disabled={onGenerate == null}
            onClick={() => onGenerate?.()}
          >
            Generate
            {!env.mobile && (
              <>
                {" "}
                <ForceBaseline>(</ForceBaseline>
                {commandToRegenerate}
                <ForceBaseline>)</ForceBaseline>
              </>
            )}
          </button>
          <div className="help">
            {onGenerate == null ? "Setting is not valid" : null}
          </div>
        </div>
        <div className="form-item">
          <button
            className="button wide"
            disabled={onPreview == null}
            onClick={handlePreview}
          >
            Preview
          </button>
          <div className="help">
            {onPreview == null ? "Nothing to preview" : null}
          </div>
        </div>
        {allowedToPublish && (
          <div className="form-item">
            <button
              className="button wide primary"
              disabled={onPublish == null}
              onClick={handleTryPublish}
            >
              Publish
            </button>
            <div className="help">
              {onPublish == null
                ? "Generate to finish editing" // TODO: example から generate しても publish できない
                : null}
            </div>
          </div>
        )}
        {content != null && (
          <div className="help" style={{ marginTop: "auto" }}>
            Created by {content.author}
          </div>
        )}
      </div>
      <SignupForm
        id={signupFormId}
        onSuccess={handleSignupSuccess}
        onError={handleSignupFailure}
        onCancel={handleSignupCancel}
      />
    </>
  );
}
const ForceBaseline = (props: { children: ReactNode }) => {
  const { children } = props;
  return (
    <span style={{ verticalAlign: "top", fontSize: "smaller" }}>
      {children}
    </span>
  );
};
