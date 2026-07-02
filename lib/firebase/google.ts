import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./client";
import { setTokenCookie } from "./token";

const provider = new GoogleAuthProvider();
// Always show the Google account chooser.
provider.setCustomParameters({ prompt: "select_account" });

/** Open the Google account chooser, then persist the resulting ID token. */
export async function signInWithGoogle(): Promise<string> {
  const cred = await signInWithPopup(auth, provider);
  const token = await cred.user.getIdToken();
  setTokenCookie(token);
  return token;
}
