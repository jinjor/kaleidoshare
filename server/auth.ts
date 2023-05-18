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
  VerifiedAuthenticationResponse,
  VerifyAuthenticationResponseOpts,
} from "npm:@simplewebauthn/server@^7.2.0";
import {
  decodeClientDataJSON,
  isoUint8Array,
} from "npm:@simplewebauthn/server/helpers";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorDevice,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from "npm:@simplewebauthn/typescript-types";
import * as base64url from "https://deno.land/std@0.179.0/encoding/base64url.ts";

// ここで管理する DB は userName => Credential のマッピング
type Credential = {
  device: AuthenticatorDevice; // TODO: 複数
};
async function getCredential(userName: string): Promise<Credential | null> {
  const kv = await Deno.openKv();
  const cred = await kv.get<Credential>(["credentials", userName]);
  if (cred.value == null) {
    return null;
  }
  // TODO: 非互換な Credential が保存されている場合は削除する
  return cred.value;
}
async function setCredential(
  userName: string,
  credential: Credential
): Promise<void> {
  const kv = await Deno.openKv();
  await kv.set(["credentials", userName], credential);
}
export async function deleteCredential(userName: string): Promise<void> {
  const kv = await Deno.openKv();
  await kv.delete(["credentials", userName]);
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
  userName: string
): Promise<PublicKeyCredentialCreationOptionsJSON> {
  const cred = await getCredential(userName);
  if (cred != null) {
    throw new UserAlreadyExistsError();
  }
  const userID = crypto.randomUUID();
  const opts: GenerateRegistrationOptionsOpts = {
    rpName: "SimpleWebAuthn Example",
    rpID,
    userID,
    userName,
    timeout: 60000,
    attestationType: "none",
    excludeCredentials: [], // 複数デバイスの時は登録ずみのクレデンシャルをここに追加
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
  console.log(
    "clientDataJSON",
    decodeClientDataJSON(response.response.clientDataJSON)
  );

  const opts: VerifyRegistrationResponseOpts = {
    response,
    expectedChallenge: `${expectedChallenge}`,
    expectedOrigin,
    expectedRPID: rpID,
    requireUserVerification: true,
  };
  const verification = await verifyRegistrationResponse(opts);
  console.log("verification", verification);

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
  await setCredential(userName, { device });
}
export async function createAuthentication(
  rpID: string,
  userName: string
): Promise<PublicKeyCredentialRequestOptionsJSON> {
  const user = await getCredential(userName);
  const opts: GenerateAuthenticationOptionsOpts = {
    timeout: 60000,
    allowCredentials:
      user != null
        ? [
            {
              id: user.device.credentialID,
              type: "public-key",
              transports: user.device.transports,
            },
          ]
        : [],
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
  expectedChallenge: string,
  userName: string
): Promise<VerifiedAuthenticationResponse> {
  const user = await getCredential(userName);
  const bodyCredIDBuffer = base64url.decode(response.rawId);
  if (
    user == null ||
    !isoUint8Array.areEqual(user.device.credentialID, bodyCredIDBuffer)
  ) {
    throw new AuthenticatorNotRegisteredError();
  }
  const opts: VerifyAuthenticationResponseOpts = {
    response,
    expectedChallenge: `${expectedChallenge}`,
    expectedOrigin,
    expectedRPID: rpID,
    authenticator: user.device,
    requireUserVerification: true,
  };
  const verification = await verifyAuthenticationResponse(opts);
  const { verified, authenticationInfo } = verification;
  if (!verified) {
    throw new AuthenticationNotVerifiedError();
  }
  // TODO: これなんの意味がある？
  // Update the authenticator's counter in the DB to the newest count in the authentication
  user.device.counter = authenticationInfo.newCounter;
  await setCredential(userName, { device: user.device });

  return verification;
}
