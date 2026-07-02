import { useState } from "react";

import * as WebBrowser from "expo-web-browser";
import type { UserCredential } from "firebase/auth";

import { firebaseAuth } from "@/services/firebaseConfig";
import { firebaseGoogleSignInDependencies } from "@/services/firebaseGoogleAuth";
import { useIdTokenAuthRequest } from "@/services/googleAuthProvider";
import { env } from "@/services/env";
import {
  buildGoogleAuthRequestConfig,
  handleGoogleAuthSessionResponse,
} from "@/services/googleAuth";

if (typeof WebBrowser.maybeCompleteAuthSession === "function") {
  WebBrowser.maybeCompleteAuthSession();
}

export const useGoogleSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const configurationError = env.google.webClientId
    ? null
    : new Error(
        "Missing required environment variable: EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID",
      );
  const [request, , promptAsync] = useIdTokenAuthRequest(
    buildGoogleAuthRequestConfig(env.google),
  );

  const signInWithGoogle = async (): Promise<UserCredential | null> => {
    setIsLoading(true);
    setError(null);

    try {
      if (configurationError) {
        throw configurationError;
      }

      const response = await promptAsync();
      return await handleGoogleAuthSessionResponse(
        response,
        firebaseAuth,
        firebaseGoogleSignInDependencies,
      );
    } catch (caughtError) {
      const nextError =
        caughtError instanceof Error
          ? caughtError
          : new Error(String(caughtError));

      setError(nextError);
      throw nextError;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    request,
    isReady: Boolean(request) && !configurationError,
    isLoading,
    error: error ?? configurationError,
    signInWithGoogle,
  };
};
