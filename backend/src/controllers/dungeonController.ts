import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const convertToDungeon = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { projectId, floor1Title, floor2Title, floor3Title } = req.body;

    if (!projectId || !floor1Title || !floor2Title || !floor3Title) {
      return res.status(400).json({ error: 'Project ID and all 3 floor titles are required' });
    }

    const project = await prisma.personalProject.findFirst({
      where: { id: projectId, userId }
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    const updated = await prisma.personalProject.update({
      where: { id: projectId },
      data: {
        isDungeon: true,
        currentFloor: 1,
        floor1Title,
        floor1Completed: false,
        floor2Title,
        floor2Completed: false,
        floor3Title,
        floor3Completed: false,
        dungeonCompleted: false,
        rewardClaimed: false,
        progress: 0
      }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyFloor = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { projectId, floorNum, verificationText } = req.body;

    if (!projectId || !floorNum || !verificationText) {
      return res.status(400).json({ error: 'Project ID, floor number, and verification text are required' });
    }

    const project = await prisma.personalProject.findFirst({
      where: { id: projectId, userId }
    });

    if (!project) return res.status(404).json({ error: 'Dungeon instance not found' });
    if (!project.isDungeon) return res.status(400).json({ error: 'This project is not a Grand Dungeon' });
    if (project.dungeonCompleted) return res.status(400).json({ error: 'Dungeon already cleared' });
    if (project.currentFloor !== Number(floorNum)) {
      return res.status(400).json({ error: `Floor gating mismatch. Current Floor is Floor ${project.currentFloor}` });
    }

    // Gated floor checks: Verification note must be at least 50 characters
    if (verificationText.trim().length < 50) {
      return res.status(400).json({ error: 'Milestone proof insufficient. Please write a note of at least 50 characters summarizing your work.' });
    }

    const updateData: any = {};
    let dungeonCompleted = false;
    let statsAwarded = 0;
    let unlockedTitle = '';

    if (floorNum === 1) {
      updateData.floor1Completed = true;
      updateData.currentFloor = 2;
      updateData.progress = 33.3;
    } else if (floorNum === 2) {
      updateData.floor2Completed = true;
      updateData.currentFloor = 3;
      updateData.progress = 66.6;
    } else if (floorNum === 3) {
      updateData.floor3Completed = true;
      updateData.dungeonCompleted = true;
      updateData.progress = 100;
      dungeonCompleted = true;
      
      // Clear Boss Room rewards: +5 stat points, and customized permanent title
      statsAwarded = 5;
      unlockedTitle = project.title.toLowerCase().includes('code') 
        ? 'Sovereign Coder' 
        : project.title.toLowerCase().includes('write') || project.title.toLowerCase().includes('novel')
        ? 'Sovereign Scribe'
        : 'Apex Creator';
    }

    const updatedProject = await prisma.personalProject.update({
      where: { id: projectId },
      data: updateData
    });

    if (dungeonCompleted && statsAwarded > 0) {
      await prisma.profile.update({
        where: { userId },
        data: {
          unallocatedPoints: { increment: statsAwarded },
          equippedTitle: unlockedTitle
        }
      });
    }

    res.json({
      project: updatedProject,
      dungeonCompleted,
      statsAwarded,
      unlockedTitle
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
