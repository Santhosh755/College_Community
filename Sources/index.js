const express = require("express");
const mongodb = require("mongodb").MongoClient;
const file = require("fs");
const app = express();
const dotenv = require("dotenv").config();
const bodyparser = require("body-parser");
const { Server } = require("socket.io");
const http = require('http');
const server = http.createServer(app);
const io = new Server(server);
var url_host = require('url');
const path = require("path");
const ejs = require('ejs');
const nodemailer = require('nodemailer');
// const fileupload = require("express-fileupload")

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.set('views', "./view");
app.set('view engine', 'ejs');

app.use(express.static("Styles"));
app.use(express.static("Scripts"));
// app.use(fileupload());

server.listen(process.env.PORT_NUMBER, function () { 
    console.log("Listening on ", process.env.PORT_NUMBER) 
})

var user_public = "";
// All Details for Sign up
var user;
var mail_id;
var phone;
var pass;
var check = "null";
var count = 0;
var query_insert = {};
var email_id_signin;
var check_process = "";
var mail_check = "";
var mailcode = "";
var password_value = "";
var update_password_check = "";
var create_group = "";


io.on('connection', (socket) => {
    console.log("User Connected");
    count++;
    io.emit("count_value", count);
    socket.on('chat', (data, name_current) => {
        // console.log(msg);
        socket.broadcast.emit('chat', data, name_current)
    })
    socket.on('disconnect', () => {
        console.log("User Disconnected");
        count--;
        io.emit("count_value", count);
    })
})

app.get("/", (req, res) => {
    res.render("entrance")
})


