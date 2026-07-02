import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";

export const firebaseGoogleSignInDependencies = {
  credential: (idToken: string) => GoogleAuthProvider.credential(idToken),
  signIn: signInWithCredential,
};
