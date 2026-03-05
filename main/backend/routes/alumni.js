const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getBatches, getBatchMembers, getAllAlumni, getBatchMessages, getPrivateMessages } = require('../controllers/alumniController');

router.use(protect);

router.get('/batches', getBatches);
router.get('/batches/:batchId/members', getBatchMembers);
router.get('/all', getAllAlumni);
router.get('/messages/batch/:batchId', getBatchMessages);
router.get('/messages/private/:receiverId', getPrivateMessages);

module.exports = router;
