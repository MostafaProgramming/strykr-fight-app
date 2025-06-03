// src/setup/GradingSystemSetup.js
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

class GradingSystemSetup {
  // Setup grading sessions for the next 6 months
  async setupGradingSessions() {
    try {
      console.log("Setting up grading sessions...");

      const gradingSessionsRef = collection(db, "gradingSessions");

      // Create monthly grading sessions for the next 6 months
      const today = new Date();
      const sessions = [];

      for (let i = 1; i <= 6; i++) {
        const sessionDate = new Date(
          today.getFullYear(),
          today.getMonth() + i,
          15,
        ); // 15th of each month
        sessionDate.setHours(14, 0, 0, 0); // 2 PM

        const session = {
          date: Timestamp.fromDate(sessionDate),
          title: `Monthly Grading Session - ${sessionDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
          location: "Main Training Hall",
          maxCapacity: 20,
          instructor: "Kru David",
          description:
            "Monthly grading assessment for all levels. Students must have submitted applications in advance.",
          applicants: [],
          status: "scheduled", // scheduled, in-progress, completed, cancelled
          createdAt: Timestamp.fromDate(new Date()),
          requirements: [
            "Must have submitted grading application",
            "Minimum attendance requirements met",
            "Instructor approval required",
            "Arrive 15 minutes early for warm-up",
          ],
        };

        sessions.push(session);
      }

      // Add sessions to Firebase
      const addPromises = sessions.map((session) =>
        addDoc(gradingSessionsRef, session),
      );
      await Promise.all(addPromises);

      return {
        success: true,
        message: `Created ${sessions.length} grading sessions`,
        sessionsCount: sessions.length,
      };
    } catch (error) {
      console.error("Error setting up grading sessions:", error);
      return { success: false, error: error.message };
    }
  }

  // Add grading system to existing users
  async updateExistingUsersWithGrading() {
    try {
      console.log("Updating existing users with grading system...");

      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);

      const updatePromises = [];

      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();

        // Determine current band based on classes attended
        let currentBand = 1; // Default to White (Beginner)
        const classesAttended = userData.classesAttended || 0;

        if (classesAttended >= 200)
          currentBand = 10; // Red
        else if (classesAttended >= 180)
          currentBand = 9; // Brown 3 Advanced
        else if (classesAttended >= 160)
          currentBand = 8; // Brown 3
        else if (classesAttended >= 140)
          currentBand = 7; // Brown 2
        else if (classesAttended >= 120)
          currentBand = 6; // Brown
        else if (classesAttended >= 100)
          currentBand = 5; // Blue 2
        else if (classesAttended >= 80)
          currentBand = 4; // Blue
        else if (classesAttended >= 60)
          currentBand = 3; // Green
        else if (classesAttended >= 40) currentBand = 2; // Yellow
        // else stays at 1 (White)

        const update = updateDoc(userDoc.ref, {
          currentBand: currentBand,
          lastGradingDate: null,
          gradingHistory: [],
          updatedAt: Timestamp.fromDate(new Date()),
        });

        updatePromises.push(update);
      });

      await Promise.all(updatePromises);

      return {
        success: true,
        message: `Updated ${usersSnapshot.size} users with grading system`,
        usersUpdated: usersSnapshot.size,
      };
    } catch (error) {
      console.error("Error updating users with grading system:", error);
      return { success: false, error: error.message };
    }
  }

  // Create sample grading applications for testing
  async createSampleGradingApplications() {
    try {
      console.log("Creating sample grading applications...");

      const applicationsRef = collection(db, "gradingApplications");

      // Get some users to create sample applications
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);

      if (usersSnapshot.empty) {
        return {
          success: false,
          error: "No users found to create sample applications",
        };
      }

      const sampleApplications = [];
      let count = 0;

      usersSnapshot.forEach((userDoc) => {
        if (count >= 3) return; // Only create 3 sample applications

        const userData = userDoc.data();
        const currentBand = userData.currentBand || 1;

        if (currentBand < 10) {
          // Only if not at max level
          const application = {
            userId: userDoc.id,
            userName: userData.name || userData.email,
            userEmail: userData.email,
            currentBandId: currentBand,
            targetBandId: currentBand + 1,
            submittedAt: Timestamp.fromDate(new Date()),
            status:
              count === 0 ? "approved" : count === 1 ? "pending" : "completed",
            classesAttended: userData.classesAttended || 0,
            monthsTraining: 6, // Sample data
            notes:
              count === 0 ? "Excellent technique and dedication shown." : "",
            gradingDate:
              count === 2
                ? Timestamp.fromDate(
                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  )
                : null, // 30 days ago
            result: count === 2 ? "passed" : null,
          };

          sampleApplications.push(application);
          count++;
        }
      });

      const addPromises = sampleApplications.map((app) =>
        addDoc(applicationsRef, app),
      );
      await Promise.all(addPromises);

      return {
        success: true,
        message: `Created ${sampleApplications.length} sample grading applications`,
        applicationsCount: sampleApplications.length,
      };
    } catch (error) {
      console.error("Error creating sample grading applications:", error);
      return { success: false, error: error.message };
    }
  }

  // Setup complete grading system
  async setupCompleteGradingSystem() {
    try {
      console.log("Setting up complete grading system...");

      const results = {
        sessions: await this.setupGradingSessions(),
        userUpdates: await this.updateExistingUsersWithGrading(),
        sampleApplications: await this.createSampleGradingApplications(),
      };

      const allSuccessful = Object.values(results).every(
        (result) => result.success,
      );

      if (allSuccessful) {
        return {
          success: true,
          message: "Complete grading system setup successful!",
          details: results,
        };
      } else {
        return {
          success: false,
          error: "Some parts of grading system setup failed",
          details: results,
        };
      }
    } catch (error) {
      console.error("Error setting up complete grading system:", error);
      return { success: false, error: error.message };
    }
  }

  // Clean up grading data (for testing)
  async cleanupGradingData() {
    try {
      console.log("Cleaning up grading data...");

      // Remove grading sessions
      const sessionsSnapshot = await getDocs(collection(db, "gradingSessions"));
      const sessionDeletePromises = sessionsSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref),
      );
      await Promise.all(sessionDeletePromises);

      // Remove grading applications
      const applicationsSnapshot = await getDocs(
        collection(db, "gradingApplications"),
      );
      const applicationDeletePromises = applicationsSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref),
      );
      await Promise.all(applicationDeletePromises);

      return {
        success: true,
        message: `Cleaned up ${sessionsSnapshot.size} sessions and ${applicationsSnapshot.size} applications`,
      };
    } catch (error) {
      console.error("Error cleaning up grading data:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new GradingSystemSetup();
