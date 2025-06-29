import express from 'express';
import { createSubmission, getUserSubmissionsForProblem, getSubmissionById } from '../controllers/submissionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, createSubmission)
    .get(protect, getUserSubmissionsForProblem);

router.route('/:id')
    .get(protect, getSubmissionById);

export default router;