app.get("/" + user_public + "accountget", (req, res) => {
    mongodb.connect(process.env.URL_IP, function (err, values) {
        if (err) {
            console.log("Not Connected to DataBase");
        }
        else {
            console.log("Connected in Account get");
            var database = values.db("Community");
            database.collection("All_Data").find({mail: email_id_signin}).toArray((err, data) => {
                if(err){
                    console.log(err);
                }
                else {
                    try {
                        var name_account = data[0].user;
                        var mail_account = data[0].mail;
                        var phone_account = data[0].phone;
                        var password_account = data[0].password;
                        var role_account = data[0].role;
                        var college_name_account = data[0].college_name;

                        if(check_process == "Done")
                        {
                            app.get("/"+name_account, (req, res) => {
                                mongodb.connect(process.env.URL_IP, function(err, data) {
                                    if(err) {
                                        console.log("Unable to Connect with Database");
                                    }
                                    else {
                                        var database = data.db("Community");
                                        var groups_list = "";
                                        database.collection("All_Data").find({mail:mail_account}).toArray((err,value) => {
                                            try {
                                                groups_list = value[0].groups;
                                            }
                                            catch(e){
                                                groups_list = "No Groups Joined"
                                            }
                                            res.render("../index", {name_account: name_account, mail_account:mail_account, phone_account: phone_account, password_account: password_account, role_account:role_account, college_name_account:college_name_account, groups_list:groups_list});
                                        })
                                    }
                                })
                            })
                            app.get("/"+name_account+"creategroup", (req, res) => {
                                res.render("creategroup_app", {name_account: name_account, mail_account:mail_account, phone_account: phone_account, password_account: password_account, role_account:role_account, college_name_account:college_name_account, create_group: create_group});
                                app.post("/"+name_account+"create_group", (req, res) => {
                                    var group_name = req.body.group_name;
                                    var code = req.body.code;
                                    mongodb.connect(process.env.URL_IP, function(err, data) {
                                        if(err) {
                                            console.log("Unable to Connect with DataBase", err);
                                        }
                                        else {
                                            var database1 = data.db("Community");
                                            database1.collection("Public").insertOne({ group_name: group_name, code: code }, (err, res) => {
                                                if (err) { 
                                                    console.log(err);
                                                    create_group = "no"
                                                }
                                                else {
                                                    create_group = "success"
                                                    mongodb.connect(process.env.URL_IP, function(err, data) {
                                                        var database = data.db("Community");
                                                        database.collection("All_Data").find({mail:mail_account}).toArray((err,value) => {
                                                            if(err) {
                                                                console.log("Error Occured");
                                                            }
                                                            else {
                                                                try {
                                                                    var groups = value[0].groups;
                                                                }
                                                                catch(e) {
                                                                    var groups = "";
                                                                }
                                                                if(groups != "") {
                                                                    mongodb.connect(process.env.URL_IP, function(err, data) {
                                                                        if(err){console.log("Unable to Connect")}
                                                                        else{
                                                                            var database = data.db("Community");
                                                                            database.collection("All_Data").updateOne({mail:mail_account}, {$set:{groups:groups + "," +group_name}}, function(err, data) {
                                                                                if(err) {
                                                                                    console.log("Update Failed due to some Problem");
                                                                                }
                                                                                else {
                                                                                    console.log("Updated");
                                                                                }
                                                                            })
                                                                        }
                                                                    })
                                                                }
                                                                else {
                                                                    mongodb.connect(process.env.URL_IP, function(err, data) {
                                                                        if(err){console.log("Unable to Connect")}
                                                                        else{
                                                                            var database = data.db("Community");
                                                                            database.collection("All_Data").updateOne({mail:mail_account}, {$set:{groups:group_name}}, function(err, data) {
                                                                                if(err) {
                                                                                    console.log("Update Failed due to some Problem");
                                                                                }
                                                                                else {
                                                                                    console.log("Updated");
                                                                                }
                                                                            })
                                                                        }
                                                                    })
                                                                }
                                                            }
                                                        })
                                                    })
                                                }
                                            })
                                        }
                                    })
                                })
                            })
                            app.get("/"+name_account+"joingroup", (req, res) => {
                                res.render("joingroup_app", {name_account: name_account, mail_account:mail_account, phone_account: phone_account, password_account: password_account, role_account:role_account, college_name_account:college_name_account});
                            })
                            app.post("/"+name_account+"joingroupcheck1", (req, res) => {
                                var code_check = req.body.code_value;
                                mongodb.connect(process.env.URL_IP, function(err, data) {
                                    if(err) {
                                        console.log("Unable to Connect with Database");
                                    }
                                    else {
                                        var database = data.db("Community");
                                        database.collection("Public").find({code:code_check}).toArray((err, values) => {
                                            if(err) {
                                                console.log("Error Occured");
                                            }
                                            else {
                                                try {
                                                    var code_get = values[0].group_name;
                                                    console.log("Yes");
                                                    mongodb.connect(process.env.URL_IP, function(err, data) {
                                                        if(err) {
                                                            console.log("Unable to Connect with Database")
                                                        }
                                                        else {
                                                            var database = data.db("Community");
                                                            database.collection("All_Data").find({mail:mail_account}).toArray((err, values) => {
                                                                if(err){
                                                                    console.log("Unable to Connect");
                                                                }
                                                                else {
                                                                    try {
                                                                        var groups = values[0].groups;
                                                                    }
                                                                    catch(e) {
                                                                        var groups = "";
                                                                    }
                                                                    if(groups != "") {
                                                                        mongodb.connect(process.env.URL_IP, (req, res) => {
                                                                            if(err){
                                                                                console.log("Unable to Connect")
                                                                            }
                                                                            else {
                                                                                database.collection("All_Data").updateOne({mail:mail_account}, {$set:{groups:groups + "," +code_get}}, function(err, data) {
                                                                                    if(err) {
                                                                                        console.log("Update Failed due to some Problem");
                                                                                    }
                                                                                    else {
                                                                                        console.log("Updated");
                                                                                    }
                                                                                })
                                                                            }
                                                                        })
                                                                    }
                                                                    else {
                                                                        mongodb.connect(process.env.URL_IP, (req, res) => {
                                                                            if(err){
                                                                                console.log("Unable to Connect")
                                                                            }
                                                                            else {
                                                                                database.collection("All_Data").updateOne({mail:mail_account}, {$set:{groups:groups + code_get}}, function(err, data) {
                                                                                    if(err) {
                                                                                        console.log("Update Failed due to some Problem");
                                                                                    }
                                                                                    else {
                                                                                        console.log("Updated");
                                                                                    }
                                                                                })
                                                                            }
                                                                        })
                                                                    }
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                                catch(e){
                                                    console.log("No");
                                                }
                                            }
                                        })
                                    }
                                })
                            })
                            app.get("/"+name_account+"joingroupresult", (req, res) => {
                                if(check_join == "yes")
                                {
                                    res.send("Done");
                                }
                            })
                            res.redirect(name_account);
                            app.get('/'+name_account+'chatroom', (req, res) => {
                                res.render("chat_app", {name_account: name_account, mail_account:mail_account, phone_account: phone_account, password_account: password_account, role_account:role_account, college_name_account:college_name_account});
                            })
                            app.get("/"+name_account+"creategroupcheck", (req, res) => {
                                if(create_group == "success")
                                {
                                    res.send("<b style='font-size:50px; font-family:sans-serif;'>Created Success</b>");
                                }
                                else {
                                    res.send("<b style='font-size:50px; font-family:sans-serif;'>Unable to Create</b>");
                                }
                            })
                        }
                        else {
                            res.send("Invalid Password");
                        }
                    }
                    catch(e) {
                        res.send("Invalid Email Address");
                    }
                }
            })
        }
    })
})


app.get("/update_password", (req, res) => {
    res.render("updatepass_app", {mailcode:mailcode});
})

app.get("/update_password_success", (req, res) => {
    res.send("<b style='font-size:50px; font-family:sans-serif;'>Updated Successfully</b>");
})


app.get("/update_password2", (req, res) => {
    res.send("<center><b style='font-size:30px; font-family:sans-serif;'>Update Success</b><br><br><br><a href='/signinapp'>Go to Sign In</a></center>");
})

app.get("/update_password1", (req, res) => {
    res.redirect("/update_password2")
})

app.post("/update_password", (req, res) => {
    password_value = req.body.password_value;
    mongodb.connect(process.env.URL_IP, function(err, values) {
        if(err) {
            console.log("Unable to Connect to Database", err);
        }
        else {
            var database = values.db("Community");
            database.collection("All_Data").updateOne({mail:mailcode}, {$set:{password: password_value}}, function(err, data) {
                if(err) {
                    console.log("Update Failed due to some Problem");
                }
                else {
                    update_password_check = "Done"
                }
            })
        }
    })
})

app.get("/forgetpass", (req, res) => {
    res.render("forgetpass_app");
})

app.post("/forgetpass", (req, res) => {
    mailcode = req.body.mailcode;
    mongodb.connect(process.env.URL_IP, function (err, values) {
        if (err) {
            alert("Unable to Connect with DataBase")
        }
        else {
            var database = values.db("Community");
            database.collection("All_Data").find({mail: mailcode}).toArray((err, data) => {
                if(err) {console.log(err);}
                else {
                    try {
                        if(data[0].mail == mailcode)
                        {
                            mail_check = "yes"
                        }
                        else {
                            mail_check = "no"
                        }
                    }
                    catch(e) {
                        mail_check = "no"
                    }
                }
            })
        }
    })
})

app.get("/verify_code_next", (req, res) => {
    if(mail_check == "yes") {
        var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var passwordLength = 6;
        var password = "";
        for (var i = 0; i < passwordLength; i++) {
            var randomNumber = Math.floor(Math.random() * chars.length);
            password += chars.substring(randomNumber, randomNumber + 1);
        }

        var transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "computerscience4e@gmail.com",
                pass: "ougysrhnvztiqbkf"
            }
        });

        var mail_options = {
            from: "computerscience4e@gmail.com",
            to: mailcode,
            subject: "Requesting for Reset the password?",
            text: "Your reset verification code is " + password
        };

        transport.sendMail(mail_options, function (err, sendit) {
            if (err) {
                console.log("Error occured", err);
            }
            else {
                console.log("Mail Sent", sendit.response);
            }
        })
        res.render("mail_verify_app", {mailcode:mailcode,password:password});
    }
    else {
        res.send("<b style='font-size:50px; font-family:sans-serif;'>Email not exists</b>");
    }
})

app.get("/verify_code", (req, res) => {
    res.redirect("/verify_code_next");
})

app.get("/check_for_signin", function(req, res){
    res.redirect("/"+user_public+"accountget");
})

app.get("/account", function (req, res) {
    user_nameget = user_public;
    check_val = check;
    mongodb.connect(process.env.URL_IP, function (err, values) {
        if (err) {
            alert("Unable to Connect with DataBase")
        }
        else {
            var database = values.db("Community");
            database.collection("All_Data").find({ mail: mail_id }).toArray((err, data) => {
                if (err) console.log(err);
                else {
                    try {
                        if (data[0].mail == mail_id) {
                            console.log("Email")
                            check_val="mail";
                        }
                    }
                    catch (e) {
                        database.collection("All_Data").insertOne(query_insert, function (err, res) {
                            if (err) {
                                console.log("Unable to Insert Data")
                                res.send("Somethig went Wrong");
                            }
                            else {
                                console.log("Registered")
                                console.log(check_val);
                            }
                        })
                    }
                    if(check_val!="mail")
                    {
                        check_val = "register";
                    }
                }
                res.render("gohome_app" , {check_value:check_val});
            })
        }
    })
})


app.get("/entrance", function (req, res) {
    user_public = "";
    res.render("../index", {name_account:user_public, mail_account:"", phone_account: "", password_account: "", role_account:"", groups_list: ""})
})

app.get("/select", (req, res) => {
    res.render("select_app");
})

app.get("/signinapp", function (req, res) {
    res.render("signinapp");
})


// Login Post Method
app.post("/signinapp", function(req, res, next) {
    user_public = "";
    email_id_signin = req.body.email_id_signin;
    pass_signin = req.body.pass_signin;
    var query_insert_signin = {mail:email_id_signin, password:pass_signin}

    mongodb.connect(process.env.URL_IP, function(err, values) {
        if(err) {
            console.log("Unable to Connect with DataBase");
        }
        else {
            var database = values.db("Community");
            database.collection("All_Data").find({mail:email_id_signin}).toArray((err, data) => {
                if(err){
                    console.log("Something went wrong in Signin");
                }
                else {
                    try {
                        if(data[0].mail == email_id_signin && data[0].password == pass_signin)
                        {
                            console.log("Success");
                            user_public = data[0].user;
                            check_process = "Done";
                        }
                        else {
                            console.log("Wrong Password");
                            check_process = "Wrong"
                        }
                    }
                    catch(e) {
                        console.log("Catch Error" + e);
                    }
                }
                console.log(check_process);
            })
        }
    })
})

app.get("/registercollege", function (req, res) {
    file.readFile("./view/registercollege_app.ejs", (err, signup_file) => {
        if (err) { console.log("Unable to get a file signup", err) }
        else {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.write(signup_file)
            res.end();
        }
    })
})

app.get("/details1", function (req, res) {
    file.readFile("./view/details1_app.ejs", (err, signup_file) => {
        if (err) { console.log("Unable to get a file signup", err) }
        else {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.write(signup_file)
            res.end();
        }
    })
})

app.get("/chat", function (req, res) {
    console.log(user_public);
    if(user_public == "")
    {
        res.send("Something went wrong")
    }
    else {
        res.render("chat_app", {NAME1 : user_public});
        res.end();
    }
})


// app.get('/chatroom', (req, res) => {
//     file.readFile('./view/chat_app.ejs', (err, chatoutside_file) => {
//         if(err) {console.log("Unable to get a File");}
//         else {
//             res.writeHead(200, {'Content-Type': 'text/html'});
//             res.write(chatoutside_file);
//             res.end();
//         }
//     })
// })


app.get("/signup", (req, res) => {
    var count_college = -1;
    var list_college = [];
    mongodb.connect(process.env.URL_IP, function(err, values){
        if(err) {console.log("Unable to Connect with DataBase")}
        else {
            var database = values.db("Community");
            database.collection("College_Details").find({}).toArray((err, data) => {
                if(err){
                    console.log("Something went wrong in Signin");
                }
                else {
                    while(data)
                    {
                        try {
                            if(count_college == -1)
                            {
                                count_college = 0;
                            }
                            else {
                                count_college++;
                            }
                            list_college.push(data[count_college].college_name);
                        }
                        catch(e) {
                            console.log(count_college)
                            break;
                        }
                    }
                    res.render("signup_app", {list_college:list_college});
                }
            })
        }
    })
})

app.post("/signup", (req, res) => {
    user = req.body.user;
    mail_id = req.body.mail;
    phone = req.body.phone;
    pass = req.body.createpass;
    role = req.body.role;
    college_name = req.body.college_name;
    query_insert = { user: user, mail: mail_id, phone: phone, password: pass, role:role,college_name:college_name }
    user_public = user;
    console.log(user_public);

    var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var passwordLength = 6;
    var password = "";
    for (var i = 0; i < passwordLength; i++) {
        var randomNumber = Math.floor(Math.random() * chars.length);
        password += chars.substring(randomNumber, randomNumber + 1);
    }

    var transport = nodemailer.createTransport({
        service:"gmail",
        auth: {
            user:"computerscience4e@gmail.com",
            pass:"ougysrhnvztiqbkf"
        }
    });

    var mail_options = {
        from: "computerscience4e@gmail.com",
        to: mail_id,
        subject: "Creating an account with Community!",
        text: "Your account creation Code is " + password
    };

    transport.sendMail(mail_options, function(err, sendit){
        if(err) {
            console.log("Error occured");
        }
        else {
            console.log("Mail Sent", sendit.response);
        }
    })

    app.get("/verifying",(req, res)=>{
        res.render("accountcreation_app", {mail_code : password});
    } )
})

app.post("/registercollege_details", (req, res) => {
    college_name=req.body.college_name;
    location_name=req.body.location_name;
    pincode=req.body.pincode;
    principle_name=req.body.principle_name;
    var query_insert = { college_name: college_name, location_name: location_name ,pincode: pincode, principle_name:principle_name }
    mongodb.connect(process.env.URL_IP, function (err, values) {
        if (err) {
            alert("Unable to Connect with DataBase")
        }
        else {
            var database = values.db("Community");
            database.collection("College_Details").insertOne(query_insert, function (err, res) {
                if (err) {
                    console.log("Unable to Insert Data")
                }
                else {
                    console.log("Data Inserted")
                }
            })
        }
    })
    res.render("signinapp");
})
