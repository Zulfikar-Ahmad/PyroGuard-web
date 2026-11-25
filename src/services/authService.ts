import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  deleteUser,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

/*
 * Authentication is handled entirely by Firebase Authentication (email + password).
 *
 * Usernames are not a Firebase concept, so each username is mapped to an email in the
 * Firestore collection  usernames/{usernameLowercase} = { uid, email }.
 * That is what lets people sign in with either their username or their email.
 * See firebase/firestore.rules for the matching security rules.
 */

export class AuthError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const USERNAME_RE = /^[a-zA-Z0-9_.]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INVALID_CREDENTIALS = 'Username/email atau password salah.';

function toAuthError(e: unknown): AuthError {
  if (e instanceof AuthError) return e;
  const code = (e as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return new AuthError('invalid-credentials', INVALID_CREDENTIALS);
    case 'auth/email-already-in-use':
      return new AuthError('email-in-use', 'Email sudah terdaftar.');
    case 'auth/invalid-email':
      return new AuthError('invalid-email', 'Format email tidak valid.');
    case 'auth/weak-password':
      return new AuthError('weak-password', 'Password minimal 6 karakter.');
    case 'auth/too-many-requests':
      return new AuthError('too-many-requests', 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.');
    case 'auth/user-disabled':
      return new AuthError('user-disabled', 'Akun ini dinonaktifkan.');
    case 'auth/network-request-failed':
    case 'unavailable':
      return new AuthError('network', 'Koneksi internet bermasalah. Coba lagi.');
    default:
      console.error('[auth] unexpected error:', e);
      return new AuthError('unknown', 'Terjadi kesalahan. Silakan coba lagi.');
  }
}

/** Turns "username or email" into an email address (null = unknown username). */
async function resolveEmail(identifier: string): Promise<string | null> {
  const id = identifier.trim();
  if (id.includes('@')) return id.toLowerCase();
  if (!USERNAME_RE.test(id)) return null;
  const snap = await getDoc(doc(db, 'usernames', id.toLowerCase()));
  return snap.exists() ? String(snap.data().email) : null;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const authService = {
  /** Creates the account, then sends a verification email. The user is signed out afterwards. */
  async register(input: RegisterInput): Promise<void> {
    const username = input.username.trim();
    const email = input.email.trim().toLowerCase();

    if (!USERNAME_RE.test(username)) {
      throw new AuthError('validation', 'Username 3-20 karakter: huruf, angka, titik atau garis bawah.');
    }
    if (!EMAIL_RE.test(email)) throw new AuthError('validation', 'Format email tidak valid.');
    if (input.password.length < 6) throw new AuthError('validation', 'Password minimal 6 karakter.');
    if (input.password !== input.confirmPassword) {
      throw new AuthError('validation', 'Konfirmasi password tidak sama.');
    }

    try {
      const usernameRef = doc(db, 'usernames', username.toLowerCase());
      if ((await getDoc(usernameRef)).exists()) {
        throw new AuthError('username-taken', 'Username sudah dipakai. Pilih username lain.');
      }

      const cred = await createUserWithEmailAndPassword(auth, email, input.password);

      try {
        await updateProfile(cred.user, { displayName: username });
        // Security rules only allow creating this document once, so a taken username fails here.
        await setDoc(usernameRef, { uid: cred.user.uid, email });
      } catch (inner) {
        await deleteUser(cred.user).catch(() => undefined); // roll back the half-made account
        if ((inner as { code?: string })?.code === 'permission-denied') {
          throw new AuthError('username-taken', 'Username sudah dipakai. Pilih username lain.');
        }
        throw inner;
      }

      try {
        await sendEmailVerification(cred.user);
      } catch {
        await signOut(auth);
        throw new AuthError(
          'verification-send-failed',
          'Akun dibuat, tetapi email verifikasi gagal dikirim. Gunakan "Kirim ulang email verifikasi" di halaman masuk.'
        );
      }
      await signOut(auth);
    } catch (e) {
      throw toAuthError(e);
    }
  },

  /** Signs in with username OR email. Unverified emails are refused. */
  async login(identifier: string, password: string, remember: boolean): Promise<void> {
    if (!identifier.trim() || !password) {
      throw new AuthError('validation', 'Username/email dan password wajib diisi.');
    }
    try {
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      const email = await resolveEmail(identifier);
      if (!email) throw new AuthError('invalid-credentials', INVALID_CREDENTIALS);

      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (!cred.user.emailVerified) {
        await signOut(auth);
        throw new AuthError(
          'email-not-verified',
          'Email belum diverifikasi. Buka email verifikasi yang kami kirim, lalu masuk lagi.'
        );
      }
    } catch (e) {
      throw toAuthError(e);
    }
  },

  /** Sends the verification email again (needs the correct password). */
  async resendVerification(identifier: string, password: string): Promise<void> {
    if (!identifier.trim() || !password) {
      throw new AuthError('validation', 'Isi username/email dan password terlebih dahulu.');
    }
    try {
      const email = await resolveEmail(identifier);
      if (!email) throw new AuthError('invalid-credentials', INVALID_CREDENTIALS);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      try {
        if (cred.user.emailVerified) {
          throw new AuthError('already-verified', 'Email sudah terverifikasi. Silakan masuk.');
        }
        await sendEmailVerification(cred.user);
      } finally {
        await signOut(auth);
      }
    } catch (e) {
      throw toAuthError(e);
    }
  },

  /**
   * Sends a password-reset email. Never reveals whether the account exists:
   * unknown usernames / emails complete silently.
   */
  async resetPassword(identifier: string): Promise<void> {
    if (!identifier.trim()) throw new AuthError('validation', 'Isi username atau email Anda.');
    try {
      const email = await resolveEmail(identifier);
      if (!email) return;
      await sendPasswordResetEmail(auth, email);
    } catch (e) {
      const err = toAuthError(e);
      if (err.code === 'invalid-credentials') return; // auth/user-not-found
      throw err;
    }
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  /** Firebase ID token, sent to the REST API as "Authorization: Bearer <token>". */
  async getIdToken(): Promise<string | null> {
    return (await auth.currentUser?.getIdToken()) ?? null;
  },
};
