const express = require('express');
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require('uuid');
const matchCredentials = require('./utils');
const { User } = require('./model');
const app = express();

app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')
app.use(cookieParser())
app.use(express.urlencoded({extended: false}))

//show home with forms
app.get('/', function(req, res) {
  res.render('pages/home')
})

// create a user account
app.post('/create', function(req, res) {
  (async() => {
    let body = req.body
    const user = await User.create({
      username: body.username,
      password: body.password
    });
    res.redirect('/')
  })()
})

//login
app.post('/login', function (req, res) {
  let id = uuidv4()

  let username = req.body.username
  User.findOne({
    where: {
      username: username
    }
  })
  .then(user => {
    if(user){
      if(user.password === req.body.password){
        res.cookie('SID', id, {
          expires: new Date(Date.now() + 90000),
          httpOnly: true
        })
        res.render('pages/members')
      } 
    } else {
      res.redirect('pages/error') 
    }
  })
  .catch(err=>{
    res.status(400).json({error:err})
    res.redirect('pages/error')
  })
})

//protected route
app.get('/supercoolmembersonlypage', function (req, res) {
  let id = req.cookies.SID
  if(id) {
    res.render('pages/members')
  } else {
    res.render('pages/error')
  }
})

app.get('/error', function (req, res) {
  res.render('pages/error')
})

app.get('/logout', function (req, res) {
  res.cookie('SID', '', {
    expires: new Date(Date.now()),
    httpOnly: true
  })
  res.redirect('/')
})

//404 handling
app.all('*', function(req, res) {
  res.render('pages/error')
})

app.listen(1612, () => {
  console.log('Server is running on localhost:1612')
})