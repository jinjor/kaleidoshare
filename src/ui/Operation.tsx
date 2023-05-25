import React from "react";
import SignupForm from "./SignupForm";
import { User } from "../domain/user";
import { publish } from "../domain/publish";
import { env } from "../domain/env";

export default function Operation(props: {
  user: User | null;
  settings: any;
  width: number;
  height: number;
}) {
  const { user, settings, width, height } = props;
  const [formKey, setFormKey] = React.useState(0);

  const handleTryPublish = async (
    event: React.FormEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    if (user != null) {
      handlePublish(user.name);
      return;
    }
    setFormKey(Date.now());
  };
  const handlePublish = async (userName: string) => {
    const contentId = await publish(userName, settings);
    location.href = `/contents/${userName}/${contentId}`;
    setFormKey(0);
  };
  if (env.prod) {
    return <></>;
  }
  return (
    <>
      <div className="form" style={{ width, height, boxSizing: "border-box" }}>
        <button className="button wide primary" onClick={handleTryPublish}>
          Publish
        </button>
      </div>
      {formKey > 0 && <SignupForm key={formKey} onSuccess={handlePublish} />}
    </>
  );
}
