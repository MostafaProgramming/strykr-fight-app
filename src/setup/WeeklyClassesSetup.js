// src/setup/WeeklyClassesSetup.js
// Clean version with no import conflicts

import {
  collection,
  addDoc,
  Timestamp,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../config/firebase";

// Helper function to get next occurrence of a weekday at specific time
const getNextClassDate = (dayOfWeek, timeString, weeksFromNow = 0) => {
  const now = new Date();
  const [hours, minutes] = timeString.split(":").map(Number);

  // Calculate days until next occurrence of this weekday
  const daysUntilClass = (dayOfWeek - now.getDay() + 7) % 7 || 7;

  const classDate = new Date(now);
  classDate.setDate(now.getDate() + daysUntilClass + weeksFromNow * 7);
  classDate.setHours(hours, minutes, 0, 0);

  return classDate;
};

// Helper function to get class date for a specific week
const getClassDateForWeek = (dayOfWeek, timeString, targetWeekStart) => {
  const [hours, minutes] = timeString.split(":").map(Number);

  const classDate = new Date(targetWeekStart);
  const daysToAdd = (dayOfWeek - targetWeekStart.getDay() + 7) % 7;
  classDate.setDate(targetWeekStart.getDate() + daysToAdd);
  classDate.setHours(hours, minutes, 0, 0);

  return classDate;
};

// Weekly class schedule template
const weeklySchedule = [
  // Monday (dayOfWeek: 1)
  {
    name: "Junior Beginners",
    instructor: "Kru Lisa",
    dayOfWeek: 1,
    startTime: "17:00",
    endTime: "17:45",
    difficulty: "Beginner",
    description:
      "Muay Thai fundamentals for young warriors aged 8-12. Learn basic techniques in a fun, safe environment.",
    price: 12,
    maxCapacity: 15,
    ageGroup: "Junior",
    tags: ["junior", "beginners", "fundamentals"],
  },
  {
    name: "Adult Beginners",
    instructor: "Kru James",
    dayOfWeek: 1,
    startTime: "18:00",
    endTime: "19:00",
    difficulty: "Beginner",
    description:
      "Perfect introduction to Muay Thai for adults. Learn proper stance, basic punches, kicks, and conditioning.",
    price: 15,
    maxCapacity: 20,
    ageGroup: "Adult",
    tags: ["adult", "beginners", "fundamentals"],
  },
  {
    name: "Adult Intermediate/Advanced",
    instructor: "Kru Sarah",
    dayOfWeek: 1,
    startTime: "19:00",
    endTime: "20:00",
    difficulty: "Intermediate",
    description:
      "Advanced techniques, combinations, and pad work for experienced practitioners.",
    price: 18,
    maxCapacity: 16,
    ageGroup: "Adult",
    tags: ["adult", "intermediate", "advanced", "combinations"],
  },

  // Tuesday (dayOfWeek: 2)
  {
    name: "Junior Intermediates",
    instructor: "Kru Mike",
    dayOfWeek: 2,
    startTime: "17:00",
    endTime: "18:00",
    difficulty: "Intermediate",
    description:
      "Building on fundamentals with more complex techniques for experienced young fighters.",
    price: 14,
    maxCapacity: 12,
    ageGroup: "Junior",
    tags: ["junior", "intermediate", "technique"],
  },
  {
    name: "Adult Intermediate/Advanced",
    instructor: "Kru Sarah",
    dayOfWeek: 2,
    startTime: "18:00",
    endTime: "19:00",
    difficulty: "Intermediate",
    description:
      "Intensive training focusing on advanced combinations and sparring techniques.",
    price: 18,
    maxCapacity: 16,
    ageGroup: "Adult",
    tags: ["adult", "intermediate", "advanced"],
  },
  {
    name: "Adult Beginners",
    instructor: "Kru Emma",
    dayOfWeek: 2,
    startTime: "19:00",
    endTime: "20:00",
    difficulty: "Beginner",
    description:
      "Evening beginners class for those who can't make Monday sessions.",
    price: 15,
    maxCapacity: 20,
    ageGroup: "Adult",
    tags: ["adult", "beginners", "evening"],
  },
  {
    name: "Fighters Training",
    instructor: "Kru David",
    dayOfWeek: 2,
    startTime: "20:00",
    endTime: "21:30",
    difficulty: "Advanced",
    description: "Elite training for competitive fighters. Invitation only.",
    price: 25,
    maxCapacity: 8,
    ageGroup: "Adult",
    tags: ["fighters", "elite", "competition", "invitation-only"],
  },

  // Wednesday (dayOfWeek: 3)
  {
    name: "Junior Beginners",
    instructor: "Kru Lisa",
    dayOfWeek: 3,
    startTime: "17:00",
    endTime: "17:45",
    difficulty: "Beginner",
    description:
      "Midweek junior session focusing on technique refinement and fun drills.",
    price: 12,
    maxCapacity: 15,
    ageGroup: "Junior",
    tags: ["junior", "beginners", "technique"],
  },
  {
    name: "Adult Beginners",
    instructor: "Kru James",
    dayOfWeek: 3,
    startTime: "18:00",
    endTime: "19:00",
    difficulty: "Beginner",
    description:
      "Continuing your Muay Thai journey with pad work and basic combinations.",
    price: 15,
    maxCapacity: 20,
    ageGroup: "Adult",
    tags: ["adult", "beginners", "pad-work"],
  },
  {
    name: "Adult Intermediate/Advanced",
    instructor: "Kru Sarah",
    dayOfWeek: 3,
    startTime: "19:00",
    endTime: "20:00",
    difficulty: "Intermediate",
    description:
      "Midweek intensive with focus on clinch work and advanced striking.",
    price: 18,
    maxCapacity: 16,
    ageGroup: "Adult",
    tags: ["adult", "intermediate", "clinch", "striking"],
  },

  // Thursday (dayOfWeek: 4)
  {
    name: "Junior Intermediates",
    instructor: "Kru Mike",
    dayOfWeek: 4,
    startTime: "17:00",
    endTime: "18:00",
    difficulty: "Intermediate",
    description:
      "Advanced junior training with light sparring and competition preparation.",
    price: 14,
    maxCapacity: 12,
    ageGroup: "Junior",
    tags: ["junior", "intermediate", "sparring", "competition"],
  },
  {
    name: "Adult Intermediate/Advanced",
    instructor: "Kru Sarah",
    dayOfWeek: 4,
    startTime: "18:00",
    endTime: "19:00",
    difficulty: "Intermediate",
    description:
      "Technical Thursday - perfecting your technique with detailed instruction.",
    price: 18,
    maxCapacity: 16,
    ageGroup: "Adult",
    tags: ["adult", "intermediate", "technical", "instruction"],
  },
  {
    name: "Adult Beginners",
    instructor: "Kru Emma",
    dayOfWeek: 4,
    startTime: "19:00",
    endTime: "20:00",
    difficulty: "Beginner",
    description:
      "Building confidence with basic combinations and defensive techniques.",
    price: 15,
    maxCapacity: 20,
    ageGroup: "Adult",
    tags: ["adult", "beginners", "defense", "confidence"],
  },
  {
    name: "Fighters Training",
    instructor: "Kru David",
    dayOfWeek: 4,
    startTime: "20:00",
    endTime: "21:30",
    difficulty: "Advanced",
    description: "Competition preparation and advanced sparring for fighters.",
    price: 25,
    maxCapacity: 8,
    ageGroup: "Adult",
    tags: ["fighters", "competition", "sparring", "advanced"],
  },

  // Friday (dayOfWeek: 5)
  {
    name: "Adult Beginners",
    instructor: "Kru James",
    dayOfWeek: 5,
    startTime: "18:00",
    endTime: "19:00",
    difficulty: "Beginner",
    description: "End the week strong with fundamental techniques and fitness.",
    price: 15,
    maxCapacity: 20,
    ageGroup: "Adult",
    tags: ["adult", "beginners", "fitness", "fundamentals"],
  },
  {
    name: "Adult Sparring",
    instructor: "Kru Mike",
    dayOfWeek: 5,
    startTime: "19:00",
    endTime: "20:00",
    difficulty: "Intermediate",
    description:
      "Controlled sparring session to practice techniques in a safe environment.",
    price: 20,
    maxCapacity: 14,
    ageGroup: "Adult",
    tags: ["adult", "sparring", "practice", "controlled"],
  },

  // Saturday (dayOfWeek: 6)
  {
    name: "Junior Beginners",
    instructor: "Kru Lisa",
    dayOfWeek: 6,
    startTime: "10:00",
    endTime: "10:45",
    difficulty: "Beginner",
    description:
      "Weekend warrior session for young beginners. Fun and energetic!",
    price: 12,
    maxCapacity: 15,
    ageGroup: "Junior",
    tags: ["junior", "beginners", "weekend", "fun"],
  },
  {
    name: "Junior Intermediates",
    instructor: "Kru Mike",
    dayOfWeek: 6,
    startTime: "11:00",
    endTime: "12:00",
    difficulty: "Intermediate",
    description:
      "Saturday skills session with focus on competition techniques.",
    price: 14,
    maxCapacity: 12,
    ageGroup: "Junior",
    tags: ["junior", "intermediate", "skills", "competition"],
  },
  {
    name: "Adult Beginners",
    instructor: "Kru Emma",
    dayOfWeek: 6,
    startTime: "12:00",
    endTime: "13:00",
    difficulty: "Beginner",
    description:
      "Weekend beginners session with relaxed atmosphere and comprehensive instruction.",
    price: 15,
    maxCapacity: 20,
    ageGroup: "Adult",
    tags: ["adult", "beginners", "weekend", "comprehensive"],
  },
  {
    name: "Adult Intermediate/Advanced",
    instructor: "Kru Sarah",
    dayOfWeek: 6,
    startTime: "13:00",
    endTime: "14:00",
    difficulty: "Intermediate",
    description:
      "Weekend warrior training with intensive pad work and conditioning.",
    price: 18,
    maxCapacity: 16,
    ageGroup: "Adult",
    tags: ["adult", "intermediate", "intensive", "conditioning"],
  },

  // Sunday (dayOfWeek: 0)
  {
    name: "Fighters (Invite Only)",
    instructor: "Kru David",
    dayOfWeek: 0,
    startTime: "12:00",
    endTime: "13:30",
    difficulty: "Advanced",
    description:
      "Exclusive Sunday session for competitive fighters and advanced practitioners.",
    price: 30,
    maxCapacity: 6,
    ageGroup: "Adult",
    tags: ["fighters", "invite-only", "exclusive", "advanced"],
    isInviteOnly: true,
  },
];

// Function to get the start of a week (Monday)
const getWeekStart = (date) => {
  const weekStart = new Date(date);
  const day = weekStart.getDay();
  const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

// Function to generate a week's worth of classes
const generateWeekClasses = (weekStartDate) => {
  const classesToAdd = [];

  for (const classTemplate of weeklySchedule) {
    const classDate = getClassDateForWeek(
      classTemplate.dayOfWeek,
      classTemplate.startTime,
      weekStartDate,
    );

    const classData = {
      name: classTemplate.name,
      instructor: classTemplate.instructor,
      datetime: Timestamp.fromDate(classDate),
      difficulty: classTemplate.difficulty,
      description: classTemplate.description,
      price: classTemplate.price,
      maxCapacity: classTemplate.maxCapacity,
      spotsLeft: classTemplate.maxCapacity,
      bookedMembers: [],
      ageGroup: classTemplate.ageGroup,
      tags: classTemplate.tags,
      isInviteOnly: classTemplate.isInviteOnly || false,
      dayOfWeek: classTemplate.dayOfWeek,
      startTime: classTemplate.startTime,
      endTime: classTemplate.endTime,
      weekStart: Timestamp.fromDate(weekStartDate),
      createdAt: Timestamp.fromDate(new Date()),
      isRecurring: true,
      scheduleId:
        `${classTemplate.name}_${classTemplate.dayOfWeek}_${classTemplate.startTime}`.replace(
          /[^a-zA-Z0-9]/g,
          "_",
        ),
    };

    classesToAdd.push(classData);
  }

  return classesToAdd;
};

// Main function to setup continuous weekly classes
export const setupContinuousWeeklyClasses = async (weeksToGenerate = 8) => {
  try {
    console.log("Setting up continuous weekly recurring classes...");

    // Clear existing classes first
    const classesRef = collection(db, "classes");
    const existingClasses = await getDocs(classesRef);

    if (existingClasses.size > 0) {
      console.log(`Removing ${existingClasses.size} existing classes...`);
      const deletePromises = existingClasses.docs.map((doc) =>
        deleteDoc(doc.ref),
      );
      await Promise.all(deletePromises);
    }

    const allClassesToAdd = [];
    const now = new Date();

    // Generate classes for the specified number of weeks starting from this week
    for (let week = 0; week < weeksToGenerate; week++) {
      const weekStart = getWeekStart(now);
      weekStart.setDate(weekStart.getDate() + week * 7);

      const weekClasses = generateWeekClasses(weekStart);

      // Only add classes that are in the future
      const futureClasses = weekClasses.filter(
        (cls) => cls.datetime.toDate() > now,
      );
      allClassesToAdd.push(...futureClasses);
    }

    // Add all classes to Firebase in batches
    console.log(`Adding ${allClassesToAdd.length} classes...`);

    // Add in batches of 50 to avoid Firebase limits
    const batchSize = 50;
    for (let i = 0; i < allClassesToAdd.length; i += batchSize) {
      const batch = allClassesToAdd.slice(i, i + batchSize);
      const addPromises = batch.map((classData) =>
        addDoc(classesRef, classData),
      );
      await Promise.all(addPromises);
      console.log(
        `Added batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allClassesToAdd.length / batchSize)}`,
      );
    }

    console.log("✅ Continuous weekly recurring classes setup complete!");
    console.log(
      `📅 Generated ${allClassesToAdd.length} classes for the next ${weeksToGenerate} weeks`,
    );

    return {
      success: true,
      message: `Successfully created ${allClassesToAdd.length} recurring classes for ${weeksToGenerate} weeks`,
      classCount: allClassesToAdd.length,
      weeksGenerated: weeksToGenerate,
    };
  } catch (error) {
    console.error("❌ Error setting up continuous weekly classes:", error);
    return { success: false, error: error.message };
  }
};

// Function to add the next week of classes (for maintenance/extension)
export const addNextWeek = async () => {
  try {
    const classesRef = collection(db, "classes");

    // Find the latest week that has classes
    const q = query(classesRef, orderBy("weekStart", "desc"));
    const snapshot = await getDocs(q);

    let nextWeekStart;
    if (snapshot.empty) {
      // No classes exist, start from this week
      nextWeekStart = getWeekStart(new Date());
    } else {
      // Get the week after the latest existing week
      const latestClass = snapshot.docs[0].data();
      const latestWeekStart = latestClass.weekStart.toDate();
      nextWeekStart = new Date(latestWeekStart);
      nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    }

    const weekClasses = generateWeekClasses(nextWeekStart);

    // Add all classes for the new week
    const addPromises = weekClasses.map((classData) =>
      addDoc(classesRef, classData),
    );
    await Promise.all(addPromises);

    console.log(
      `✅ Added ${weekClasses.length} classes for week starting ${nextWeekStart.toDateString()}`,
    );

    return {
      success: true,
      message: `Added ${weekClasses.length} classes for the next week`,
      classCount: weekClasses.length,
      weekStart: nextWeekStart,
    };
  } catch (error) {
    console.error("❌ Error adding next week of classes:", error);
    return { success: false, error: error.message };
  }
};

// Function to clean up old classes (remove classes older than 1 week)
export const cleanupOldClasses = async () => {
  try {
    const classesRef = collection(db, "classes");
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const q = query(
      classesRef,
      where("datetime", "<", Timestamp.fromDate(oneWeekAgo)),
    );

    const oldClasses = await getDocs(q);

    if (oldClasses.size > 0) {
      console.log(`Cleaning up ${oldClasses.size} old classes...`);
      const deletePromises = oldClasses.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    }

    return {
      success: true,
      message: `Cleaned up ${oldClasses.size} old classes`,
      deletedCount: oldClasses.size,
    };
  } catch (error) {
    console.error("❌ Error cleaning up old classes:", error);
    return { success: false, error: error.message };
  }
};

// Function to maintain the schedule (cleanup old + add new weeks)
export const maintainSchedule = async () => {
  try {
    console.log("🔄 Maintaining continuous schedule...");

    // Clean up old classes
    const cleanupResult = await cleanupOldClasses();

    // Check how many weeks ahead we have scheduled
    const classesRef = collection(db, "classes");
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14); // 2 weeks from now

    const q = query(
      classesRef,
      where("datetime", ">", Timestamp.fromDate(futureDate)),
    );

    const futureClasses = await getDocs(q);
    const weeksAhead = Math.floor(futureClasses.size / weeklySchedule.length);

    // If we have less than 4 weeks scheduled ahead, add more weeks
    const targetWeeksAhead = 6;
    if (weeksAhead < targetWeeksAhead) {
      const weeksToAdd = targetWeeksAhead - weeksAhead;
      for (let i = 0; i < weeksToAdd; i++) {
        await addNextWeek();
      }
    }

    return {
      success: true,
      message: `Schedule maintained. ${cleanupResult.deletedCount} old classes removed, ${targetWeeksAhead} weeks scheduled ahead.`,
      weeksAhead: targetWeeksAhead,
    };
  } catch (error) {
    console.error("❌ Error maintaining schedule:", error);
    return { success: false, error: error.message };
  }
};

// Function to get class schedule summary
export const getScheduleSummary = () => {
  const summary = {
    totalClasses: weeklySchedule.length,
    byDay: {},
    byLevel: {},
    byAgeGroup: {},
  };

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  weeklySchedule.forEach((cls) => {
    const day = days[cls.dayOfWeek];
    summary.byDay[day] = (summary.byDay[day] || 0) + 1;
    summary.byLevel[cls.difficulty] =
      (summary.byLevel[cls.difficulty] || 0) + 1;
    summary.byAgeGroup[cls.ageGroup] =
      (summary.byAgeGroup[cls.ageGroup] || 0) + 1;
  });

  return summary;
};

console.log("📋 Weekly Schedule Summary:", getScheduleSummary());
