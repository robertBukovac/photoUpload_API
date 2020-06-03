const jwt = require("jsonwebtoken");
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');

exports.protect = asyncHandler(async (req, res, next) => {
    let token;
  
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // jer u postmanu u headersu u authorization dijelu isemo Bearer pa token pa to odvajamo da dobijemo token
      token = req.headers.authorization.split(' ')[1];
    } // else if (req.cookies.token) {
    // token = req.cookies.token;
    //}

    //Make sure token exists
    if (!token) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }
  
    //if exits we need to verify
    try {
      //Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      //req.user = await User.findById(decoded.id);
      req.user = decoded.result[0]
      next();
    } catch (err) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }
  });
  
  