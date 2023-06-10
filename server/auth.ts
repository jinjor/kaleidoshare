import {
  // Registration
  generateRegistrationOptions,
  verifyRegistrationResponse,
  // Authentication
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  VerifyRegistrationResponseOpts,
  GenerateRegistrationOptionsOpts,
  GenerateAuthenticationOptionsOpts,
  VerifyAuthenticationResponseOpts,
} from "simplewebauthn/server";
import { isoUint8Array } from "simplewebauthn/server/helpers";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorDevice,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from "simplewebauthn/typescript-types";
import * as base64url from "std/encoding/base64url";
import { assert } from "std/_util/asserts";
import { openKv } from "./kv.ts";

// Schema:
// - credentials: credentialID => Credential
// - users: userName => User
type Credential = {
  device: AuthenticatorDevice;
  userName: string;
};
type User = {
  credentials: Uint8Array[];
};

async function getCredential(
  credentialID: Uint8Array
): Promise<Credential | null> {
  const kv = await openKv();
  const cred = await kv.get<Credential>(["credentials", credentialID]);
  if (cred.value == null) {
    return null;
  }
  // TODO: 非互換な Credential が保存されている場合は削除する
  return cred.value;
}
async function setCredential(
  credentialID: Uint8Array,
  credential: Credential
): Promise<void> {
  const kv = await openKv();
  await kv.set(["credentials", credentialID], credential);
}
async function deleteCredential(credentialID: Uint8Array): Promise<void> {
  const kv = await openKv();
  await kv.delete(["credentials", credentialID]);
}

async function getUser(userName: string): Promise<User | null> {
  const kv = await openKv();
  const cred = await kv.get<User>(["users", userName]);
  return cred.value;
}
async function setUser(userName: string, user: User): Promise<void> {
  const kv = await openKv();
  await kv.set(["users", userName], user);
}
export async function deleteUser(userName: string): Promise<void> {
  const kv = await openKv();
  const user = await getUser(userName);
  if (user == null) {
    return;
  }
  // TODO: transaction
  for (const credentialID of user.credentials) {
    await deleteCredential(credentialID);
  }
  await kv.delete(["users", userName]);
}

export class UserAlreadyExistsError extends Error {
  constructor() {
    super("User already exists");
  }
}
export class RegistrationNotVerifiedError extends Error {
  constructor() {
    super("Registration not verified");
  }
}
export class AuthenticatorNotRegisteredError extends Error {
  constructor() {
    super("Authenticator not registered");
  }
}
export class AuthenticationNotVerifiedError extends Error {
  constructor() {
    super("Authentication not verified");
  }
}
export async function createCredential(
  rpID: string,
  userName: string,
  newUser: boolean
): Promise<PublicKeyCredentialCreationOptionsJSON> {
  const user = await getUser(userName);
  if (newUser && user != null) {
    throw new UserAlreadyExistsError();
  }
  const userID = "kaleidoshare/" + userName;
  const credentials = [];
  for (const credential of user?.credentials ?? []) {
    const cred = await getCredential(credential);
    if (cred != null) {
      credentials.push(cred);
    }
  }
  const opts: GenerateRegistrationOptionsOpts = {
    challenge: Deno.env.get("CHALLENGE"), // テスト時は固定、その他はランダム
    rpName: "Kaleidoshare",
    rpID,
    userID,
    userName,
    timeout: 60000,
    attestationType: "none",
    // TODO: 効いてない？
    excludeCredentials: credentials.map((cred) => ({
      id: cred.device.credentialID,
      type: "public-key",
      transports: cred.device.transports,
    })),
    // ?
    authenticatorSelection: {
      residentKey: "discouraged",
    },
    supportedAlgorithmIDs: [-7, -257], // ES256, RS256
  };
  const options = generateRegistrationOptions(opts);
  return options;
}
export async function register(
  rpID: string,
  expectedOrigin: string,
  response: RegistrationResponseJSON,
  expectedChallenge: string,
  userName: string
): Promise<void> {
  const opts: VerifyRegistrationResponseOpts = {
    response,
    expectedChallenge: `${expectedChallenge}`,
    expectedOrigin,
    expectedRPID: rpID,
    requireUserVerification: true,
  };
  const verification = await verifyRegistrationResponse(opts);
  if (!verification.verified || verification.registrationInfo == null) {
    throw new RegistrationNotVerifiedError();
  }
  const { credentialPublicKey, credentialID, counter } =
    verification.registrationInfo;

  const device: AuthenticatorDevice = {
    credentialPublicKey,
    credentialID,
    counter,
    transports: response.response.transports,
  };
  // ユーザーが存在する場合としない場合の両方に対応
  const existingUser = await getUser(userName);
  const existingCredentials = existingUser?.credentials ?? [];
  // TODO: transaction
  await setCredential(credentialID, { device, userName });
  const user = {
    credentials: [...existingCredentials, credentialID],
  };
  await setUser(userName, user);
}
export async function createAuthentication(
  rpID: string,
  userName: string | null
): Promise<PublicKeyCredentialRequestOptionsJSON> {
  // - undefined の場合はユーザにアカウントを選ばせる
  // - devtools の virtual authenticator を使う時は userName を指定する必要がある
  let allowCredentials: GenerateAuthenticationOptionsOpts["allowCredentials"];
  if (userName != null) {
    const user = await getUser(userName);
    const credentials = [];
    for (const credential of user?.credentials ?? []) {
      const cred = await getCredential(credential);
      if (cred != null) {
        credentials.push(cred);
      }
    }
    allowCredentials = credentials.map((cred) => ({
      id: cred.device.credentialID,
      type: "public-key",
      transports: cred.device.transports,
    }));
  }
  const opts: GenerateAuthenticationOptionsOpts = {
    challenge: Deno.env.get("CHALLENGE"), // テスト時は固定、その他はランダム
    timeout: 60000,
    allowCredentials,
    userVerification: "required",
    rpID,
  };
  const options = generateAuthenticationOptions(opts);
  return options;
}
export async function authenticate(
  rpID: string,
  expectedOrigin: string,
  response: AuthenticationResponseJSON,
  expectedChallenge: string
): Promise<string> {
  const credentialId = base64url.decode(response.rawId);

  const cred = await getCredential(credentialId);
  if (cred == null) {
    throw new AuthenticatorNotRegisteredError();
  }
  const user = await getUser(cred.userName);
  assert(user != null);
  assert(user.credentials.some((c) => isoUint8Array.areEqual(c, credentialId)));
  assert(isoUint8Array.areEqual(cred.device.credentialID, credentialId));

  const opts: VerifyAuthenticationResponseOpts = {
    response,
    expectedChallenge: `${expectedChallenge}`,
    expectedOrigin,
    expectedRPID: rpID,
    authenticator: cred.device,
    requireUserVerification: true,
  };
  const verification = await verifyAuthenticationResponse(opts);
  const { verified, authenticationInfo } = verification;
  if (!verified) {
    throw new AuthenticationNotVerifiedError();
  }
  // TODO: これなんの意味がある？
  // Update the authenticator's counter in the DB to the newest count in the authentication
  cred.device.counter = authenticationInfo.newCounter;
  await setCredential(credentialId, { ...cred, device: cred.device });
  // TODO: transaction
  return cred.userName;
}
export async function userExists(userName: string): Promise<boolean> {
  const user = await getUser(userName);
  return user != null;
}
