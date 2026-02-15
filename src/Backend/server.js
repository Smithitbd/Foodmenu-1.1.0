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
app.use('/uploads', express.static('uploads'));

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

//API for Menu Item Add
app.post('/api/add-product', upload.array('images',10), async(req, res) =>{
    const connection = await db.promise();

    try{
        const {restaurant_id, name, price, offer_price, category} = req.body;
        const files = req.files;

        // first insert data into product table 
        const [productResult] = await connection.query(
            `INSERT INTO products (restaurant_id, name, price, offer_price, category) VALUES (?, ?, ?, ?, ?)`,
            [restaurant_id, name, price, offer_price || 0, category]
        );
        const productId = productResult.insertId;

        //jodi image thake tailey eta niya product_image table o rakha 
        if(files && files.length > 0){
            for(const file of files){
                const fileName = `prod-${Date.now()}-${Math.round(Math.random()*1E9)}.webp`;
                //image optimization
                await sharp(file.buffer)
                .resize(500, 500, {fit:'cover'})
                .webp({quality: 80})
                .toFile(path.join(uploadDir, fileName));
                //image path save in database 
                await connection.query(
                    `INSERT INTO product_images (product_id, image_path) VALUES (?, ?)`,
                    [productId, fileName]
                );
            }
        }
        res.status(201).json({ message: "Product and images added successfully!", productId });
    }
    catch(error){
        console.error("Error:", error);
        res.status(500).json({ message: "Server error occurred!" });
    }
});

//API for Menu List
app.get('/api/menu-list', (req, res) => {
    const { restaurantId } = req.query;
    const sql = `
        SELECT p.*, 
        GROUP_CONCAT(pi.image_path) as all_images 
        FROM products p 
        LEFT JOIN product_images pi ON p.id = pi.product_id 
        GROUP BY p.id 
        ORDER BY p.id DESC`;
        db.query(sql, (err, results) => {
            if (err) return res.status(500).json({ error : err.message});
            const updatedResults = results.map(item => ({
                ...item,
                images : item.all_images ? item.all_images.split(',') : []
            }));
            res.json(updatedResults);
        });
});

// API for updating a product
app.put('/api/update-product/:id', (req, res) => {
    const { id } = req.params;
    const { name, price, category } = req.body;

    const sql = "UPDATE products SET name = ?, price = ?, category = ? WHERE id = ?";
    db.query(sql, [name, price, category, id], (err, result) => {
        if (err) {
            console.error("Update Error:", err);
            return res.status(500).json({ message: "Update failed!" });
        }
        res.status(200).json({ message: "Product updated successfully!" });
    });
});

// API for updating a product
app.delete('/api/delete-product/:id', async (req, res) => {
    const { id } = req.params;
    const connection = await db.promise();

    try {
        // first delete image from product_image
        await connection.query("DELETE FROM product_images WHERE product_id = ?", [id]);
        
        // product delete from product table
        const [result] = await connection.query("DELETE FROM products WHERE id = ?", [id]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: "Item deleted successfully!" });
        } else {
            res.status(404).json({ message: "Item not found!" });
        }
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ message: "Server error during deletion!" });
    }
});

// API for Add Category
app.post('/api/add-category', (req, res) => {
    const { name } = req.body;
    const sql = "INSERT INTO categories (name) VALUES (?)";
    db.query(sql, [name], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Category added successfully!" });
    });
});

// API for get Category
app.get('/api/get-categories', (req, res) => {
    const sql = "SELECT id,  name FROM categories ORDER BY name ASC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results); 
    });
});

//API for Update Category
app.put('/api/update-category/:id', (req, res) => {
    db.query("UPDATE categories SET name = ? WHERE id = ?", [req.body.name, req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        res.send("Updated");
    });
});

//API for Delete Category
app.delete('/api/delete-category/:id', (req, res) => {
    db.query("DELETE FROM categories WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        res.send("Deleted");
    });
});

// Server Port setup
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});