import { Router } from 'express';
import {
  getAllPeople,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
} from '../controllers/personController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllPeople);
router.get('/:id', authenticate, getPersonById);
router.post('/', authenticate, createPerson);
router.put('/:id', authenticate, updatePerson);
router.delete('/:id', authenticate, deletePerson);

export default router;

