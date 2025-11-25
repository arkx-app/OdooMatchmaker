import { useState, useEffect } from "react";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: number;
  condition?: (stats: any) => boolean;
}

export interface GamificationStats {
  totalSwipes: number;
  totalLikes: number;
  totalMatches: number;
  currentStreak: number;
  totalPoints: number;
  achievements: Achievement[];
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_swipe",
    name: "First Step",
    description: "Complete your first swipe",
    icon: "star",
    points: 10,
    unlocked: false,
    condition: (stats) => stats.totalSwipes >= 1,
  },
  {
    id: "swipe_master",
    name: "Swipe Master",
    description: "Complete 10 swipes",
    icon: "zap",
    points: 50,
    unlocked: false,
    condition: (stats) => stats.totalSwipes >= 10,
  },
  {
    id: "heart_breaker",
    name: "Heart Breaker",
    description: "Like 5 profiles",
    icon: "heart",
    points: 30,
    unlocked: false,
    condition: (stats) => stats.totalLikes >= 5,
  },
  {
    id: "matchmaker",
    name: "Matchmaker",
    description: "Get your first match",
    icon: "trophy",
    points: 100,
    unlocked: false,
    condition: (stats) => stats.totalMatches >= 1,
  },
  {
    id: "on_fire",
    name: "On Fire",
    description: "Maintain a 5-match streak",
    icon: "zap",
    points: 75,
    unlocked: false,
    condition: (stats) => stats.currentStreak >= 5,
  },
];

export function useGamification(storageKey: string) {
  const [stats, setStats] = useState<GamificationStats>({
    totalSwipes: 0,
    totalLikes: 0,
    totalMatches: 0,
    currentStreak: 0,
    totalPoints: 0,
    achievements: DEFAULT_ACHIEVEMENTS,
  });

  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStats(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to load gamification stats");
      }
    }
  }, [storageKey]);

  // Check achievements whenever stats change
  useEffect(() => {
    const updatedAchievements = stats.achievements.map((achievement) => {
      const wasUnlocked = achievement.unlocked;
      const isNowUnlocked = achievement.condition?.(stats) ?? false;
      const justUnlocked = !wasUnlocked && isNowUnlocked;

      if (justUnlocked) {
        setNewAchievements((prev) => [...prev, achievement]);
        setTimeout(() => {
          setNewAchievements((prev) =>
            prev.filter((a) => a.id !== achievement.id)
          );
        }, 5000);
      }

      return {
        ...achievement,
        unlocked: isNowUnlocked,
        unlockedAt: isNowUnlocked ? achievement.unlockedAt || Date.now() : undefined,
      };
    });

    setStats((prev) => ({
      ...prev,
      achievements: updatedAchievements,
      totalPoints: updatedAchievements.reduce(
        (sum, a) => (a.unlocked ? sum + a.points : sum),
        0
      ),
    }));

    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(stats));
  }, [stats.totalSwipes, stats.totalLikes, stats.totalMatches, stats.currentStreak]);

  const recordSwipe = (liked: boolean) => {
    setStats((prev) => ({
      ...prev,
      totalSwipes: prev.totalSwipes + 1,
      totalLikes: liked ? prev.totalLikes + 1 : prev.totalLikes,
    }));
  };

  const recordMatch = () => {
    setStats((prev) => ({
      ...prev,
      totalMatches: prev.totalMatches + 1,
      currentStreak: prev.currentStreak + 1,
    }));
  };

  return {
    stats,
    recordSwipe,
    recordMatch,
    newAchievements,
  };
}
