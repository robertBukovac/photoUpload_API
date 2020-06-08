const crypto = require('crypto')
const ErrorResponse = require("../utils/errorResponse");
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const bcrypt = require("bcryptjs");
const asyncHandler = require("../middleware/async");
const { create,getUserByUserEmail,getResetPasswordToken,updateUser,getUserByUserId } = require("./user");
const sendEmail = require('../utils/sendEmail')
const connection = require("../config/db");
const { sign } = require('jsonwebtoken');


// @desc  Register User
// @route POST /api/user/register
// @acces Public

exports.register = asyncHandler(async (req, res, next) => {
  const { email, password, name, lastname } = req.body;

  if (!email || !password || !name || !lastname) {
    return next(
      new ErrorResponse('Please provide valid informations', 400)
    );
}
  if (password.length < 8 ) {
    return next(
      new ErrorResponse('Please provide a password with 8 or more characters', 400)
    );
}
const salt = bcrypt.genSaltSync(10);
const npassword = hashSync(password, salt);

const result = await getUserByUserEmail(email,(err, results) => {
  if (err) {
    console.log(err);
    return;
  }
  if (!results) {
    const result = create({email,npassword, name, lastname });
    return res.status(200).json({
      success: true,
      data: "Succesfully registered",
    });
  }
  else {
    return next(
      new ErrorResponse(`${email} is already in use,please pick another`, 400)
    );
  }
})
});

// @desc Login User
// @route POST /api/v1/auth/login
// @acces Public

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
      return next(
        new ErrorResponse('Please provide an email and a password', 400)
      );
  }

//@TODO
// SALT key => .env
const query = `SELECT * FROM users 
                 WHERE email = ?`;

connection.query(query,[email],
    async function (error,results, fields) {
      if (typeof results !== "undefined" && results.length > 0) {
        const isLoggedin = true;
        const user = results[0];
        const { password : userpw } = user;
       
        const isMatch = await bcrypt.compareSync(password, userpw)

        if (!isMatch) {
          return next(new ErrorResponse('Invalid credentials', 401));
        }

        const token = await sign({ result: results }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRE
        });
        
        res.status(200).json({
          success: true,
          data: "Sucessfully login !",
          token:token
        });        
      } else {
        return next(new ErrorResponse("Incorrect Username and/or Password!", 401));
      }
      res.end();
    }
  );
  });


// @desc Forgot password
// @route POST /api/user/forgotpassword
// @acces Public

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(
      new ErrorResponse('Please provide an email', 400)
    );
}

  const result = await getUserByUserEmail(email,(err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    if (!results) {
      return next(
        new ErrorResponse('Please provide a valid email', 400)
      );
  } 
    else {
      const resetToken = crypto.randomBytes(20).toString('hex');
  
  //Hash token and set to resetPasswordToken field
  let resetPasswordToken = crypto
  .createHash('sha256')
  .update(resetToken)
  .digest('hex');
  //Set expire  (10 minutes)
  let resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  
  const rezultat =  getResetPasswordToken({resetPasswordToken,resetPasswordExpire,email})
  console.log(resetToken)

  // Create reset URL
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/user/resetpassword/${resetToken}`;

  const message = `You are receiveing an email because you or someone else has requested the reset of a apssword.Please make a PUT request to: ${resetUrl} `;

  try {
      sendEmail({
      email: email,
      subject: 'password reset token',
      message,
    });
    console.log('Email sent')
  } catch (err) {
    console.log(err);
    // da obrisemo token iz baze u slucaju pogreske
    resetPasswordToken = undefined;
    resetPasswordExpire = undefined;
    getResetPasswordToken({resetPasswordToken,resetPasswordExpire,email})

    return next(new ErrorResponse('Email could not been sent', 500));
  }
  res.status(200).json({
    success: true,
    data: "Succesfully sent token",
    resetToken:resetToken
  })
    }
  })
})

// @desc Reset password
// @route PUT /api/user/resetpassword/:resettoken
// @acces Public

exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  let resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

    const query = `SELECT * FROM users 
    WHERE resetPasswordToken = ?`;

    connection.query(query,[resetPasswordToken],
      async function (error,results, fields) {
        if (typeof results !== "undefined" && results.length > 0) {
          let user = results[0];

          //Set new password
          let password = req.body.password

          var salt = bcrypt.genSaltSync(10);
          let npassword = hashSync(password, salt);
      
          resetPasswordToken = undefined;
          let resetPasswordExpire = undefined;
          let email = user.email


          await updateUser({npassword,resetPasswordToken,resetPasswordExpire,email});
          
          res.status(200).json({
            success: true,
            data: "Sucessfully changed password !",
          });        
        } else {
          return next(new ErrorResponse('Something went wrong', 404));
        }
        res.end();
      })
    })

// @desc Get current logged in user
// @route GET /api/user/me
// @acces Private

exports.getMe = asyncHandler(async (req, res, next) => {

  const currentUser = req.user.id

  const result = await getUserByUserId(currentUser,(err, results) => {
    if (err) {
      console.log(err)
      return next(new ErrorResponse('Something went wrong', 500));
    }
    if (!results) {
      return next(new ErrorResponse('No User with that Id', 500));
    }
    res.status(200).json({ success: true, data: results });
  })
  res.end();
});
