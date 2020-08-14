const express=require("express");
const app=express();
var bodyParser = require("body-parser");
const mongoose=require("mongoose");
const localstrategy = require("passport-local");
const passportlocalmongoose = require("passport-local-mongoose");
const passport = require("passport");
const methodoverride=require("method-override");
var User=require("./models/User.js");
var Bill=require("./models/Bill.js");
const { db } = require("./models/User.js");

mongoose.connect("mongodb://localhost/bill_splitter",{useNewUrlParser:true,useUnifiedTopology: true,useCreateIndex: true});

app.use(methodoverride("_method"));
app.use(require("express-session")({
    secret:"this is bill splitter",
    resave:false,
    saveUninitialized:false,
}));

passport.use(new localstrategy(User.authenticate()));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use('/public', express.static('public')); 

app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    next();
});

app.get("/",function(req,res){
    res.render("index");
});

app.post("/",function(req,res){
    var paise=req.body.amount;
    var people=req.body.extra;
    if(req.body.involve=="1")
    {
        people++;
    }
    var x=paise/people;
    res.render("served",{name:req.body.Name,amount:x});
});

app.post("/create",isloggedin,(req,res)=>{
    Bill.create({
        name:req.body.billname,
        payer:req.body.payer,
        total:req.body.amount},(err,bill)=>{
        if(err)
        {
            res.redirect("/");
        }
        else{
            res.redirect("create/"+bill._id);
        }
    });
});

app.get("/create/:id",isloggedin,(req,res)=>{
    var id=req.params.id;
    Bill.findById(id,function(err,bill){
        if(err){
            res.redirect("/");
        }else{
            res.render("create",{bill:bill});
        }
    });
});

app.post("/add/:id",isloggedin,(req,res)=>{
    var id=req.params.id;
    Bill.findById(id,(err,bill)=>{
        if(err){
            res.redirect("/create/"+id);
        }
        else{
            bill.people.push(req.body.friend);
            bill.save();
            res.render("create",{bill:bill});
        }
    });
});

app.post("/create/:id",isloggedin,(req,res)=>{
    Bill.findById(req.params.id,(err,bill)=>{
        if(err){
            res.redirect("/create"+req.params.id);
        }
        else{
            res.render("created",{bill:bill});
        }
    });
});

app.post("/delete/:id/:Name",(req,res)=>{
    Bill.findById(req.params.id,(err,bill)=>{
        if(err){
            res.render("create",{bill:bill});
        }else{
            bill.people.pull(req.params.Name);
            bill.save();
            res.render("create",{bill:bill});
        }
    });
});

app.get("/login",(req,res)=>{
    res.render("login");
});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.post("/register",function(req,res){
    User.register(new User({username:req.body.username}),req.body.password,function(error,user){
        if(error)
        {
            res.render("register");
        } else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/");
            });
        }
    })
});
app.post("/login",passport.authenticate("local",{
    successRedirect: "/",
    failureRedirect: "/login"
}),function(req,res){

});

app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
});

function isloggedin(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(3002,'localhost',function()
{
    console.log("server is runing....");
});