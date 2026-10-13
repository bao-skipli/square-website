import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { ref, set, get, update } from "firebase/database";
import { auth, database } from "./firebaseConfig";

export function getFriendlyErrorMessage(error) {
  if (!error) return "An unexpected error occurred. Please try again.";

  const code = error.code || "";
  const rawMsg = error.message || "";

  switch (code) {
    case "auth/invalid-credential":
      return "Invalid email or password. Please check your credentials and try again.";
    case "auth/user-not-found":
      return "No account found with this email address. Please sign up instead.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/email-already-in-use":
      return "This email is already registered. Please sign in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password is too weak. Please use at least 6 characters.";
    case "auth/missing-password":
      return "Please enter your password.";
    case "auth/missing-email":
      return "Please enter your email address.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact customer support.";
    case "auth/too-many-requests":
      return "Access temporarily disabled due to multiple failed login attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network connection issue. Please check your internet connection.";
    case "auth/operation-not-allowed":
      return "Email and password authentication is currently disabled.";
    case "functions/unauthenticated":
      return "You must be signed in to perform this action.";
    case "functions/resource-exhausted":
      return rawMsg.replace(/^.*:\s*/, "") || "Too many attempts. Please wait a moment and try again.";
    case "functions/deadline-exceeded":
      return "The verification code has expired. Please request a new code.";
    case "functions/invalid-argument":
      return rawMsg.replace(/^.*:\s*/, "") || "Invalid verification code. Please check and try again.";
    case "functions/not-found":
      return "Verification service is initializing or not deployed. Please try again.";
    default: {
      if (rawMsg.includes("auth/invalid-credential")) {
        return "Invalid email or password. Please check your credentials and try again.";
      }
      if (rawMsg.includes("auth/email-already-in-use")) {
        return "This email is already registered. Please sign in instead.";
      }
      if (rawMsg.includes("auth/weak-password")) {
        return "Password is too weak. Please use at least 6 characters.";
      }
      if (rawMsg.includes("auth/invalid-email")) {
        return "Please enter a valid email address.";
      }
      if (rawMsg.includes("auth/user-not-found")) {
        return "No account found with this email address.";
      }
      if (rawMsg.includes("auth/wrong-password")) {
        return "Incorrect password. Please try again.";
      }
      if (rawMsg.includes("auth/too-many-requests")) {
        return "Access temporarily disabled due to multiple failed login attempts. Please try again later.";
      }
      return (
        rawMsg
          .replace(/^Firebase:\s*(Error\s*)?/i, "")
          .replace(/\s*\([a-z0-9_-]+\/[^)]+\)\.?/i, "")
          .trim() || "An unexpected error occurred. Please try again."
      );
    }
  }
}

export async function registerUser(email, password, locale = "United States (English)") {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log(user.uid);

    try {
      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, {
        uid: user.uid,
        email: user.email,
        locale: locale,
        emailVerified: false,
        createdAt: new Date().toISOString(),
      });
    } catch (dbError) {
      console.warn("Realtime Database save warning:", dbError);
    }

    return user;
  } catch (error) {
    const friendlyError = new Error(getFriendlyErrorMessage(error));
    friendlyError.code = error.code;
    throw friendlyError;
  }
}

export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    const friendlyError = new Error(getFriendlyErrorMessage(error));
    friendlyError.code = error.code;
    throw friendlyError;
  }
}

export async function logoutUser() {
  await signOut(auth);
}

export function subscribeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserProfile(uid) {
  const userRef = ref(database, `users/${uid}`);
  const snapshot = await get(userRef);
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
}

export async function isEmailVerified(user) {
  if (!user) return false;
  if (user.emailVerified) return true;
  try {
    const profile = await getUserProfile(user.uid);
    return Boolean(profile && profile.emailVerified);
  } catch (err) {
    console.warn("Check email verified error:", err);
    return false;
  }
}

export async function saveUserBusinessInfo(data) {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be signed in to save business information.");

  const businessRef = ref(database, `users/${user.uid}/businessInfo`);
  await update(businessRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
  return true;
}

export async function getUserBusinessInfo(uid) {
  const targetUid = uid || (auth.currentUser ? auth.currentUser.uid : null);
  if (!targetUid) return null;

  const businessRef = ref(database, `users/${targetUid}/businessInfo`);
  const snapshot = await get(businessRef);
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
}

export async function sendVerificationEmailCode() {
  const user = auth.currentUser;
  const uid = user ? user.uid : "anonymous";
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  sessionStorage.setItem(`verify_code_${uid}`, code);

  if (user) {
    try {
      await update(ref(database, `users/${user.uid}`), {
        verificationCode: code,
        codeGeneratedAt: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.warn("Save verification code warning:", dbErr);
    }
  }

  console.log(
    `%c[VERIFICATION CODE] 🔑 Code: %c${code}`,
    "background: #111; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 14px;",
    "background: #007a3d; color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 18px; font-weight: bold; letter-spacing: 2px;"
  );

  return {
    success: true,
    code,
    message: `Verification code: ${code}`,
  };
}

export async function confirmVerificationCode(code) {
  const user = auth.currentUser;
  const uid = user ? user.uid : "anonymous";
  let expectedCode = sessionStorage.getItem(`verify_code_${uid}`);

  if (!expectedCode && user) {
    try {
      const snap = await get(ref(database, `users/${user.uid}/verificationCode`));
      if (snap.exists()) {
        expectedCode = snap.val();
      }
    } catch (e) {
      console.warn("Fetch verification code error:", e);
    }
  }

  if (expectedCode && code.trim() === expectedCode.trim()) {
    sessionStorage.removeItem(`verify_code_${uid}`);

    if (user) {
      try {
        await update(ref(database, `users/${user.uid}`), {
          emailVerified: true,
          verifiedAt: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn("Database update error:", dbErr);
      }
    }

    return {
      success: true,
      message: "Email verified successfully.",
    };
  }

  throw new Error("Incorrect verification code. Please try again.");
}
