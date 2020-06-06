const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;
  //console.log(err.stack);
  console.log(err);

  // bad ObjectId  =>  (id razlicit broj karaktera)
  if (err.name === 'CastError') {
    const message = `Resource not fount with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // duplicate key = kod je 11000
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  //  validation error
  if (err.name === 'ValidationError') {
    // da iz error objekta niza iz console sto smo dobili da dobijemo sve poruke ili navedene poruke
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    succes: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;
