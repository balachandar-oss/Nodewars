import prisma from '../utils/prisma';

export class LeaderboardService {
  /**
   * Ranks players by the SUM of their scores across all completed
   * QuizAttempt rows. Today there is at most one completed attempt per
   * user (QuizAttempt.userId is uniquely constrained), so this sum equals
   * that single attempt's score - identical behavior to before. If
   * quiz.ts is later updated to create one QuizAttempt per mission
   * (tagged via the optional QuizAttempt.missionId column), this will
   * automatically start summing across all of a student's mission
   * mini-quizzes with no further changes needed here.
   */
  static async getRankings() {
    const attempts = await prisma.quizAttempt.findMany({
      where: { isCompleted: true },
      include: {
        user: {
          include: { team: true }
        }
      }
    });

    type Agg = {
      userId: string;
      username: string;
      teamId: string | null;
      teamName: string;
      totalScore: number;
      totalCorrectAnswers: number;
      percentageSum: number;
      attemptCount: number;
      latestCompletedAt: number;
    };

    const byUser = new Map<string, Agg>();

    for (const attempt of attempts) {
      const existing = byUser.get(attempt.userId);
      const completedAtMs = attempt.completedAt ? attempt.completedAt.getTime() : 0;

      if (existing) {
        existing.totalScore += attempt.score;
        existing.totalCorrectAnswers += attempt.correctAnswers;
        existing.percentageSum += attempt.percentage;
        existing.attemptCount += 1;
        if (completedAtMs > existing.latestCompletedAt) {
          existing.latestCompletedAt = completedAtMs;
        }
      } else {
        byUser.set(attempt.userId, {
          userId: attempt.userId,
          username: attempt.user.username,
          teamId: attempt.user.teamId,
          teamName: attempt.user.team?.name || 'NO TEAM',
          totalScore: attempt.score,
          totalCorrectAnswers: attempt.correctAnswers,
          percentageSum: attempt.percentage,
          attemptCount: 1,
          latestCompletedAt: completedAtMs
        });
      }
    }

    const aggregated = Array.from(byUser.values());

    aggregated.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.totalCorrectAnswers !== a.totalCorrectAnswers) {
        return b.totalCorrectAnswers - a.totalCorrectAnswers;
      }
      return a.latestCompletedAt - b.latestCompletedAt;
    });

    const teamCounts: Record<string, number> = {};

    return aggregated.map((entry, index) => {
      const tName = entry.teamName;
      if (!teamCounts[tName]) teamCounts[tName] = 0;
      teamCounts[tName]++;
      
      const teamRank = teamCounts[tName];
      const isBugArchitect = teamRank <= 5; // Top 5 per team

      return {
        rank: index + 1,
        teamRank,
        userId: entry.userId,
        username: entry.username,
        teamId: entry.teamId,
        teamName: entry.teamName,
        score: entry.totalScore,
        percentage: entry.attemptCount > 0 ? entry.percentageSum / entry.attemptCount : 0,
        isBugArchitect
      };
    });
  }

  static async getEligibility(userId: string) {
    const rankings = await this.getRankings();
    const userRank = rankings.find(r => r.userId === userId);
    
    if (!userRank) {
      return { isBugArchitect: false, team: 'NO TEAM', rank: 0, teamRank: 0, royal: 'NONE' };
    }
    
    let royal = 'NONE';
    if (userRank.teamName === 'PRINCES') royal = 'KING';
    else if (userRank.teamName === 'PRINCESSES') royal = 'QUEEN';
    
    return {
      isBugArchitect: userRank.isBugArchitect,
      team: userRank.teamName,
      rank: userRank.rank,
      teamRank: userRank.teamRank,
      royal
    };
  }

  static async isBugArchitect(userId: string): Promise<boolean> {
    const eligibility = await this.getEligibility(userId);
    return eligibility.isBugArchitect;
  }
}
