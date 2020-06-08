const express = require('express');
const {
    PhotoUpload,
    deletePhoto,
    updatePhoto,
    getPhoto,
    getPhotos
} = require('../controllers/photos');

const router = express.Router();

const { protect } = require('../middleware/auth');

router
  .route('/')
  .post(protect,PhotoUpload)
  .get(getPhotos)

router
  .route('/:id')
  .delete(protect,deletePhoto)
  .put(protect,updatePhoto)
  .get(protect,getPhoto)

module.exports = router;
