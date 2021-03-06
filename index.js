const path = require("path");
const express = require("express");
var session = require('express-session');
var SQLiteStore = require('connect-sqlite3')(session);

function isDef(v) {
    return (typeof v !== "undefined");
}

function isConnected(sess) {
    return (typeof sess !== 'undefined' && typeof sess.username !== 'undefined' && typeof sess.id !== 'undefined');
}

module.exports = function(options) {
    var app = options.app
    var lang = options.lang || "en";

    if(!isDef(options.realPass)) {
        throw new Error("You need to specify an admin password in the options");
        return;
    }

    if(!isDef(options.sessionSecret)) {
        throw new Error("You need to specify a cookie session secret in the options");
        return;
    }

    app.use(session({
        store: new SQLiteStore({
            table: "sessions",
            db: "sessionsDB",
            dir: __dirname
        }),
        secret: options.sessionSecret,
        saveUninitialized: true,
        resave: true
    }));

    var realPass = options.realPass;

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
                res.redirect("/session/?wrongpass=true");
            }
        } else {
            res.redirect("/session/?wrongpass=true");
        }
    });

    router.get('/disconnect', function(req, res) {
        if(isConnected(req.session)) {
            req.session.destroy(function(err) {
                if (err) {
                    logError(err);
                }
                res.redirect('/');
            });
        } else {
            res.redirect('/');
        }
    });

    app.use("/session/", router);
}
