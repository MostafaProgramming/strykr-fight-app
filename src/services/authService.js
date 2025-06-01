import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  updateEmail,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  increment,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

class AuthService {
  // Register new user
  async register(email, password, firstName, lastName) {
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Create user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: email,
        firstName: firstName,
        lastName: lastName,
        name: `${firstName} ${lastName}`,
        avatar: firstName.charAt(0) + lastName.charAt(0),
        memberSince: "May 2025", // You can make this dynamic
        classesAttended: 0,
        currentStreak: 0,
        nextGoal: "Complete your first class",
        membership: "Basic",
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      });

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          name: `${firstName} ${lastName}`,
          firstName,
          lastName,
          avatar: firstName.charAt(0) + lastName.charAt(0),
          memberSince: "May 2025",
          classesAttended: 0,
          currentStreak: 0,
          nextGoal: "Complete your first class",
          membership: "Basic",
        },
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  }

  // Login user
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          ...userData,
        },
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  }

  // Logout user
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: error.message };
    }
  }

  // Send password reset email
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error("Password reset error:", error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  }

  // Update user profile
  async updateProfile(updates) {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: "No user logged in" };
      }

      // Update Firestore document
      await updateDoc(doc(db, "users", user.uid), {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date()),
      });

      // Update Firebase Auth profile if name changed
      if (updates.name) {
        await updateProfile(user, {
          displayName: updates.name,
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Profile update error:", error);
      return { success: false, error: error.message };
    }
  }

  // Increment classes attended (NEW FUNCTION)
  async incrementClassesAttended(userId) {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        classesAttended: increment(1),
        updatedAt: Timestamp.fromDate(new Date()),
      });

      return { success: true };
    } catch (error) {
      console.error("Error incrementing classes attended:", error);
      return { success: false, error: error.message };
    }
  }

  // Update user streak (NEW FUNCTION)
  async updateStreak(userId, newStreak) {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        currentStreak: newStreak,
        updatedAt: Timestamp.fromDate(new Date()),
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating streak:", error);
      return { success: false, error: error.message };
    }
  }

  // Get current user profile
  async getCurrentUserProfile() {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: "No user logged in" };
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          ...userData,
        },
      };
    } catch (error) {
      console.error("Error getting user profile:", error);
      return { success: false, error: error.message };
    }
  }

  // Helper function to get user-friendly error messages
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

  // Get current user (synchronous)
  getCurrentUser() {
    return auth.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(callback);
  }
}

export default new AuthService();
