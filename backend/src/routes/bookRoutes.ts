import { Router } from 'express';
import { getAllBooks, createBook, updateBook, deleteBook } from '../controllers/bookController';
import { authenticate } from '../middleware/auth';
import { requireModule } from '../middleware/modulePermissions';

const router = Router();

// GET is allowed for all authenticated users (books are needed for other operations)
// But write operations require books module permission
router.get('/', authenticate, getAllBooks);
router.post('/', authenticate, requireModule('books'), createBook);
router.put('/:id', authenticate, requireModule('books'), updateBook);
router.delete('/:id', authenticate, requireModule('books'), deleteBook);

export default router;

