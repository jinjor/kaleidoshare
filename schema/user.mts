// GitHub と同じルール
/**
 * @minLength 1
 * @maxLength 39
 * @pattern ^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$
 */
export type UserName = string;
export type User = {
  name: string;
};
