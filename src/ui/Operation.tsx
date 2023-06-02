import React, { ReactNode } from "react";
import SignupForm from "./SignupForm";
import { User } from "../../schema/user.mjs";
import { env } from "../domain/env";
import { MessageContext } from "./MessageBar";

export default function Operation(props: {
  user: User | null;
  width: number;
  height: number;
  onPreview: (() => void) | null;
  onRegenerate: (() => void) | null;
  onPublish: ((userName: string) => void) | null;
  allowedToPublish: boolean;
}) {
  const {
    user,
    width,
    height,
    onPreview,
    onRegenerate,
    onPublish,
    allowedToPublish,
  } = props;
  const [formKey, setFormKey] = React.useState(0);

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
    setFormKey(Date.now());
  };
  const handleSignupSuccess = async (userName: string) => {
    setFormKey(0);
    await handlePublish(userName);
  };
  const handleSignupFailure = async (error: any) => {
    setFormKey(0);
    messageContext.setError(error);
  };
  const handleSignupCancel = async () => {
    setFormKey(0);
  };
  const handlePreview = async (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onPreview?.();
  };
  const commandToRegenerate = env.os === "mac" ? "⌘ + S" : "Ctrl + S";
  return (
    <>
      <div className="form" style={{ width, height, boxSizing: "border-box" }}>
        <div className="form-item">
          <button
            className="button wide"
            disabled={onRegenerate == null}
            onClick={() => onRegenerate?.()}
          >
            Generate <ForceBaseline>(</ForceBaseline>
            {commandToRegenerate}
            <ForceBaseline>)</ForceBaseline>
          </button>
          <div className="help">
            {onRegenerate == null ? "Setting is not valid" : null}
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
              {onPublish == null ? "Generate to finish editing" : null}
            </div>
          </div>
        )}
      </div>
      {formKey > 0 && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              background: "black",
              opacity: 0.5,
            }}
            onClick={handleSignupCancel}
          ></div>
          <div style={{ zIndex: 1 }}>
            <SignupForm
              key={formKey}
              onSuccess={handleSignupSuccess}
              onError={handleSignupFailure}
            />
          </div>
        </div>
      )}
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
