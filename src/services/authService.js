import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

class AuthService {
  // Listen to authentication state changes
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, get additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};

          const fullUserData = {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            displayName: user.displayName,
            photoURL: user.photoURL,
            ...userData,
          };

          callback(fullUserData);
        } catch (error) {
          console.error("Error fetching user data:", error);
          callback({
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            displayName: user.displayName,
            photoURL: user.photoURL,
          });
        }
      } else {
        // User is signed out
        callback(null);
      }
    });
  }

  // Sign up new user
  async signUp(email, password, additionalInfo = {}) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Create user profile in Firestore
      const userData = {
        email: user.email,
        createdAt: new Date(),
        memberSince: new Date().toLocaleDateString("en-GB", {
          month: "short",
          year: "numeric",
        }),
        classesAttended: 0,
        currentStreak: 0,
        nextGoal: "Complete your first class",
        membership: "Basic",
        avatar:
          (additionalInfo.firstName || email.charAt(0)).toUpperCase() +
          (additionalInfo.lastName || email.charAt(1) || "").toUpperCase(),
        ...additionalInfo,
      };

      await setDoc(doc(db, "users", user.uid), userData);

      // Update display name if provided
      if (additionalInfo.firstName && additionalInfo.lastName) {
        await updateProfile(user, {
          displayName: `${additionalInfo.firstName} ${additionalInfo.lastName}`,
        });
      }

      return { success: true, user: { ...user, ...userData } };
    } catch (error) {
      console.error("Sign up error:", error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Sign in existing user
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Get additional user data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};

      return {
        success: true,
        user: { ...user, ...userData },
      };
    } catch (error) {
      console.error("Sign in error:", error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Sign out user
  async signOut() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error("Sign out error:", error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }

  // Update user profile
  async updateUserProfile(userId, updates) {
    try {
      await updateDoc(doc(db, "users", userId), {
        ...updates,
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (error) {
      console.error("Update profile error:", error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error("Reset password error:", error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Change password
  async changePassword(newPassword) {
    try {
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, newPassword);
        return { success: true };
      } else {
        return { success: false, error: "No user signed in" };
      }
    } catch (error) {
      console.error("Change password error:", error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Helper method to get user-friendly error messages
  getErrorMessage(errorCode) {
    switch (errorCode) {
      case "auth/user-not-found":
        return "No account found with this email address.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/weak-password":
        return "Password should be at least 6 characters long.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection.";
      default:
        return "An error occurred. Please try again.";
    }
  }
}

export default new AuthService();
