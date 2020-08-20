const path = require("path");
const express = require("express");

function isDef(v) {
    return (typeof v !== "undefined");
}

module.exports = function(options) {
    var app = options.app
    var lang = options.lang || "en";

    if(!isDef(options.realPass)) {
        throw new Error("You need to specify an admin password in the options");
        return;
    }

    var router = express.Router();


    router.use('/img', express.static(path.join(__dirname, 'public/img')));
    router.use('/css', express.static(path.join(__dirname, 'public/css')));

    router.get('/', function(req, res) {
        if(lang === "fr") {
            res.sendFile(path.join(__dirname, 'views/index_fr.html'));
        } else {
            res.sendFile(path.join(__dirname, 'views/index_en.html'));
        }
    })

    router.post('/', function(req, res) {
        var password = req.body.password;
        if(isDef(password)) {
            if(password === realPass) {
                req.session.username = "admin";
                req.session.rank = 4;
                res.redirect("/minecraft/");
            } else {
                res.redirect("/user/?wrongpass=true");
            }
        } else {
            res.redirect("/user/?wrongpass=true");
        }
    });

    router.get('/disconnect', function(req, res) {
        isConnected(req.session, function() {
            req.session.destroy(function(err) {
              if (err) {
                logError(err);
              }
          });
        }, function() {
            res.redirect('/');
        });
    });

    app.use("/session/", router);
}
