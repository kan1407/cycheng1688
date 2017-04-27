var restify = require("restify")
var server = restify.createServer();

//required the bcrypt api
var bcrypt = require("bcrypt");

// Initialize Firebase
var firebase = require("firebase")
var config = {
    apiKey: "AIzaSyDx4r8a2ay9u9R55BeUAp4CLRsJrizgbk8",
    authDomain: "assignment-part2.firebaseapp.com",
    databaseURL: "https://assignment-part2.firebaseio.com",
    projectId: "assignment-part2",
    storageBucket: "assignment-part2.appspot.com",
    messagingSenderId: "553369672331"
};
firebase.initializeApp(config);

var database = firebase.database();

var ref = database.ref()

//success status object
var success_status = {};
success_status.message = ""
success_status.status = true;
//failure status object
var failure_status = {};
failure_status.message = ""
failure_status.status = false;

console.log(JSON.stringify())

server.listen(8080, function() {
    console.log('incoming request being handled');

    //get the user length
    var userlength;
    ref.child("User").on("value", function(snapshot) {
        console.log("There are " + snapshot.numChildren() + " User");
        userlength = snapshot.numChildren();
    })

    //show alluser function
    server.get("/showalluser", function(req, res, next) {
        var userRef = database.ref("User"); // db user child reference
        var userObj = [];
        var test;
        var json;
        var count = 0;
        userRef.on("child_added", function(snapshot, prevChildKey) {
            if (snapshot.getKey() != "user1@key") {
                count = count + 1;
                var Users = snapshot.val();
                var email = Users.email;
                var name = Users.username;
                var password = Users.password;

                userObj.push(snapshot.val());
            }
                console.log(email);
                console.log(name);
                console.log(password);
                console.log(count);
                if (count == userlength - 1) {
                    if (userObj == "") {
                        var json = failure_status;
                        json.message = "no user found!";
                        json = JSON.stringify(failure_status);
                        res.end(json)
                    }
                    else {
                        json = JSON.stringify(userObj)
                        res.end(json);
                    }
                }

        });


    })

    //show user function
    server.get(/^\/showuser\/([a-z]+)\/([0-9,a-z,A-Z,@,.]+)$/, function(req, res, next) {
        var condition = req.params[0];
        var userObj = [];
        var json;
        if (condition == "email") {
            condition = 1
        }
        else if (condition == "username") {
            condition = 2
        }
        var emailorusername = req.params[1];
        var userRef = database.ref("User"); // db user child reference
        userRef.on("child_added", function(snapshot, prevChildKey) {
            if (snapshot.getKey() != "user1@key") {
                var Users = snapshot.val();
                //if user input email
                if (condition == 1) {
                    if (Users.email == emailorusername) {
                        var email = Users.email;
                        var name = Users.username;
                        var password = Users.password;
                        console.log(email);
                        console.log(name);
                        console.log(password);
                        userObj.push(snapshot.val());
                    }
                }
                //if user input username
                if (condition == 2) {
                    if (Users.username == emailorusername) {
                        var email = Users.email;
                        var name = Users.username;
                        var password = Users.password;
                        console.log(email);
                        console.log(name);
                        console.log(password);
                        userObj.push(snapshot.val());
                    }
                }
            }
        });
        if (userObj == "") {
            var json = failure_status;
            json.message = "no user found!";
            json = JSON.stringify(json);
            res.end(json)
        }
        else {
            json = JSON.stringify(userObj)
            res.end(json)
        }
    })

    //register function
    server.get(/^\/insert\/([0-9,@,.,a-z,A-Z]+)\/([0-9,a-z,A-Z]+)\/([A-Z,a-z,0-9]+)$/, function(req, res, next) {
        var userRef = ref.child("User"); // db user child reference
        var email = req.params[0] // user email
        var username = req.params[1] // username
        var password = req.params[2] // user password
        var exists = 0;
        var finish = 0;
        var ignoreItems = true;
        var userRef = database.ref("User"); // db user child reference
        var count = 0;

        userRef.on("child_added", function(snapshot, prevChildKey) {
            var newPost = snapshot.val();

            if (newPost.email == email || newPost.username == username) {
                count = count + 1;
                exists = 1; //username or password is existed
            }
            else {
                count = count + 1;
            }

            if (count.toString() == userlength) {
                console.log(exists)
                    //decide insert or not
                if (exists == 1) { //username or password is existed
                    console.log("Your email or username is existed");
                    var json = failure_status;
                    json.message = "Your email or username is existed";
                    json = JSON.stringify(json);
                    res.end(json);
                }
                else if (exists != 1) {
                    //register the user
                    //hash the password
                    bcrypt.genSalt(10, function(err, salt) {
                        if (err) return; //error
                        bcrypt.hash(password, salt, function(err, bcryptedPassword) {
                            if (err) return //error
                                //user account not exists
                                //save the data to db
                            userRef.push({
                                email: email,
                                username: username,
                                password: bcryptedPassword // hash password
                            });
                            console.log('Save Success!');
                            var json = success_status;
                            json.message = 'Save Success!';
                            json = JSON.stringify(json);
                            res.end(json);
                        });
                    });
                }
            }
        });
    })

    //login function
    server.get(/^\/login\/([a-z,A-Z]+)\/([0-9,a-z,A-Z,@,.]+)\/([0-9,a-z,A-Z]+)$/, function(req, res, next) {
        var condition = req.params[0];
        var resource = res;
        if (condition == "email") {
            condition = 1;
            console.log("user use email to login")
        }
        else if (condition == "username") {
            condition = 2;
            console.log("user use username to login")
        }
        var emailorusername = req.params[1];
        var password = req.params[2];
        var userRef = database.ref("User"); // db user child reference
        var count = 0;

        userRef.on("child_added", function(snapshot, prevChildKey) {
            var newPost = snapshot.val();
            // if user input email to login -----------------------------------------------------
            if (condition == 1) {
                if (newPost.email == emailorusername) {
                    //console.log("email: " + newPost.email);
                    //console.log("username: " + newPost.username);
                    bcrypt.compare(password, newPost.password, function(err, doesMatch) {
                            if (doesMatch) {
                                //log him in
                                console.log("password matched")
                                var json = success_status;
                                json.message = "password matched";
                                json = JSON.stringify(json);
                                res.end(json);
                            }
                            else
                            //go away
                                console.log("password not matched")
                            var json = failure_status;
                            json.message = "password not matched";
                            json = JSON.stringify(json);
                            res.end(json);
                        })
                        //console.log("password: " + newPost.password);
                        //console.log("Previous Post ID: " + snapshot.key);
                }
                else {
                    count = count + 1;
                    //print on last record
                    if (count == userlength) {
                        console.log("email is not existed")
                        var json = failure_status;
                        json.message = "email is not existed";
                        json = JSON.stringify(json);
                        res.end(json);
                    }
                }
            }
            // if user input email to login -----------------------------------------------------

            // if user input username to login --------------------------------------------------
            if (condition == 2) {
                if (newPost.username == emailorusername) {
                    //console.log("email: " + newPost.email);
                    //console.log("username: " + newPost.username);
                    bcrypt.compare(password, newPost.password, function(err, doesMatch) {
                            if (doesMatch) {
                                //log him in
                                console.log("password matched")
                                var json = success_status;
                                json.message = "password matched";
                                json = JSON.stringify(json);
                                res.end(json);
                            }
                            else
                            //go away
                                console.log("password not matched")
                            var json = failure_status;
                            json.message = "password not matched";
                            json = JSON.stringify(json);
                            res.end(json);
                        })
                        //console.log("password: " + newPost.password);
                        //console.log("Previous Post ID: " + snapshot.key);
                }
                else {
                    count = count + 1;
                    //print on last record
                    if (count == userlength) {
                        console.log("username is not existed")
                        var json = failure_status;
                        json.message = "username is not existed";
                        json = JSON.stringify(json);
                        res.end(json);
                    }
                }
            }
            // if user input username to login --------------------------------------------------
        });
        res.end();
    });

    //update function
    //                         condition 1       email or username          condition 2        edit input
    server.get(/^\/update\/([0-9,@,.,a-z,A-Z]+)\/([0-9,@,.,a-z,A-Z]+)\/([0-9,a-z,A-Z]+)\/([0-9,@,.,a-z,A-Z]+)$/, function(req, res, next) {
        //use email or username to update
        var condition = req.params[0];
        if (condition == "email") {
            condition = 1
        }
        else if (condition == "username") {
            condition = 2
        }

        var emailorusername = req.params[1];
        //if email or username existed, assign the key of the data
        var getkey;

        //which want to change
        var conditionedit = req.params[2];
        if (conditionedit == "email") {
            conditionedit = 1
        }
        else if (conditionedit == "password") {
            conditionedit = 2
        }

        var editemailorpassword = req.params[3];

        var count = 0;
        var count1 = 0;
        var existed;
        var existed1;
        var userRef = database.ref("User"); // db user child reference
        //check email or username
        userRef.on("child_added", function(snapshot, prevChildKey) {
            var newPost = snapshot.val();
            // if user input email to update -----------------------------------------------------
            if (condition == 1) {
                count = count + 1;
                if (newPost.email == emailorusername) {
                    existed = 1
                    getkey = snapshot.getKey()
                }
                if (userlength == count && existed != 1) {
                    console.log("email is not existed")
                    var json = failure_status;
                    json.message = "no email found!";
                    json = JSON.stringify(json);
                    res.end(json);
                }
                else if (userlength == count && existed == 1) {
                    //do somthing
                    console.log("email is existed")
                        //-----------------------------------------------------------
                    console.log(conditionedit);
                    if (conditionedit == 1) {
                        //edit email
                        userRef.on("child_added", function(snapshot, prevChildKey) {
                            console.log("email checking" + editemailorpassword)
                            var newPost1 = snapshot.val();
                            console.log(newPost1.email)
                            count1 = count1 + 1;
                            console.log(newPost1.email + " = " + editemailorpassword)
                            console.log(newPost1.email == editemailorpassword)
                            if (newPost1.email == editemailorpassword) {
                                existed1 = 1
                            }
                            if (userlength == count1 && existed1 == 1) {
                                console.log("email you want to edit is already existed!")
                                var json = failure_status;
                                json.message = "email you want to edit is already existed!";
                                json = JSON.stringify(json);
                                res.end(json);
                            }
                            else if (userlength == count1 && existed1 != 1) {
                                console.log("email you want to edit is not existed!")
                                    //update email address

                                database.ref('/User/' + getkey).update({
                                    email: editemailorpassword
                                });
                                console.log('Updated!');
                                var json = success_status;
                                json.message = 'Updated!';
                                json = JSON.stringify(json);
                                res.end(json);
                            }
                        });
                    }

                    if (conditionedit == 2) {
                        //edit password
                        bcrypt.genSalt(10, function(err, salt) {
                            if (err) return; //error
                            bcrypt.hash(editemailorpassword, salt, function(err, bcryptedPassword) {
                                if (err) return //error
                                    //update password in bcrypted
                                database.ref('/User/' + getkey).update({
                                    password: bcryptedPassword
                                });
                                console.log('Updated!');
                                var json = success_status;
                                json.message = 'Updated!';
                                json = JSON.stringify(json);
                                res.end(json);

                            });
                        });
                        //-----------------------------------------------------------
                    }
                }
            }
            if (condition == 2) {
                count = count + 1;
                if (newPost.username == emailorusername) {
                    existed = 1
                    getkey = snapshot.getKey()
                }
                if (userlength == count && existed != 1) {
                    console.log("no username found")
                    var json = failure_status;
                    json.message = "no username found";
                    json = JSON.stringify(json);
                    res.end(json);
                }
                else if (userlength == count && existed == 1) {
                    //do somthing
                    console.log("username is existed, can update")
                        //-----------------------------------------------------------
                    if (conditionedit == 1) {
                        //edit email
                        userRef.on("child_added", function(snapshot, prevChildKey) {
                            console.log("email checking" + editemailorpassword)
                            var newPost1 = snapshot.val();
                            console.log(newPost1.email)
                            count1 = count1 + 1;

                            if (newPost1.email == editemailorpassword) {
                                existed1 = 1
                            }
                            if (userlength == count1 && existed1 == 1) {
                                console.log("email you want to edit is already existed!")
                                var json = failure_status;
                                json.message = "email you want to edit is already existed!";
                                json = JSON.stringify(json);
                                res.end(json);
                            }
                            else if (userlength == count1 && existed1 != 1) {
                                console.log("email you want to edit is not existed!")
                                    //update email address

                                database.ref('/User/' + getkey).update({
                                    email: editemailorpassword
                                });
                                console.log('Updated!');
                                var json = success_status;
                                json.message = 'Updated!';
                                json = JSON.stringify(json);
                                res.end(json);
                            }
                        });
                    }

                    if (conditionedit == 2) { //update password
                        //edit password
                        bcrypt.genSalt(10, function(err, salt) {
                            if (err) return; //error
                            bcrypt.hash(editemailorpassword, salt, function(err, bcryptedPassword) {
                                if (err) return //error
                                    //update password in bcrypted
                                database.ref('/User/' + getkey).update({
                                    password: bcryptedPassword
                                });
                                console.log('Updated!');
                                var json = success_status;
                                json.message = 'Updated!';
                                json = JSON.stringify(json);
                                res.end(json);

                            });
                        });
                        //-----------------------------------------------------------
                    }
                }
            }
        });

        /*
                database.ref('/User/-KidTvJGR4rHc7J-1Rm9').update({
                    username: "kan1408"
                });
        */
        //console.log('matched!');
        res.end();
    });

    //delete function
    server.post(/^\/delete\/([a-z]+)\/([0-9,@,.,a-z,A-Z]+)$/, function(req, res, next) {
        var personref = database.ref("User");
        var condition = req.params[0]
        var emailorusername = req.params[1]

        if (condition == "email") {
            personref.orderByChild('email').equalTo(emailorusername).on('child_added', (snapshot) => {
                snapshot.ref.remove()
            });
            var json = success_status;
            json.message = "user removed!";
            json = JSON.stringify(json);
            res.end(json);
        }
        if (condition == "username") {
            personref.orderByChild('username').equalTo(emailorusername).on('child_added', (snapshot) => {
                snapshot.ref.remove()
            });
            var json = success_status;
            json.message = "user removed!";
            json = JSON.stringify(json);
            res.end(json);
        }
    });
});