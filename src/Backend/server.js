import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import multer from 'multer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';  

const app = express();
const saltRounds = 10;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// MiddleWare
app.use(cors());
app.use(bodyParser.json());

// Database connection 
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

// Test route 
app.get('/', (req, res) => {
    res.send('Foodmenu backend server is running bruh.....!');
});

// API for collecting list of all restaurant 
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

// API for register new restaurant 
app.post('/api/register-restaurant', upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'idFileFront', maxCount: 1 },
    { name: 'idFilePdf', maxCount: 1 }
]), async (req, res) => {
    try {
        const { owner_name, owner_email, owner_password, restaurant_name, slug, location } = req.body;
        const files = req.files || {};
        
        let logoFileName = null;
        let nidFileName = null;

        // Logo Processing
        if (files['logo']) {
            const file = files['logo'][0];
            logoFileName = `logo-${Date.now()}.webp`;
            try {
                await sharp(file.buffer)
                    .resize(400, 400, { fit: 'inside' })
                    .webp({ quality: 80 })
                    .toFile(path.join(uploadDir, logoFileName));
            } catch (sharpError) {
                console.error("Logo Sharp Error:", sharpError);
            }
        }

        // ID photo/pdf Processing
        if (files['idFileFront']) {
            const file = files['idFileFront'][0];
            if (file.mimetype.startsWith('image/')) {
                nidFileName = `nid-${Date.now()}.webp`;
                try {
                    await sharp(file.buffer)
                        .resize(1200)
                        .webp({ quality: 75 })
                        .toFile(path.join(uploadDir, nidFileName));
                } catch (sharpError) {
                    console.error("NID Sharp Error:", sharpError);
                }
            } else {
                nidFileName = `nid-${Date.now()}${path.extname(file.originalname)}`;
                fs.writeFileSync(path.join(uploadDir, nidFileName), file.buffer);
            }
        } else if (files['idFilePdf']) {
            const file = files['idFilePdf'][0];
            nidFileName = `doc-${Date.now()}.pdf`;
            fs.writeFileSync(path.join(uploadDir, nidFileName), file.buffer);
        }

        const hashedPassword = await bcrypt.hash(owner_password, 10);

        const sql = `INSERT INTO restaurants 
                    (owner_name, owner_email, owner_password, restaurant_name, slug, logo, nid_doc, location, status) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [owner_name, owner_email, hashedPassword, restaurant_name, slug, logoFileName, nidFileName, location, 'inactive'];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("MySQL Error:", err);
                return res.status(500).json({ message: "Database failure", error: err.code });
            }
            res.status(201).json({ message: "Registration Successful!" });
        });

    } catch (error) {
        console.error("Global Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// API for Login 
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM Restaurants WHERE owner_email = ?";

    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
            const user = results[0];

            const isMatch = await bcrypt.compare(password, user.owner_password);

            if (isMatch) {
                res.status(200).json({
                    message: "Yeah....!!! Login Successfully..",
                    user: {
                        id: user.id,
                        name: user.owner_name,
                        restaurant: user.restaurant_name
                    }
                });
            } else {
                res.status(401).json({ message: "Invalid E-mail or password!\nPlease try again." });
            }
        } else {
            res.status(401).json({ message: "Invalid E-mail or password!\nPlease try again." });
        }
    });
});

// Server Port setup
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});