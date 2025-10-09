const express = require('express');
const router = express.Router();
const { upload, uploadDocument } = require('../controllers/documentController');
const VectorStore = require('../utils/vectorStore');
const {protect} = require('../middleware/auth');

// Upload document
router.post(
  '/upload',
  protect,
  upload.single('document'),   // change 'document' -> 'file' if your frontend sends the field as 'file'
  uploadDocument
);


// Get user's documents
router.get('/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const documents = await VectorStore.getUserDocuments(userId);
    res.json({ success: true, documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch documents' });
  }
});

// Delete document
router.delete('/:userId/:docId', protect, async (req, res) => {
  try {
    const { userId, docId } = req.params;
    const deleted = await VectorStore.deleteDocument(userId, docId);
    if (deleted) {
      res.json({ success: true, message: 'Document deleted successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Document not found' });
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ success: false, error: 'Failed to delete document' });
  }
});

module.exports = router;
