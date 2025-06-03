export const GRADING_BANDS = [
  {
    id: 1,
    name: "White (Beginner)",
    color: "#FFFFFF",
    colorName: "White",
    level: "Beginner",
    description: "Foundation techniques and basic conditioning",
    requirements: [
      "Basic stance and guard position",
      "Straight punches (jab, cross)",
      "Basic kicks (front kick, roundhouse)",
      "Basic defense and footwork",
      "Understanding of gym etiquette",
    ],
    minimumClasses: 20,
    minimumTimeMonths: 3,
    isStarting: true,
  },
  {
    id: 2,
    name: "Yellow",
    color: "#FFD700",
    colorName: "Yellow",
    level: "Beginner+",
    description: "Building combinations and improving technique",
    requirements: [
      "Hook and uppercut punches",
      "Low kick and body kick",
      "Basic 2-3 punch combinations",
      "Improved pad work rhythm",
      "Basic clinch position",
    ],
    minimumClasses: 40,
    minimumTimeMonths: 6,
  },
  {
    id: 3,
    name: "Green",
    color: "#22C55E",
    colorName: "Green",
    level: "Beginner+",
    description: "Expanding technique arsenal and combinations",
    requirements: [
      "Knee strikes (straight and diagonal)",
      "Elbow strikes (horizontal and diagonal)",
      "4-5 punch combinations",
      "Basic counter attacks",
      "Improved balance and timing",
    ],
    minimumClasses: 60,
    minimumTimeMonths: 9,
  },
  {
    id: 4,
    name: "Blue",
    color: "#3B82F6",
    colorName: "Blue",
    level: "Intermediate",
    description: "Advanced combinations and defensive skills",
    requirements: [
      "Advanced elbow techniques",
      "Knee-elbow combinations",
      "Defensive techniques (blocks, parries)",
      "Basic sparring readiness",
      "Understanding of ring craft",
    ],
    minimumClasses: 80,
    minimumTimeMonths: 12,
  },
  {
    id: 5,
    name: "Blue 2",
    color: "#1D4ED8",
    colorName: "Blue",
    level: "Intermediate",
    description: "Perfecting intermediate techniques",
    requirements: [
      "Advanced kick combinations",
      "Counter-attack sequences",
      "Improved clinch work",
      "Light sparring participation",
      "Teaching assistance capability",
    ],
    minimumClasses: 100,
    minimumTimeMonths: 15,
  },
  {
    id: 6,
    name: "Brown",
    color: "#A16207",
    colorName: "Brown",
    level: "Intermediate+",
    description: "Advanced techniques and sparring skills",
    requirements: [
      "Advanced clinch techniques",
      "Sweep and dump techniques",
      "Complex combination sequences",
      "Regular sparring participation",
      "Advanced pad work partnerships",
    ],
    minimumClasses: 120,
    minimumTimeMonths: 18,
  },
  {
    id: 7,
    name: "Brown 2",
    color: "#92400E",
    colorName: "Brown",
    level: "Intermediate+",
    description: "Mastering advanced concepts",
    requirements: [
      "Fight preparation techniques",
      "Advanced defensive strategies",
      "Multiple opponent awareness",
      "Mentoring newer students",
      "Competition readiness",
    ],
    minimumClasses: 140,
    minimumTimeMonths: 21,
  },
  {
    id: 8,
    name: "Brown 3",
    color: "#78350F",
    colorName: "Brown",
    level: "Advanced",
    description: "Pre-expert level mastery",
    requirements: [
      "Expert-level technique execution",
      "Advanced ring psychology",
      "Teaching lower grades",
      "Competition experience preferred",
      "Leadership in training",
    ],
    minimumClasses: 160,
    minimumTimeMonths: 24,
  },
  {
    id: 9,
    name: "Brown 3 (Advanced)",
    color: "#451A03",
    colorName: "Brown",
    level: "Advanced",
    description: "Approaching mastery",
    requirements: [
      "Mastery of all fundamental techniques",
      "Advanced fight strategy",
      "Instructor assistance",
      "Competition success",
      "Mental discipline mastery",
    ],
    minimumClasses: 180,
    minimumTimeMonths: 27,
  },
  {
    id: 10,
    name: "Red",
    color: "#DC2626",
    colorName: "Red",
    level: "Expert",
    description: "Master level practitioner",
    requirements: [
      "Complete mastery of Muay Thai",
      "Ability to teach all levels",
      "Fight experience or equivalent",
      "Leadership and mentorship",
      "Dedication to the art",
    ],
    minimumClasses: 200,
    minimumTimeMonths: 30,
    isMaxLevel: true,
  },
];

export const getGradingBand = (bandId) => {
  return GRADING_BANDS.find((band) => band.id === bandId) || GRADING_BANDS[0];
};

export const getNextGradingBand = (currentBandId) => {
  const currentIndex = GRADING_BANDS.findIndex(
    (band) => band.id === currentBandId,
  );
  if (currentIndex === -1 || currentIndex === GRADING_BANDS.length - 1) {
    return null; // Already at max level
  }
  return GRADING_BANDS[currentIndex + 1];
};

export const canUserGrade = (userStats, currentBandId) => {
  const nextBand = getNextGradingBand(currentBandId);
  if (!nextBand) return false;

  const classesRequirement =
    userStats.classesAttended >= nextBand.minimumClasses;
  const timeRequirement =
    userStats.monthsTraining >= nextBand.minimumTimeMonths;

  return classesRequirement && timeRequirement;
};

export const getGradingProgress = (userStats, currentBandId) => {
  const nextBand = getNextGradingBand(currentBandId);
  if (!nextBand) return { isMaxLevel: true };

  const classesProgress = Math.min(
    (userStats.classesAttended / nextBand.minimumClasses) * 100,
    100,
  );

  const timeProgress = Math.min(
    (userStats.monthsTraining / nextBand.minimumTimeMonths) * 100,
    100,
  );

  return {
    classesProgress,
    timeProgress,
    overallProgress: Math.min(classesProgress, timeProgress),
    canGrade: classesProgress >= 100 && timeProgress >= 100,
    classesNeeded: Math.max(
      0,
      nextBand.minimumClasses - userStats.classesAttended,
    ),
    monthsNeeded: Math.max(
      0,
      nextBand.minimumTimeMonths - userStats.monthsTraining,
    ),
  };
};
