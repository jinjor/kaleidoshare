import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AppError } from "../domain/error";
import IconButton from "./IconButton";

type InfoType = "success" | "error";
type Info = {
  type: InfoType;
  message: string;
};
type ErrorInfo = {
  message: string;
};
type MessageContext = {
  info: Info | null;
  setError: (info: ErrorInfo) => void;
  setMessage: (message: string, type?: InfoType) => void;
  clear: () => void;
};

export const MessageContext = createContext<MessageContext | null>(null);

export function useMessage(): MessageContext {
  const [info, setInfo] = useState<Info | null>(null);
  const setError = useCallback((info: ErrorInfo) => {
    if (info instanceof AppError) {
      setInfo({ type: "error", message: info.message });
    } else {
      // TODO: 本当はここでエラーをサーバーに送信する
      setInfo({ type: "error", message: "Unexpected error" });
    }
  }, []);
  const setMessage = useCallback(
    (message: string, type: InfoType = "success") => {
      setInfo({ type, message: message });
    },
    []
  );
  const clear = useCallback(() => {
    setInfo(null);
  }, []);
  return { info, setError, setMessage, clear };
}

export default function MessageBar() {
  const context = useContext(MessageContext)!;
  const show = context.info != null;
  const [type, setType] = useState<InfoType | null>(null);
  useEffect(() => {
    if (context.info != null) {
      setType(context.info.type);
      const timeout = setTimeout(() => {
        context.clear();
      }, 4000);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [context, context.info]);
  const message = context.info?.message ?? "";
  return (
    <div className={["message-bar", type ?? "", show ? "show" : ""].join(" ")}>
      <div className="message-bar-inner">
        <p style={{ margin: 0 }}>{message}</p>
        <IconButton
          onClick={() => context.clear()}
          path="M 6 6 L 18 18 M 6 18 L 18 6"
        ></IconButton>
      </div>
    </div>
  );
}
