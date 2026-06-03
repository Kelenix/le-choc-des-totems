export type MatchStatus = "UPCOMING" | "LIVE" | "FINISHED" | "CANCELLED";
export type MatchResult = "HOME" | "DRAW" | "AWAY";

export interface Totem {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  animal: string;
  imageUrl: string | null;
  description: string | null;
}

export interface Match {
  id: string;
  slug: string;
  homeTotem: Totem;
  awayTotem: Totem;
  scheduledAt: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  result: MatchResult | null;
  round: string | null;
  group: string | null;
}

export interface Vote {
  id: string;
  userId: string;
  matchId: string;
  prediction: MatchResult;
  isCorrect: boolean | null;
  pointsEarned: number;
  createdAt: string;
}

export interface VoteStats {
  home: number;
  draw: number;
  away: number;
  total: number;
  homePercent: number;
  drawPercent: number;
  awayPercent: number;
}

export interface User {
  id: string;
  pseudo: string;
  points: number;
  streak: number;
  suspended: boolean;
  createdAt: string;
}

export interface UserWithRank extends User {
  rank: number;
  totalVotes: number;
  correctVotes: number;
  winRate: number;
  badges: UserBadgeWithDetails[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
}

export interface UserBadgeWithDetails {
  id: string;
  earnedAt: string;
  badge: Badge;
}

export interface MatchWithVote extends Match {
  userVote?: Vote | null;
  voteStats?: VoteStats;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  badges: UserBadgeWithDetails[];
}

export interface AdBanner {
  id: string;
  name: string;
  imageUrl: string;
  linkUrl: string | null;
  placement: string;
  active: boolean;
}
