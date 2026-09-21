import prisma from '../utils/prisma';

export class LeaderboardService {
  static async getRankings() {
    const attempts = await prisma.quizAttempt.findMany({
      where: { isCompleted: true },
      include: {
        user: {
          include: { team: true }
        }
      },
      orderBy: [
        { score: 'desc' },
        { correctAnswers: 'desc' },
        { completedAt: 'asc' }
      ]
    });

    return attempts.map((attempt, index) => {
      const isBugArchitect = index < 5; // Top 5
      
      return {
        rank: index + 1,
        userId: attempt.userId,
        username: attempt.user.username,
        teamId: attempt.user.teamId,
        teamName: attempt.user.team?.name || 'NO TEAM',
        score: attempt.score,
        percentage: attempt.percentage,
        isBugArchitect
      };
    });
  }

  /**
   * Deterministic Architect Selection per team:
   * Selects up to `limit` eligible quiz scorers from a specific team.
   * Only completed attempts from non-admin users belonging to `teamId` are eligible.
   * 
   * Strict deterministic tie-break:
   * 1. score DESC
   * 2. correctAnswers DESC
   * 3. completedAt ASC
   * 4. user.rollNumber ASC (earlier roll number)
   * 5. user.id ASC (absolute deterministic fallback)
   */
  static async getEligibleQuizScorers(teamId: string, limit = 5): Promise<string[]> {
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        isCompleted: true,
        user: {
          teamId: teamId,
          role: { not: 'ADMIN' }
        }
      },
      include: {
        user: true
      }
    });

    const sorted = attempts.sort((a, b) => {
      // 1. score DESC
      if (b.score !== a.score) return b.score - a.score;
      // 2. correctAnswers DESC
      if (b.correctAnswers !== a.correctAnswers) return b.correctAnswers - a.correctAnswers;
      // 3. completedAt ASC
      const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      if (aTime !== bTime) return aTime - bTime;
      // 4. rollNumber ASC
      const aRoll = a.user.rollNumber ?? Number.MAX_SAFE_INTEGER;
      const bRoll = b.user.rollNumber ?? Number.MAX_SAFE_INTEGER;
      if (aRoll !== bRoll) return aRoll - bRoll;
      // 5. userId ASC
      return a.userId.localeCompare(b.userId);
    });

    return sorted.slice(0, limit).map(att => att.userId);
  }

  static async isBugArchitect(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && user.role === 'BUG_ARCHITECT') {
      return true;
    }
    const rankings = await this.getRankings();
    const userRank = rankings.find(r => r.userId === userId);
    return userRank ? userRank.isBugArchitect : false;
  }
}
