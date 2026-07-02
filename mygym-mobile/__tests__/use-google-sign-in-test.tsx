import { act, renderHook } from "@testing-library/react-native";

const mockPromptAsync = jest.fn();
const mockUseIdTokenAuthRequest = jest.fn(() => [
  { id: "request" },
  null,
  mockPromptAsync,
]);
const mockMaybeCompleteAuthSession = jest.fn();

const mockCredential = jest.fn(() => ({ providerId: "google.com" }));
const mockSignInWithCredential = jest.fn();

jest.mock("@/services/googleAuthProvider", () => ({
  __esModule: true,
  useIdTokenAuthRequest: mockUseIdTokenAuthRequest,
}));

jest.mock("expo-web-browser", () => ({
  __esModule: true,
  maybeCompleteAuthSession: mockMaybeCompleteAuthSession,
}));

jest.mock("@/services/firebaseGoogleAuth", () => ({
  firebaseGoogleSignInDependencies: {
    credential: mockCredential,
    signIn: mockSignInWithCredential,
  },
}));

jest.mock("@/services/env", () => ({
  env: {
    google: {
      webClientId: "web-client-id",
      androidClientId: "android-client-id",
      iosClientId: undefined,
    },
  },
}));

jest.mock("@/services/firebaseConfig", () => ({
  firebaseAuth: { name: "firebase-auth" },
}));

const loadUseGoogleSignIn = () => {
  const hookModule =
    require("@/hooks/use-google-sign-in") as typeof import("@/hooks/use-google-sign-in");

  return hookModule.useGoogleSignIn;
};

describe("useGoogleSignIn", () => {
  beforeEach(() => {
    mockPromptAsync.mockClear();
    mockUseIdTokenAuthRequest.mockClear();
    mockCredential.mockClear();
    mockSignInWithCredential.mockClear();
    mockPromptAsync.mockResolvedValue({
      type: "success",
      params: { id_token: "google-id-token" },
    });
    mockSignInWithCredential.mockResolvedValue({
      user: { uid: "firebase-uid" },
    });
  });

  it("configures a Google ID token auth request", async () => {
    const useGoogleSignIn = loadUseGoogleSignIn();

    await renderHook(() => useGoogleSignIn());

    expect(mockUseIdTokenAuthRequest).toHaveBeenCalledWith(
      {
        webClientId: "web-client-id",
        androidClientId: "android-client-id",
        iosClientId: undefined,
        scopes: ["profile", "email"],
        selectAccount: true,
      },
    );
  });

  it("prompts Google auth and signs in to Firebase", async () => {
    const useGoogleSignIn = loadUseGoogleSignIn();

    const { result } = await renderHook(() => useGoogleSignIn());

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(mockPromptAsync).toHaveBeenCalledTimes(1);
    expect(mockCredential).toHaveBeenCalledWith("google-id-token");
    expect(mockSignInWithCredential).toHaveBeenCalledWith(
      { name: "firebase-auth" },
      { providerId: "google.com" },
    );
    expect(result.current.error).toBeNull();
  });
});
