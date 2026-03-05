const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const { createBatch, getBatches, updateBatch, deleteBatch, createAlumni, getAlumni, assignBatch } = require('../controllers/adminController');

router.use(protect, admin);

router.post('/batches', createBatch);
router.get('/batches', getBatches);
router.put('/batches/:id', updateBatch);
router.delete('/batches/:id', deleteBatch);

router.post('/alumni', createAlumni);
router.get('/alumni', getAlumni);
router.post('/assign-batch', assignBatch);

module.exports = router;
