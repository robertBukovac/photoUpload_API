# photoUpload_API
RESTful API for Spark School project

## Features

- **Registration**
- **Login**
- **Reset password**
- **CRUD manipulation for photos**
- **Get multiple photos with pagination and filtering**

# Routes with features explained
***Public routes***
- **Registration** - Validates user information then adds it to the DB
- **Login** - Validates user's information then returns a token
- **Forgot password** - Sends the recovery email to the user with forgotten password
  - **Reset password** - Checks the token to see which user forgot password then changes it. (Mailtrap used for testing)
  > /api/user/*resetToken*
- **Get all photos** - Gets multiple photos with pagination,filtering and sorting. (On purpose public route for easier handling)
- **Get picture** - See the photo you put in DB. 
  > /public/uploads/*nameOfThePhoto*

***Private routes***
- **Add photo** - Validate photo (all image type enabled),then adds details to DB. (id of the photos is on purpose put from 1 for easy manipulation)
- **Change photo** - Validates the user ownership then changes the photo.
- **Delete photo** - Validates the user ownership then deletes the photo.
- **Get one photo** - Validates user ownership then gets the photo data.

# Running the software
- Clone the repo by using ```git clone```.
- Run ```npm install``` on the cloned directory.
- ``` node app.js``` or ```nodemon``` for simple setup.
