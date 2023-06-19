// challenge = "test", user = "test" で登録時に生成した実際のデータ
export const testCred1RegistrationResponse = {
  id: "MuJ1-f-99qJKxOvBQf0-fnwdYHA",
  rawId: "MuJ1-f-99qJKxOvBQf0-fnwdYHA",
  response: {
    attestationObject:
      "o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YViYSZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NdAAAAAAAAAAAAAAAAAAAAAAAAAAAAFDLidfn_vfaiSsTrwUH9Pn58HWBwpQECAyYgASFYILXCCOqzJPy5mE0NzGwEBpOqrOhBgiZndvEKozbOYq5kIlgg7Yt0QTUm7oNBOjH28MCccA8KNVSpZdD0G7YRgbfvydk",
    clientDataJSON:
      "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiZEdWemRBIiwib3JpZ2luIjoiaHR0cDovL2xvY2FsaG9zdDo1MTczIiwiY3Jvc3NPcmlnaW4iOmZhbHNlfQ",
    transports: [],
  },
  type: "public-key",
  clientExtensionResults: { credProps: {} },
  authenticatorAttachment: "cross-platform",
};
// 上の条件で登録後、challenge = "test", user = "test" で認証時に生成した実際のデータ
export const testCred1AuthenticationResponse = {
  id: "MuJ1-f-99qJKxOvBQf0-fnwdYHA",
  rawId: "MuJ1-f-99qJKxOvBQf0-fnwdYHA",
  response: {
    authenticatorData: "SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2MdAAAAAA",
    clientDataJSON:
      "eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiZEdWemRBIiwib3JpZ2luIjoiaHR0cDovL2xvY2FsaG9zdDo1MTczIiwiY3Jvc3NPcmlnaW4iOmZhbHNlfQ",
    signature:
      "MEUCIQCNVshPb4BqzlOSEWT34cctaBcGaGtxSY8xW8-w8PVl2wIgLu33uZkekVwlV2qf-CvEUqs9WyUpkpblUmf-1peT2pI",
    userHandle: "kaleidoshare/test",
  },
  type: "public-key",
  clientExtensionResults: {},
  authenticatorAttachment: "cross-platform",
};
export const testCred2RegistrationResponse = {
  id: "iheVmEdZThapXS5fU1rFMvJ1-0ptZHtSB7qBWjSiSlc",
  rawId: "iheVmEdZThapXS5fU1rFMvJ1-0ptZHtSB7qBWjSiSlc",
  response: {
    attestationObject:
      "o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YVikSZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NFAAAAAK3OAAI1vMYKZIsLJfHwVQMAIIoXlZhHWU4WqV0uX1NaxTLydftKbWR7Uge6gVo0okpXpQECAyYgASFYIJaOh8xlNSjNFOLAc_CKTcVHxQO24mNfA3by4TX7vnrNIlgg8bcCqx7Npss1ovRh2q189JjNODgEm8laoBMDuwz1B_E",
    clientDataJSON:
      "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiZEdWemRBIiwib3JpZ2luIjoiaHR0cDovL2xvY2FsaG9zdDo1MTczIiwiY3Jvc3NPcmlnaW4iOmZhbHNlfQ",
    transports: ["internal"],
  },
  type: "public-key",
  clientExtensionResults: { credProps: { rk: true } },
  authenticatorAttachment: "platform",
};
// 上の条件で登録後、challenge = "test", user = "test" で認証時に生成した実際のデータ
export const testCred2AuthenticationResponse = {
  id: "iheVmEdZThapXS5fU1rFMvJ1-0ptZHtSB7qBWjSiSlc",
  rawId: "iheVmEdZThapXS5fU1rFMvJ1-0ptZHtSB7qBWjSiSlc",
  response: {
    authenticatorData: "SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2MFAAAAAA",
    clientDataJSON:
      "eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiZEdWemRBIiwib3JpZ2luIjoiaHR0cDovL2xvY2FsaG9zdDo1MTczIiwiY3Jvc3NPcmlnaW4iOmZhbHNlfQ",
    signature:
      "MEUCIQCKmXpteyMxMs7vrL8fZlZrKI8bUArBN_VykY0GiCLLbwIgKu78s3r0Tv9sboKTg8mi4_OwlRenpdjIDwSib5SsCbQ",
    userHandle: "kaleidoshare/test",
  },
  type: "public-key",
  clientExtensionResults: {},
  authenticatorAttachment: "platform",
};

export async function waitForServer(url: string) {
  for (let i = 0; i < 1000; i++) {
    try {
      await fetch(url);
      break;
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      continue;
    }
  }
}
