// src/services/gradingService.js
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

class GradingService {
  // Submit grading application
  async submitGradingApplication(
    userId,
    userInfo,
    currentBandId,
    targetBandId,
  ) {
    try {
      const applicationsRef = collection(db, "gradingApplications");

      const application = {
        userId,
        userName: userInfo.name,
        userEmail: userInfo.email,
        currentBandId,
        targetBandId,
        submittedAt: Timestamp.fromDate(new Date()),
        status: "pending", // pending, approved, rejected, completed
        classesAttended: userInfo.classesAttended,
        monthsTraining: userInfo.monthsTraining,
        notes: "",
        gradingDate: null,
        result: null,
      };

      const docRef = await addDoc(applicationsRef, application);

      return {
        success: true,
        applicationId: docRef.id,
        message: "Grading application submitted successfully!",
      };
    } catch (error) {
      console.error("Error submitting grading application:", error);
      return { success: false, error: error.message };
    }
  }

  // Get user's grading applications
  async getUserGradingApplications(userId) {
    try {
      const applicationsRef = collection(db, "gradingApplications");
      const q = query(
        applicationsRef,
        where("userId", "==", userId),
        orderBy("submittedAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const applications = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        applications.push({
          id: doc.id,
          ...data,
          submittedAt: data.submittedAt?.toDate(),
          gradingDate: data.gradingDate?.toDate(),
        });
      });

      return { success: true, applications };
    } catch (error) {
      console.error("Error fetching grading applications:", error);
      return { success: false, error: error.message };
    }
  }

  // Get next grading session info
  async getNextGradingSession() {
    try {
      const gradingSessionsRef = collection(db, "gradingSessions");
      const q = query(
        gradingSessionsRef,
        where("date", ">", Timestamp.fromDate(new Date())),
        orderBy("date", "asc"),
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        return {
          success: true,
          session: {
            id: querySnapshot.docs[0].id,
            ...data,
            date: data.date?.toDate(),
          },
        };
      }

      return {
        success: false,
        error: "No upcoming grading sessions scheduled",
      };
    } catch (error) {
      console.error("Error fetching next grading session:", error);
      return { success: false, error: error.message };
    }
  }

  // Admin: Get all pending applications
  async getPendingApplications() {
    try {
      const applicationsRef = collection(db, "gradingApplications");
      const q = query(
        applicationsRef,
        where("status", "==", "pending"),
        orderBy("submittedAt", "asc"),
      );

      const querySnapshot = await getDocs(q);
      const applications = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        applications.push({
          id: doc.id,
          ...data,
          submittedAt: data.submittedAt?.toDate(),
        });
      });

      return { success: true, applications };
    } catch (error) {
      console.error("Error fetching pending applications:", error);
      return { success: false, error: error.message };
    }
  }

  // Admin: Create grading session
  async createGradingSession(sessionData) {
    try {
      const gradingSessionsRef = collection(db, "gradingSessions");

      const session = {
        ...sessionData,
        date: Timestamp.fromDate(sessionData.date),
        createdAt: Timestamp.fromDate(new Date()),
        applicants: [],
        maxCapacity: sessionData.maxCapacity || 20,
      };

      const docRef = await addDoc(gradingSessionsRef, session);

      return {
        success: true,
        sessionId: docRef.id,
        message: "Grading session created successfully!",
      };
    } catch (error) {
      console.error("Error creating grading session:", error);
      return { success: false, error: error.message };
    }
  }

  // Update user's current band after successful grading
  async updateUserBand(userId, newBandId) {
    try {
      const userRef = doc(db, "users", userId);

      await updateDoc(userRef, {
        currentBand: newBandId,
        lastGradingDate: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      });

      return { success: true, message: "User band updated successfully!" };
    } catch (error) {
      console.error("Error updating user band:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new GradingService();
