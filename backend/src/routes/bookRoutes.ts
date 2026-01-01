import { Router } from 'express';
import { getAllBooks, createBook, updateBook, deleteBook } from '../controllers/bookController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllBooks);
router.post('/', authenticate, createBook);
router.put('/:id', authenticate, updateBook);
router.delete('/:id', authenticate, deleteBook);

export default router;

