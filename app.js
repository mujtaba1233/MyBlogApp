var express = require("express");
var app = express();
var mysql= require("mysql");
var bodyParser= require("body-parser");
const multer = require('multer');
const path = require('path');
app.set("view engine", 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

// create connection
var db = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : ''    ,
  database : 'blogapp'
});

db.connect((err) =>{
  if(err){
    console.log(err);
  }
  console.log("MySql started");
});

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage
  // limits:{fileSize: 1000000},
  // fileFilter: function(req, file, cb){
  //   checkFileType(file, cb);
  // }
}).single('myImage');



// create DATABASE
app.get("/createdb", function(req, res){
  let sql ="CREATE DATABASE blogApp";
  db.query(sql, function(err,result){
    if(err){throw err;}
    console.log(result);
  });
});

// create table
app.get("/createtable", function(req, res){
  let sql="CREATE TABLE posts(id int AUTO_INCREMENT, title VARCHAR(255), image VARCHAR(255), body VARCHAR(255), date DATETIME ,PRIMARY KEY(id))";
  db.query(sql, function(err, result){
    if(err){
      console.log(err);
    }
  });
});


app.get("/",function(req, res){
  let sql=`SELECT * FROM posts`;
  db.query(sql, function(err, result){
    if(err){
      console.log(err);
    }
  res.render("index.ejs", {result:result});
});
});



// ADD POSTS
app.get("/blogs",function(req, res){
  let sql=`SELECT * FROM posts`;
  db.query(sql, function(err, result){
    if(err){
      console.log(err);
    }
  res.render("index.ejs", {result:result});
});
});




app.post("/blogs", function(req, res){
  upload(req, res, (err) => {
    if(err){
      res.render('form.ejs', {
        msg: err
      });
    } else
{
      if(req.file == undefined){
        res.render('form.ejs', {
          msg: 'Error: No File Selected!'
        });
      }
       else {
         var newpost={title:req.body.title,image:`uploads/${req.file.filename}`,body:req.body.body,date:new Date()};
         let sql="INSERT into posts SET ?";
         db.query(sql, newpost, function(err, result){
           if(err){
             console.log(err)
           }
           else{
             res.redirect('/');
           }
         });
      }
    }
  });
});


// FORM TO CREATE NEW POST
app.get("/blogs/new",function(req, res){
  res.render("form.ejs")
});



// show route
app.get("/blogs/:id", function(req, res){
  let sql=`SELECT * FROM posts WHERE id='${req.params.id}'`;
  db.query(sql, function(err, result){
    if(err){
      console.log(err);
    }
  res.render("show.ejs", {result:result});
});
});


//update posts
var a;
app.get("/blogs/:id/edit", function(req, res){
  let sql=`SELECT * FROM posts WHERE id='${req.params.id}'`;
  db.query(sql, function(err, result){
    if(err){
      console.log(err);
    }
    a=result;
  res.render("edit.ejs", {result:result});
});
});



app.post("/blogs/:id", function(req, res){
  upload(req, res, (err) => {
    if(err){
      res.render('edit.ejs', {
        msg: err,
        result:a
      });
    } else {
      if(req.file == undefined){
        res.render('edit.ejs', {
          msg: 'Error: No File Selected!',
          result:a
        });
      }
       else {
         var updatedpost={title:req.body.title,image:`uploads/${req.file.filename}`,body:req.body.body,date:new Date()};
         let sql =  `UPDATE posts SET ?  WHERE id = "${req.params.id}"`;
         db.query(sql, updatedpost, function(err, result){
           if(err){
             console.log(err)
           }
           else{
             res.redirect('/');
           }
         });
      }
    }
  });
});


// Delete posts from blog Page
app.get('/delete', (req, res)=>{
  console.log("this is delete route");
});

//Searching Records
var search;
app.get("/records", function(req, res){
  let sql=`SELECT * FROM posts WHERE Name='${search}'`;
  db.query(sql, function(err, result){
    if(err){
      console.log(err);
    }
  res.render("record.ejs", {result:result});
  });
});

app.post("/records",function(req, res){
  search=req.body.search;
  res.redirect("/records");
});

app.get("/records/new", function(req, res){
  res.render("search.ejs");
});

app.listen(3000, function(){
  console.log("server has started.....");
});
