import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  increment,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

class ClassService {
  // Get all classes
  async getClasses() {
    try {
      const classesRef = collection(db, "classes");
      const q = query(classesRef, orderBy("datetime", "asc"));
      const querySnapshot = await getDocs(q);

      const classes = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        classes.push({
          id: doc.id,
          ...data,
          datetime: data.datetime?.toDate(), // Convert Firestore timestamp
        });
      });

      return { success: true, classes };
    } catch (error) {
      console.error("Error fetching classes:", error);
      return { success: false, error: error.message };
    }
  }

  // Get classes for today
  async getTodaysClasses() {
    try {
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
      );

      const classesRef = collection(db, "classes");
      const q = query(
        classesRef,
        where("datetime", ">=", Timestamp.fromDate(startOfDay)),
        where("datetime", "<", Timestamp.fromDate(endOfDay)),
        orderBy("datetime", "asc"),
      );

      const querySnapshot = await getDocs(q);
      const classes = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        classes.push({
          id: doc.id,
          ...data,
          datetime: data.datetime?.toDate(),
        });
      });

      return { success: true, classes };
    } catch (error) {
      console.error("Error fetching today's classes:", error);
      return { success: false, error: error.message };
    }
  }

  // Listen to class updates in real-time
  subscribeToClasses(callback) {
    const classesRef = collection(db, "classes");
    const q = query(classesRef, orderBy("datetime", "asc"));

    return onSnapshot(q, (querySnapshot) => {
      const classes = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        classes.push({
          id: doc.id,
          ...data,
          datetime: data.datetime?.toDate(),
        });
      });
      callback(classes);
    });
  }

  // Book a class
  async bookClass(classId, userId, userInfo) {
    try {
      const classRef = doc(db, "classes", classId);
      const classDoc = await getDoc(classRef);

      if (!classDoc.exists()) {
        return { success: false, error: "Class not found" };
      }

      const classData = classDoc.data();

      // Check if class is full
      if (
        classData.bookedMembers &&
        classData.bookedMembers.length >= classData.maxCapacity
      ) {
        return { success: false, error: "Class is full" };
      }

      // Check if user already booked
      if (classData.bookedMembers && classData.bookedMembers.includes(userId)) {
        return { success: false, error: "You have already booked this class" };
      }

      // Update class with new booking
      await updateDoc(classRef, {
        bookedMembers: arrayUnion(userId),
        spotsLeft: increment(-1),
      });

      // Create booking record
      const bookingRef = collection(db, "bookings");
      await addDoc(bookingRef, {
        classId,
        userId,
        userName: userInfo.name || userInfo.email,
        userEmail: userInfo.email,
        bookedAt: new Date(),
        status: "confirmed",
        price: classData.price,
      });

      // Update user's class count
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        classesAttended: increment(1),
      });

      return { success: true, message: "Class booked successfully!" };
    } catch (error) {
      console.error("Error booking class:", error);
      return { success: false, error: error.message };
    }
  }

  // Cancel a class booking
  async cancelBooking(classId, userId) {
    try {
      const classRef = doc(db, "classes", classId);

      // Update class to remove user
      await updateDoc(classRef, {
        bookedMembers: arrayRemove(userId),
        spotsLeft: increment(1),
      });

      // Update booking status
      const bookingsRef = collection(db, "bookings");
      const q = query(
        bookingsRef,
        where("classId", "==", classId),
        where("userId", "==", userId),
        where("status", "==", "confirmed"),
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, {
          status: "cancelled",
          cancelledAt: new Date(),
        });
      });

      return { success: true, message: "Booking cancelled successfully" };
    } catch (error) {
      console.error("Error cancelling booking:", error);
      return { success: false, error: error.message };
    }
  }

  // Get user's bookings
  async getUserBookings(userId) {
    try {
      const bookingsRef = collection(db, "bookings");
      const q = query(
        bookingsRef,
        where("userId", "==", userId),
        orderBy("bookedAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const bookings = [];

      for (const doc of querySnapshot.docs) {
        const bookingData = doc.data();

        // Get class details
        const classDoc = await getDoc(doc(db, "classes", bookingData.classId));
        const classData = classDoc.exists() ? classDoc.data() : {};

        bookings.push({
          id: doc.id,
          ...bookingData,
          classDetails: {
            ...classData,
            datetime: classData.datetime?.toDate(),
          },
        });
      }

      return { success: true, bookings };
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      return { success: false, error: error.message };
    }
  }

  // Add a new class (admin function)
  async addClass(classData) {
    try {
      const classesRef = collection(db, "classes");
      const docRef = await addDoc(classesRef, {
        ...classData,
        datetime: Timestamp.fromDate(classData.datetime),
        createdAt: new Date(),
        bookedMembers: [],
        spotsLeft: classData.maxCapacity,
      });

      return { success: true, classId: docRef.id };
    } catch (error) {
      console.error("Error adding class:", error);
      return { success: false, error: error.message };
    }
  }

  // Update class (admin function)
  async updateClass(classId, updates) {
    try {
      const classRef = doc(db, "classes", classId);

      // Convert datetime to Timestamp if present
      if (updates.datetime) {
        updates.datetime = Timestamp.fromDate(updates.datetime);
      }

      await updateDoc(classRef, {
        ...updates,
        updatedAt: new Date(),
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating class:", error);
      return { success: false, error: error.message };
    }
  }

  // Delete class (admin function)
  async deleteClass(classId) {
    try {
      await deleteDoc(doc(db, "classes", classId));
      return { success: true };
    } catch (error) {
      console.error("Error deleting class:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new ClassService();
