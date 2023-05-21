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
} from "npm:@simplewebauthn/server@^7.2.0";
import { isoUint8Array } from "npm:@simplewebauthn/server/helpers";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorDevice,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from "npm:@simplewebauthn/typescript-types";
import * as base64url from "https://deno.land/std@0.179.0/encoding/base64url.ts";
import { assert } from "https://deno.land/std@0.183.0/_util/asserts.ts";

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
  const kv = await Deno.openKv();
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
  const kv = await Deno.openKv();
  await kv.set(["credentials", credentialID], credential);
}
async function deleteCredential(credentialID: Uint8Array): Promise<void> {
  const kv = await Deno.openKv();
  await kv.delete(["credentials", credentialID]);
}

async function getUser(userName: string): Promise<User | null> {
  const kv = await Deno.openKv();
  const cred = await kv.get<User>(["users", userName]);
  return cred.value;
}
async function setUser(userName: string, user: User): Promise<void> {
  const kv = await Deno.openKv();
  await kv.set(["users", userName], user);
}
export async function deleteUser(userName: string): Promise<void> {
  const kv = await Deno.openKv();
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
  // console.log(
  //   "clientDataJSON",
  //   decodeClientDataJSON(response.response.clientDataJSON)
  // );

  const opts: VerifyRegistrationResponseOpts = {
    response,
    expectedChallenge: `${expectedChallenge}`,
    expectedOrigin,
    expectedRPID: rpID,
    requireUserVerification: true,
  };
  const verification = await verifyRegistrationResponse(opts);
  // console.log("verification", verification);

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
  await setUser(userName, {
    credentials: [...existingCredentials, credentialID],
  });
}
// deno-lint-ignore require-await
export async function createAuthentication(
  rpID: string
): Promise<PublicKeyCredentialRequestOptionsJSON> {
  const opts: GenerateAuthenticationOptionsOpts = {
    challenge: Deno.env.get("CHALLENGE"), // テスト時は固定、その他はランダム
    timeout: 60000,
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
