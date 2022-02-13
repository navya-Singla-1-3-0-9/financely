if(process.env.NODE_ENV!=="production"){
	require('dotenv').config();
}

const express= require('express');
const session = require('express-session')
const app= express();
const flash = require('connect-flash');
const passport= require('passport');
const localStrategy= require('passport-local'); 
app.set("view engine","ejs");
const path = require('path');
app.use(express.static("public"));
const mongoose = require('mongoose');
const db_url= process.env.DB_URL;
mongoose.connect(db_url, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("CONNECTED!");
});

const {spawn} = require('child_process');
const sessionConfig={
	secret: 'Thisisasecret',
	resave: false,
	saveUninitialized: true,
	cookie:{
		httpOnly: true,
		expires: Date.now()+1000*60*60*24*7,
		maxAge: 1000*60*60*24*7
	}
}
var fs = require('fs'),
    binary = fs.readFileSync('./model.weights.bin');
process.stdout.write(binary.slice(0, 48));

let posts=[]
const bodyParser = require("body-parser");
const User = require('./models/user.js');
const Journal = require('./models/journal.js');
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
//handling login
passport.serializeUser(User.serializeUser());
//handling logout
passport.deserializeUser(User.deserializeUser());
app.use((req,res,next)=>{
	console.log(req.session);
	res.locals.currUser= req.user;
	res.locals.success=  req.flash('success');
	res.locals.error= req.flash('error');
	next();
})


app.use(express.urlencoded({extended:true}));
app.set('views',path.join(__dirname,'views'));

app.get('/',(req,res)=>{
	res.render("home");
})


app.get('/login',(req,res)=>{
	res.render("login");
})
app.get('/signup',(req,res)=>{
    res.render("register")
});
app.post('/login',passport.authenticate('local',{failureFlash:'Invalid username or password', failureRedirect:'/login'}),async (req,res)=>{
    
    if(req.session.returnTo){
		res.redirect(req.session.returnTo);
		delete req.session.returnTo;
	}else{
	req.flash('success', 'Successfully logged in');
	res.redirect('/dashboard');
    }
});

app.post('/register',async (req,res)=>{
    const {email, username, password}= req.body;
	const nu = new User({email, username});
	const regdUser= await User.register(nu, password);
	req.flash('success','Successfully registered')
	res.redirect('/dashboard')

});

app.get('/yoga-practice', (req,res)=>{
	res.render('index');
});
app.get('/practiceYoga/:pose', (req,res)=>{
	res.render('practiceYoga',{pose:req.params.pose});

});

app.get('/report/:pose', (req,res)=>{
	res.render('report',{pose:req.params.pose});

});


app.get('/createJournal',(req,res)=>{
	res.render('createJournal');
})

app.get('/chatbot',(req,res)=>{
	var dataToSend;
 // spawn new child process to call the python script
 const python = spawn('python', ['app.py']);
 // collect data from script
 python.stdout.on('data', function (data) {
  console.log('Pipe data from python script ...');
  dataToSend = data.toString();
 });
 // in close event we are sure that stream from child process is closed
 python.on('close', (code) => {
 console.log(`child process close all stdio with code ${code}`);
 // send data to browser
 res.send(dataToSend)
 });
})

app.post("/createJournals",function(req,res){

	const journalTitle=req.body.title
	const who=req.body.who
	const where=req.body.where
	const tag=req.body.tag
	const subject=req.body.subject
const post={
	 journalTitle:req.body.title,
	 who:req.body.who,
	 where:req.body.where,
	 tag:req.body.tag,
	 subject:req.body.subject
}
const journal=new Journal({
	journalTitle:req.body.title,
	who:req.body.who,
	where:req.body.where,
	tag:req.body.tag,
	subject:req.body.subject
})
journal.save(err=>{
	err?console.log(err):res.render("journals",{posts:posts})
})
posts.push(post)
res.redirect("journals")
})

app.get("/journals",function(req,res){
	res.render("allJournals",{
		posts:posts
	})
})
const port = process.env.PORT||3000;
app.listen(port,()=>{
	console.log("server up!");
})