import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Trophy, Star, Zap, ThumbsUp } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: number;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  showPopup?: boolean;
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  zap: Zap,
  thumbsUp: ThumbsUp,
};

export function AchievementBadge({ achievement, showPopup }: AchievementBadgeProps) {
  const Icon = iconMap[achievement.icon as keyof typeof iconMap] || Trophy;

  return (
    <div className="relative">
      <div
        className={`w-16 h-16 rounded-lg flex items-center justify-center transition-all ${
          achievement.unlocked
            ? "bg-gradient-to-br from-yellow-400 to-orange-400 shadow-lg"
            : "bg-gray-300 opacity-50"
        }`}
        data-testid={`achievement-${achievement.id}`}
      >
        <Icon className="w-8 h-8 text-white" />
      </div>

      {showPopup && achievement.unlocked && (
        <Card className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 whitespace-nowrap text-sm bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-xl z-50">
          <p className="font-bold">{achievement.name}</p>
          <p className="text-xs opacity-90">+{achievement.points} points</p>
        </Card>
      )}
    </div>
  );
}

export function AchievementsList({ achievements = [] }: { achievements?: Achievement[] }) {
  const safeAchievements = achievements || [];
  const unlockedCount = safeAchievements.filter(a => a.unlocked).length;
  const totalPoints = safeAchievements.reduce((sum, a) => (a.unlocked ? sum + a.points : sum), 0);

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-bold text-lg">Achievements</h3>
          <p className="text-sm text-muted-foreground">
            {unlockedCount} of {safeAchievements.length} unlocked
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-yellow-500">{totalPoints}</p>
          <p className="text-xs text-muted-foreground">points</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {safeAchievements.map((achievement) => (
          <div key={achievement.id} className="text-center space-y-2">
            <AchievementBadge achievement={achievement} />
            <p className="text-xs font-medium leading-tight">{achievement.name}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
