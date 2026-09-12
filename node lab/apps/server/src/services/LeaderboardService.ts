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

  static async isBugArchitect(userId: string): Promise<boolean> {
    const rankings = await this.getRankings();
    const userRank = rankings.find(r => r.userId === userId);
    return userRank ? userRank.isBugArchitect : false;
  }
}
