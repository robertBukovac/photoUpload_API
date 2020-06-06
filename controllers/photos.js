// sa pathom vidimo ekstenzije 
const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { sendPhoto, deletePhoto, updatePhoto ,getPhotos} = require("./user");
const connection = require("../config/db");


// @desc Upload photo for  bootcamp
// @route PUT /api/photos
// @acces Private

exports.PhotoUpload = asyncHandler(async (req, res, next) => {  

    if (!req.files) {
      return next(new ErrorResponse(`Please upload a file`, 400));
    }
    const file = req.files.file;

    //Make sure that the image is a photo
    if (!file.mimetype.startsWith('image')) {
      return next(new ErrorResponse(`Please upload an image file`, 400));
    }

    //Check file size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
      return next(
        new ErrorResponse(
          `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
          400
        )
      );
    }
    
    //Create custom filename
    //file.name = `photo_1${path.parse(file.name).ext}`;
    console.log(file.name)
    
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
      if (err) {
        console.error(err);
        return next(new ErrorResponse(`Problem with file upload`, 500));
      }
      
      const users_id = req.user.id
      const name = file.name;
      const nsize = file.size;
      

      const result = await sendPhoto({users_id ,name, nsize });
      
  
      res.status(200).json({ succes: true, data: file.name });
    });
  });

// @desc update  photo
// @route PUT /api/photos/:id
// @acces Private
exports.updatePhoto = asyncHandler(async (req, res, next) => {
  const currentUser = req.user.id;

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }
  const file = req.files.file;
  connection.query(`SELECT users_id FROM pictures where image_id = ${req.params.id} AND users_id = ${currentUser}`, async function (err, result, fields) {
    console.log(result)
    if (typeof result !== "undefined" && result.length > 0) {

      const nid = req.params.id
      const name = file.name;
      const size = file.size
      
      // Upload slike u public/uploads
      file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
        if (err) {
          console.error(err);
          return next(new ErrorResponse(`Problem with file upload`, 500));
        }
      })

      const result = await updatePhoto({name,size,nid})


      res.status(200).json({
        success: true,
        data: "Sucessfully updated photo !",
      });
  }
  else {
    res.status(404).json({
      success: false,
      data: "Not allowed to update this photo"
    });
    res.end();
    }
  });
}
)



// @desc delete  bootcamp
// @route DELETE /api/photos/:id
// @acces Private
exports.deletePhoto = asyncHandler(async (req, res, next) => {
  const currentUser = req.user.id
  connection.query(`SELECT users_id FROM pictures where image_id = ${req.params.id} AND users_id = ${currentUser}`, async function (err, result, fields) {
    console.log(result)
    if (typeof result !== "undefined" && result.length > 0) {
      const id = req.params.id
      const result = await deletePhoto({id})
      res.status(200).json({
        success: true,
        data: "Sucessfully deleted photo !",
      });
  }
  else {
    res.status(404).json({
      success: false,
      data: "Not allowed to delete this photo"
    });
    res.end();
    }
  });
}
)

// @desc Get one Photo 
// @route GET /api/photos/:id
// @acces Private
exports.getPhoto = asyncHandler(async (req, res, next) => {
  const currentUser = req.user.id

  connection.query(`SELECT name,size,users_id FROM pictures where image_id = ${req.params.id} AND users_id = ${currentUser}`, async function (err, result, fields) {
    if (typeof result !== "undefined" && result.length > 0) {
      //const photoData = ` The picture is ${results[0].name} with size of ${results[0].size}`
      const photoData = `Picture ${result[0].name} with size of ${result[0].size} Kb`
      res.status(200).json({
        success: true,
        data: "Sucessfully get photo !",
        photoData:photoData
      });
  }
  else {
    res.status(404).json({
      success: false,
      data: "Not allowed to get this photo"
    });
    res.end();
    }
  });
  
}
)


// @desc Get all Photos 
// @route GET /api/photos 
// @acces Private
exports.getPhotos = asyncHandler(async (req, res, next) => {
  
  const limit = parseInt(req.query.limit, 10) || 10;
  // page number
  const page = parseInt(req.query.page, 10) || 1;
  // calculate offset
 const offset = (page - 1) * limit

  // sort => promjeni u created at   => 
  // ASCENDING IS BY DEFAULT IF YOU WANT DESCENDING JUST ADD - TO YOUR QUERY VALUE
  const sort = req.query.sort || 'image_id'

  // select (multiple selects works)
  const select = req.query.select || '*'

// query for fetching data with page number and offset
  const prodsQuery = `select ${select} from pictures ORDER BY ${sort} limit ${limit} OFFSET ${offset}`
    connection.query(prodsQuery, function (error, results, fields) {
      if (error) return error;
      res.status(200).json({
        products_page_count : results.length,
        page_number : page,
        data : results
    })
    res.end();
  })
})


