const express = require("express");
const app = express();
const port = 3003;
app.use(express.json({ limit: '10mb' }));
const cors = require("cors");
app.use(cors());
const md5 = require('js-md5');
const uuid = require('uuid');
const mysql = require("mysql");
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.json());


const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "ruoniu_filmai",

});

/////////////LOGIN/////////////////////

const doAuth = function(req, res, next) {
    if (0 === req.url.indexOf('/server')) { // admin
        const sql = `
        SELECT
        name, role
        FROM users
        WHERE session = ?
    `;
        con.query(
            sql, [req.headers['authorization'] || ''],
            (err, results) => {
                if (err) throw err;
                if (!results.length || results[0].role !== 10) {
                    res.status(401).send({});
                    req.connection.destroy();
                } else {
                    next();
                }
            }
        );
    } else if (0 === req.url.indexOf('/login-check') || 0 === req.url.indexOf('/login')) {
        next();
    } else { // fron
        const sql = `
        SELECT
        name, role
        FROM users
        WHERE session = ?
    `;
        con.query(
            sql, [req.headers['authorization'] || ''],
            (err, results) => {
                if (err) throw err;
                if (!results.length) {
                    res.status(401).send({});
                    req.connection.destroy();
                } else {
                    next();
                }
            }
        );
    }
}

app.use(doAuth);

// AUTH
app.get("/login-check", (req, res) => {
    const sql = `
         SELECT
         name, role
         FROM users
         WHERE session = ?
        `;
    con.query(sql, [req.headers['authorization'] || ''], (err, result) => {
        if (err) throw err;
        if (!result.length) {
            res.send({ msg: 'error', status: 1 }); // user not logged
        } else {
            if ('admin' === req.query.role) {
                if (result[0].role !== 10) {
                    res.send({ msg: 'error', status: 2 }); // not an admin
                } else {
                    res.send({ msg: 'ok', status: 3 }); // is admin
                }
            } else {
                res.send({ msg: 'ok', status: 4 }); // is user
            }
        }
    });
});

app.post("/login", (req, res) => {
    const key = uuid.v4();
    const sql = `
    UPDATE users
    SET session = ?
    WHERE name = ? AND psw = ?
  `;
    con.query(sql, [key, req.body.user, md5(req.body.pass)], (err, result) => {
        if (err) throw err;
        if (!result.affectedRows) {
            res.send({ msg: 'error', key: '' });
        } else {
            res.send({ msg: 'ok', key });
        }
    });
});

/////////////END//////////////////////

//CREATE
app.post("/server/cats", (req, res) => {
    const sql = `
    INSERT INTO cats (title)
    VALUES (?)
    `;
    con.query(sql, [req.body.title], (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});
app.post("/server/movies", (req, res) => {
    const sql = `
    INSERT INTO movies (title, price, cat_id, image)
    VALUES (?, ?, ?, ?)
    `;
    con.query(sql, [req.body.title, req.body.price, req.body.cat_id, req.body.image], (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

// READ (all)
app.get("/server/cats", (req, res) => {
    const sql = `
    SELECT id, title
    FROM cats
    ORDER BY id DESC
    `;
    con.query(sql, (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});
// READ (all)
app.get("/server/movies", (req, res) => {
    const sql = `
    SELECT *
    FROM movies
    ORDER BY id DESC
    `;
    con.query(sql, (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});
app.get("/home/movies", (req, res) => {
    const sql = `
    SELECT m.*, c.title AS catTitle, c.id AS cid
    FROM movies AS m
    INNER JOIN cats AS c
    ON m.cat_id = c.id
    ORDER BY m.title
    `;
    con.query(sql, (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});


//DELETE
app.delete("/server/cats/:id", (req, res) => {
    const sql = `
    DELETE FROM cats
    WHERE id = ?
    `;
    con.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});
app.delete("/server/movies/:id", (req, res) => {
    const sql = `
    DELETE FROM movies
    WHERE id = ?
    `;
    con.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});


//EDIT
app.put("/server/cats/:id", (req, res) => {
    const sql = `
    UPDATE cats
    SET title = ?
    WHERE id = ?
    `;
    con.query(sql, [req.body.title, req.params.id], (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});
app.put("/home/movies/:id", (req, res) => {
    const sql = `
    UPDATE movies
    SET 
    rating_sum = rating_sum + ?, 
    rating_count = rating_count + 1, 
    rating = rating_sum / rating_count
    WHERE id = ?
    `;
    con.query(sql, [req.body.rate, req.params.id], (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});
app.put("/server/movies/:id", (req, res) => {
    let sql;
    let r;
    if (req.body.deletePhoto) {
        sql = `
        UPDATE movies
        SET title = ?, price = ?, cat_id = ?, image = null
        WHERE id = ?
        `;
        r = [req.body.title, req.body.price, req.body.cat_id, req.params.id];
    } else if (req.body.image) {
        sql = `
        UPDATE movies
        SET title = ?, price = ?, cat_id = ?, image = ?
        WHERE id = ?
        `;
        r = [req.body.title, req.body.price, req.body.cat_id, req.body.image, req.params.id];
    } else {
        sql = `
        UPDATE movies
        SET title = ?, price = ?, cat_id = ?
        WHERE id = ?
        `;
        r = [req.body.title, req.body.price, req.body.cat_id, req.params.id]
    }
    con.query(sql, r, (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});


app.listen(port, () => {
    console.log(`Filmus rodo per ${port} porta!`)
});

