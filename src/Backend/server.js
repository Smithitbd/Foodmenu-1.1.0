import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();

//MiddleWare
app.use(cors());
app.use(bodyParser.json());

//Database connection 
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'foodmenubd'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection error ' + err.stack);
    } else {
        console.log('Successfully connected to the MySql Database....!');
    }
});

//test route 
app.get('/', (req, res) => {
    res.send('Foodmenu backend server is running bruh.....!');
});

//API for collecting list of all restaurant 
app.get('/api/restaurants', (req, res) => {
    const sql = "SELECT * FROM Restaurants ";
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database query failed" });
        }
        res.json(results);
    });
});

//API for register new restaurant
app.post('/api/register-restaurant', (req, res) => {
    const { owner_name, owner_email, owner_password, restaurant_name, slug, location } = req.body;
    const sql = 'INSERT INTO Restaurants (owner_name, owner_email, owner_password, restaurant_name, slug, location) VALUES (?,?,?,?,?,?)';
    const values = [owner_name, owner_email, owner_password, restaurant_name, slug, location];

    db.query(sql, values, (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: "Awwww.....E-mail or Slug already Exists..!!!" });
            }
            return res.status(500).json({ error: err.message });
        }
        return res.status(201).json({ message: "Hurrey..! Restaurant register successfully...", id: results.insertId });
    });
});

//API for Login
app.post('/api/login', (req, res) => {
    const {email, password} = req.body;
    const sql = "SELECT * FROM Restaurants WHERE owner_email = ? AND owner_password = ?";

    db.query(sql, [email, password], (err, results) => {
        if (err) return res.status(500).json( {error: err.message} );

        if(results.length > 0)
        {
            const user = results[0];
            res.status(200).json({
                message : "Yeah....!!!Login Successfully..",
                user:{
                    id:user.id,
                    name: user.owner_name,
                    restaurant : user.restaurant_name
                }
            });
        }
        else res.status(401).json( {message: "Invalid E-mail or password!\nPlease try again with correct E-mail or Password."} );
    });
});

//Server Port setup
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});