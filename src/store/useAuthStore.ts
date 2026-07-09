'use client';

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

import type { Customer } from "@/types/customer";

async function createSessionCookie(user: any): Promise<boolean> {
  try {
    const idToken = await user.getIdToken();
    const res = await fetch("/api/auth/session", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.warn("Failed to create session cookie", res.status, text);
      return false;
    }
    return true;
  } catch (e) {
    console.warn("createSessionCookie error", e);
    return false;
  }
}

async function deleteSessionCookie() {
  try {
    await fetch("/api/auth/session", { method: "DELETE" });
  } catch (e) {
    console.warn("deleteSessionCookie error", e);
  }
}

async function syncCustomClaims(user: any): Promise<void> {
  try {
    const idToken = await user.getIdToken();
    await fetch("/api/auth/sync-claims", {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}` },
      credentials: "include",
    });
    await user.getIdToken(true);
  } catch {
    console.warn("syncCustomClaims error");
  }
}

function clearLocalStorageData() {
  try {
    localStorage.removeItem("glowguide-customer-store");
    localStorage.removeItem("glowguide-cart-store");
    localStorage.removeItem("glowguide-wishlist-store");
  } catch (e) {
  }
}

export type LoginSource = "customer" | "admin";

const ROLE_MISMATCH_ADMIN_ON_CUSTOMER_LOGIN = "ADMIN_ON_CUSTOMER_LOGIN";
const ROLE_MISMATCH_CUSTOMER_ON_ADMIN_LOGIN = "CUSTOMER_ON_ADMIN_LOGIN";

interface AuthState {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
  login: (email: string, password: string, source?: LoginSource) => Promise<{ success: boolean; error?: string }>;
  signup: (displayName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (source?: LoginSource) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateCustomer: (updates: Partial<Customer>) => Promise<void>;
  refreshCustomer: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      customer: null,
      isAuthenticated: false,
      isLoading: true,
      initialized: false,

      login: async (email, password, source) => {
        try {
          const cred = await signInWithEmailAndPassword(auth, email, password);
          const uid = cred.user.uid;
          const docSnap = await getDoc(doc(db, "customers", uid));

          if (!docSnap.exists()) {
            await signOut(auth);
            set({ isLoading: false, initialized: true });
            return { success: false, error: "Account not fully set up. Please sign up again." };
          }

          const data = docSnap.data() as Customer;

          if (source === "customer" && data.role === "ADMIN") {
            await signOut(auth);
            set({ isLoading: false, initialized: true });
            return { success: false, error: ROLE_MISMATCH_ADMIN_ON_CUSTOMER_LOGIN };
          }

          if (source === "admin" && data.role === "CUSTOMER") {
            await signOut(auth);
            set({ isLoading: false, initialized: true });
            return { success: false, error: ROLE_MISMATCH_CUSTOMER_ON_ADMIN_LOGIN };
          }

          await syncCustomClaims(cred.user);

          const cookieCreated = await createSessionCookie(cred.user);
          if (!cookieCreated) {
            await signOut(auth);
            set({ isLoading: false, initialized: true });
            return { success: false, error: "Failed to create session. Please try again." };
          }

          set({ customer: data, isAuthenticated: true, isLoading: false, initialized: true });
          return { success: true };
        } catch (e: any) {
          let error = "Invalid email or password.";
          if (e.code === "auth/user-not-found") error = "No account found with this email.";
          if (e.code === "auth/wrong-password") error = "Incorrect password.";
          if (e.code === "auth/invalid-credential") error = "Invalid email or password.";
          if (e.code === "auth/too-many-requests") error = "Too many attempts. Try again later.";
          return { success: false, error };
        }
      },

      signup: async (displayName, email, password) => {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          const uid = cred.user.uid;

          await firebaseUpdateProfile(cred.user, { displayName });

          const token = await cred.user.getIdToken();

          const res = await fetch(`/api/auth/customer`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ displayName, email }),
          });

          if (!res.ok) {
            const body = await res.json();
            return { success: false, error: body.error?.message || "Failed to create profile." };
          }

          const data = await res.json();

          await syncCustomClaims(cred.user);

          const cookieCreated = await createSessionCookie(cred.user);
          if (!cookieCreated) {
            await signOut(auth);
            set({ isLoading: false, initialized: true });
            return { success: false, error: "Failed to create session. Please try again." };
          }
          set({ customer: data.customer, isAuthenticated: true, isLoading: false, initialized: true });
          return { success: true };
        } catch (e: any) {
          let error = "Registration failed.";
          if (e.code === "auth/email-already-in-use") error = "An account with this email already exists.";
          if (e.code === "auth/weak-password") error = "Password must be at least 6 characters.";
          return { success: false, error };
        }
      },

      loginWithGoogle: async (source) => {
        try {
          const provider = new GoogleAuthProvider();
          const cred = await signInWithPopup(auth, provider);
          const uid = cred.user.uid;

          const docSnap = await getDoc(doc(db, "customers", uid));

          if (docSnap.exists()) {
            const data = docSnap.data() as Customer;

            if (source === "customer" && data.role === "ADMIN") {
              await signOut(auth);
              set({ isLoading: false, initialized: true });
              return { success: false, error: ROLE_MISMATCH_ADMIN_ON_CUSTOMER_LOGIN };
            }

            if (source === "admin" && data.role === "CUSTOMER") {
              await signOut(auth);
              set({ isLoading: false, initialized: true });
              return { success: false, error: ROLE_MISMATCH_CUSTOMER_ON_ADMIN_LOGIN };
            }

            await syncCustomClaims(cred.user);

            const cookieCreated = await createSessionCookie(cred.user);
            if (!cookieCreated) {
              await signOut(auth);
              set({ isLoading: false, initialized: true });
              return { success: false, error: "Failed to create session. Please try again." };
            }
            set({ customer: data, isAuthenticated: true, isLoading: false, initialized: true });
            return { success: true };
          }

          const token = await cred.user.getIdToken();
          const res = await fetch(`/api/auth/customer`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              displayName: cred.user.displayName || "",
              email: cred.user.email,
              photoURL: cred.user.photoURL,
            }),
          });

          if (!res.ok) {
            return { success: false, error: "Failed to create profile after Google sign-in." };
          }

          const data = await res.json();
          if (!data.customer) {
            await signOut(auth);
            set({ isLoading: false, initialized: true });
            return { success: false, error: "Account not fully set up. Please sign up again." };
          }

          await syncCustomClaims(cred.user);

          const cookieCreated = await createSessionCookie(cred.user);
          if (!cookieCreated) {
            await signOut(auth);
            set({ isLoading: false, initialized: true });
            return { success: false, error: "Failed to create session. Please try again." };
          }
          set({ customer: data.customer, isAuthenticated: true, isLoading: false, initialized: true });
          return { success: true };
        } catch (e: any) {
          if (e.code === "auth/popup-closed-by-user") {
            return { success: false, error: "Sign-in cancelled." };
          }
          return { success: false, error: "Google sign-in failed. Try again." };
        }
      },

      logout: async () => {
        await deleteSessionCookie();
        await signOut(auth);
        clearLocalStorageData();
        set({ customer: null, isAuthenticated: false, isLoading: false });
      },

      updateCustomer: async (updates) => {
        const { customer } = get();
        if (!customer) return;
        const updated = { ...customer, ...updates, updatedAt: new Date().toISOString() };
        await updateDoc(doc(db, "customers", customer.uid), updates);
        set({ customer: updated });
      },

      refreshCustomer: async () => {
        const { customer } = get();
        if (!customer) return;
        const docSnap = await getDoc(doc(db, "customers", customer.uid));
        if (docSnap.exists()) {
          set({ customer: docSnap.data() as Customer });
        }
      },
    }),
    {
      name: "glowguide-customer-store",
      skipHydration: true,
      partialize: (state) => ({
        customer: state.customer,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

let unsubscribeAuth: (() => void) | null = null;

async function signOutAndRedirect(targetUrl: string) {
  await deleteSessionCookie();
  await signOut(auth);
  clearLocalStorageData();
  useAuthStore.setState({ customer: null, isAuthenticated: false, isLoading: false, initialized: true });
  window.location.replace(targetUrl);
}

export function initAuthListener() {
  if (unsubscribeAuth) return;

  unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const docSnap = await getDoc(doc(db, "customers", user.uid));
        if (!docSnap.exists()) {
          useAuthStore.setState({ isLoading: false, initialized: true });
          return;
        }

        const firestoreCustomer = docSnap.data() as Customer;

        let tokenResult = await user.getIdTokenResult();
        let claimRole = tokenResult.claims.role as string | undefined;

        if (claimRole !== firestoreCustomer.role) {
          await user.getIdToken(true);
          tokenResult = await user.getIdTokenResult();
          claimRole = tokenResult.claims.role as string | undefined;
        }

        if (claimRole !== firestoreCustomer.role) {
          try {
            const idToken = await user.getIdToken();
            await fetch("/api/auth/sync-claims", {
              method: "POST",
              headers: { Authorization: `Bearer ${idToken}` },
              credentials: "include",
            });
            await user.getIdToken(true);
            const refreshed = await user.getIdTokenResult();
            claimRole = refreshed.claims.role as string | undefined;
          } catch {
            claimRole = firestoreCustomer.role;
          }
        }

        if (claimRole !== firestoreCustomer.role) {
          const redirectUrl = firestoreCustomer.role === "ADMIN" ? "/admin/login" : "/login";
          await signOutAndRedirect(redirectUrl);
          return;
        }

        useAuthStore.setState({
          customer: firestoreCustomer,
          isAuthenticated: true,
          isLoading: false,
          initialized: true,
        });
      } catch {
        useAuthStore.setState({ isLoading: false, initialized: true });
      }
    } else {
      useAuthStore.setState({
        customer: null,
        isAuthenticated: false,
        isLoading: false,
        initialized: true,
      });
    }
  });
}

export const useAuth = useAuthStore;
