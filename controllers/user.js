const connection = require("../config/db");
const crypto = require('crypto')

module.exports = {
    create: async (data) => {
        connection.query(
        `insert into users(name, lastname, email, password) 
                  values(?,?,?,?)`,
        [
          data.name,
          data.lastname,
          data.email,
          data.npassword
        ],
        (error, results, fields) => {
          if (error) {
            return error;
          }
          return  results;
        }
      );
    },
    getUserByUserEmail: async(email,callBack) => {
      connection.query(
        `select * from users where email = ?`,
        [email],
        (error, results, fields) => {
          if (error) {
            callBack(error);
          }
          return callBack(null,results[0]);
        }
      );
    },
    updateUser: async(data) => {
      connection.query(
        `update users set password=?, resetPasswordToken=?, resetPasswordExpire=? where email = ?`,
        [
          data.npassword,
          data.nresetPasswordToken,
          data.resetPasswordExpire,
          data.email
        ],
        (error, results, fields) => {
          if (error) {
            return error;
          }
          return results[0];
        }
      );
    },
    sendPhoto:async (data) => {
      connection.query(
        `insert into pictures(users_id,name,size) 
                  values(?,?,?)`,
        [
          data.users_id,
          data.name,
          data.nsize,
        ],
        (error, results, fields) => {
          if (error) {
            return error;
          }
          return results;
        }
      );
    },
    updatePhoto: async (data) => {
      connection.query(
        `update pictures set name=?, size=? where image_id = ?`,
        [
          data.name,
          data.size,
          data.nid
        ],
        (error, results, fields) => {
          if (error) {
            return error;
          }
          return results;
        }
      );
    },
    deletePhoto: async(data) => {
      connection.query(
        `delete from pictures where image_id = ?`,
        [data.id],
        (error, results, fields) => {
          if (error) {
            return error;
          }
          return results[0];
        }
      );
    },
  //Generate and hash password token => zato sto je pozvana na usera a ne na model bit ce metoda
  getResetPasswordToken: async (data) => {  
    connection.query(
      `update users set resetPasswordToken=?,resetPasswordExpire=? where email = ?`,
      [
        data.resetPasswordToken,
        data.resetPasswordExpire,
        data.email
      ],
      (error, results, fields) => {
        if (error) {
          return error;
        }
        return results[0];
      }
      
    );  },
  
  }


