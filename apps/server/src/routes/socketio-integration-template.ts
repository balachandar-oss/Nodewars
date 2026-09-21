/**
 * Socket.IO Integration Template for Route Handlers
 *
 * This file shows the recommended pattern for integrating Socket.IO events
 * into your Express route handlers.
 *
 * Copy this pattern into your route files to emit real-time events
 * whenever game state changes.
 */

import express from 'express';
import { authenticate } from '../middleware/auth';
import { getIO } from '../utils/ioInstance';
import {
  emitPlayerMoved,
  emitBugDiscovered,
  emitBountySolved,
  emitFragmentCollected,
  emitRoomUnlocked
} from '../socket/gameEvents';
import {
  broadcastTeamUpdate,
  notifyUser,
  announceTeam
} from '../utils/gameSocket';
import prisma from '../utils/prisma';

const router = express.Router();

/**
 * TEMPLATE 1: Simple event emission after database update
 *
 * When a player performs an action that should notify other players,
 * emit an event AFTER the database transaction succeeds.
 */
router.post('/template/discover-bug', authenticate, async (req: any, res) => {
  try {
    // 1. Validate and get user/team
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, teamId: true, username: true }
    });

    if (!user || !user.teamId) {
      return res.status(400).json({ error: 'User not in team' });
    }

    // 2. Process the action and update database atomically
    const bug = await prisma.bug.updateMany({
      where: {
        id: req.body.bugId,
        status: 'PLANTED'
      },
      data: {
        status: 'DISCOVERED',
        discoveredAt: new Date()
      }
    });

    if (bug.count === 0) {
      return res.status(404).json({ error: 'Bug not found or already discovered' });
    }

    // 3. AFTER successful DB update, emit event to connected clients
    const io = getIO();
    await emitBugDiscovered(io, {
      bugId: req.body.bugId,
      discoveredBy: {
        userId: user.id,
        teamId: user.teamId,
        username: user.username
      },
      vulnerabilityType: 'SQL_INJECTION',
      targetSystem: 'DATABASE'
    });

    // 4. Optionally broadcast team stats update
    await broadcastTeamUpdate(io, user.teamId);

    // 5. Send success response to client
    res.json({ success: true, message: 'Bug discovered!' });
  } catch (error) {
    console.error(`[ERROR] Failed to discover bug: ${error}`);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * TEMPLATE 2: Notify specific user and announce to team
 *
 * Use this pattern when you want to notify both individual users
 * and send team announcements.
 */
router.post('/template/claim-bounty', authenticate, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, teamId: true, username: true }
    });

    if (!user || !user.teamId) {
      return res.status(400).json({ error: 'User not in team' });
    }

    // Process bounty claim
    const updatedBug = await prisma.bug.updateMany({
      where: {
        id: req.body.bugId,
        status: 'DISCOVERED'
      },
      data: {
        status: 'CLAIMED',
        claimedByUserId: user.id,
        claimedByTeamId: user.teamId,
        claimedAt: new Date()
      }
    });

    if (updatedBug.count === 0) {
      return res.status(400).json({ error: 'Bug not found or not in DISCOVERED state' });
    }

    const io = getIO();

    // Emit bounty solved event (broadcasts to team)
    await emitBountySolved(io, {
      bugId: req.body.bugId,
      answeredBy: {
        userId: user.id,
        teamId: user.teamId,
        username: user.username
      },
      points: 50,
      fragment: {
        fragmentValue: 'fragment_data',
        description: 'A security fragment'
      }
    });

    // Notify the player specifically
    notifyUser(
      io,
      user.id,
      'Bounty Claimed!',
      'You successfully claimed a bug bounty worth 50 points'
    );

    // Announce to team
    announceTeam(
      io,
      user.teamId,
      'Team Achievement',
      `${user.username} claimed a bug bounty! +50 points`,
      'success'
    );

    res.json({ success: true, message: 'Bounty claimed!', points: 50 });
  } catch (error) {
    console.error(`[ERROR] Failed to claim bounty: ${error}`);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * TEMPLATE 3: Multiple sequential events
 *
 * When one action triggers multiple related events,
 * emit them in sequence after the database transaction.
 */
router.post('/template/complete-bounty', authenticate, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, teamId: true, username: true }
    });

    if (!user || !user.teamId) {
      return res.status(400).json({ error: 'User not in team' });
    }

    // Update bug status to RESOLVED
    const resolved = await prisma.bug.updateMany({
      where: {
        id: req.body.bugId,
        claimedByUserId: user.id,
        status: 'CLAIMED'
      },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date()
      }
    });

    if (resolved.count === 0) {
      return res.status(400).json({ error: 'Cannot resolve this bug' });
    }

    const io = getIO();

    // Emit multiple events for this completion
    await emitBountySolved(io, {
      bugId: req.body.bugId,
      answeredBy: {
        userId: user.id,
        teamId: user.teamId,
        username: user.username
      },
      points: 100,
      fragment: {
        fragmentValue: 'security_key_fragment',
        description: 'A fragment of the security key'
      }
    });

    // Check if team has collected enough fragments to unlock a room
    const fragmentCount = await prisma.bug.count({
      where: {
        claimedByTeamId: user.teamId,
        status: 'RESOLVED'
      }
    });

    // If threshold reached, emit room unlock event
    if (fragmentCount % 5 === 0) {
      await emitRoomUnlocked(io, {
        teamId: user.teamId,
        roomName: `Castle Room ${fragmentCount / 5}`,
        systemId: `ROOM_${fragmentCount / 5}`,
        description: 'A new room has been unlocked!'
      });

      announceTeam(
        io,
        user.teamId,
        'Castle Progress!',
        `New room unlocked! ${fragmentCount} fragments collected.`,
        'success'
      );
    }

    await broadcastTeamUpdate(io, user.teamId);

    res.json({
      success: true,
      message: 'Bounty completed!',
      points: 100,
      fragmentCount
    });
  } catch (error) {
    console.error(`[ERROR] Failed to complete bounty: ${error}`);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * TEMPLATE 4: Conditional event emissions
 *
 * Emit different events based on game state or conditions
 */
router.post('/template/move-player', authenticate, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, teamId: true }
    });

    if (!user || !user.teamId) {
      return res.status(400).json({ error: 'User not in team' });
    }

    const { position } = req.body;

    // Validate position
    if (typeof position?.x !== 'number' || typeof position?.y !== 'number') {
      return res.status(400).json({ error: 'Invalid position' });
    }

    const io = getIO();

    // Emit movement event
    await emitPlayerMoved(io, {
      userId: user.id,
      position,
      teamId: user.teamId
    });

    // Check if player entered a trigger zone (example logic)
    if (position.x > 500 && position.y > 500) {
      announceTeam(
        io,
        user.teamId,
        'Alert!',
        'Player entered the secret chamber!',
        'info'
      );
    }

    res.json({ success: true, message: 'Movement registered' });
  } catch (error) {
    console.error(`[ERROR] Failed to move player: ${error}`);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * KEY PATTERNS TO REMEMBER:
 *
 * 1. ALWAYS update database FIRST
 *    - Use atomic operations (updateMany with specific WHERE conditions)
 *    - Ensure database transaction succeeds before emitting
 *
 * 2. THEN emit Socket.IO events
 *    - Events should reflect the NEW state after DB update
 *    - Use getIO() to get the Socket.IO instance
 *
 * 3. SERVER IS AUTHORITATIVE
 *    - Validate everything on the server
 *    - Don't trust client input
 *    - Update database with facts, emit events as proof
 *
 * 4. USE PROPER ERROR HANDLING
 *    - Catch errors and return appropriate HTTP status codes
 *    - Log errors for debugging
 *    - Only emit events on success
 *
 * 5. BROADCAST SCOPE
 *    - Team events: use team:${teamId} room
 *    - User events: use user:${userId} room
 *    - Global events: emit to all players
 *    - GameEventBus handles routing automatically
 */

export default router;
