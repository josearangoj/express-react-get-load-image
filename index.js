const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require("path");

const app = express(); //npm run dev

const fileStorage = multer.diskStorage({
   destination: function (req, file, callback) {
      callback(null, "./uploads")
   },
   filename: function (req, file, callback) {
      callback(null,`${Date.now()} -- ${file.originalname}`)
   },
});

const upload = multer({ storage: fileStorage });

app.use(express.static(__dirname + "/public"));

app.post("/single", upload.single("image"), function (req, res) {
   console.log(req.file);
   res.send("Single image upload successful");
});

app.post("/multiple", upload.array("images", 5), function (req, res) {
   console.log(req.files);
   res.send("Multiple image upload successful");
});

app.get("/error-sync", function () {
   const error = new ReferenceError("Broken");
   error.code = 500;
   throw error;
});

app.get("/error-async", function (req, res, next) {
   fs.readFile("/file-doesnt-exit", function (err, data) {
      if (err) {
         next(err);
      } else {
         res.send("Test to the process if file doesnt exit");
      }
   })
})

app.get("/single", (req, res, err) => {
   let upload_dir = path.join(__dirname, "uploads");
   let uploads = fs.readdirSync(upload_dir);
   //Add error handling
   if (uploads.length == 0) {
     return res.status(503).send({
       message: 'No Image'
     })
   };
   let max = uploads.length - 1;
   let min = 0;
   let index = Math.round(Math.random() * (max - min) + min)
   let randomImage = uploads[index];
   res.sendFile(path.join(upload_dir, randomImage));
 });
 
 const getRandomImage = (e) => {
   fetch("/single")
     .then((result) => {
       return result.blob();
     })
     .then((image) => {
       console.log(image);
       setSubmitText("Random file received");
       setImage(image);
     })
     .catch((err) => {
        console.log(err.message);
        setSubmitText(err.message);
     });
};

app.use(function (err, req, res, next) {
   console.log("Error handling Middleware called");
   console.log('Path:' + req.path);
   console.log('Error: ' + err);
   res.send(`Custom error page. Error: ${err.code}`);
})

app.listen(8000, function () {
   console.log("Server running...");
})