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
    const { identifier, password } = req.body;

    const sql = "SELECT * FROM Restaurants WHERE owner_email = ? OR owner_name = ? OR restaurant_name = ?";

    db.query(sql, [identifier, identifier, identifier], async (err, results) => {
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
                        restaurant: user.restaurant_name,
                        logo: user.logo 
                    }
                });
            } else {
                res.status(401).json({ message: "Invalid credentials! Please try again." });
            }
        } else {
            res.status(401).json({ message: "User not found with the provided Email/Name/Restaurant." });
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
    const { restaurant_id } = req.query;
    const sql = `
    SELECT p.*, GROUP_CONCAT(pi.image_path) as all_images 
    FROM products p 
    LEFT JOIN product_images pi ON p.id = pi.product_id 
    WHERE p.restaurant_id = ? 
    GROUP BY p.id 
    ORDER BY p.id DESC`
        db.query(sql, [restaurant_id], (err, results) => {
            if (err) return res.status(500).json({ error : err.message});
                const updatedResults = results.map(item => ({
                ...item,
                images: item.all_images ? item.all_images.split(',') : []
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
    const { name, restaurant_id } = req.body;
    /*if (!name || !restaurant_id) {
        return res.status(400).json({ message: "Name and Restaurant ID are required!" });
    }*/
    const sql = "INSERT INTO categories (name, restaurant_id) VALUES (?, ?)";
    db.query(sql, [name, restaurant_id], (err, result) => {
        if (err) {
            if(err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: "Category already exists in your menu!" });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: "Category added successfully!" });
    });
});

// API for get Category
app.get('/api/get-categories', (req, res) => {
    const { restaurant_id } = req.query;
    if (!restaurant_id) {
        return res.status(400).json({ error: "Restaurant ID is required" });
    }
    //const sql = "SELECT * FROM categories WHERE restaurant_id = ? ORDER BY id DESC";
    const sql = "SELECT name FROM categories WHERE restaurant_id = ? ORDER BY name ASC";
    db.query(sql, [restaurant_id], (err, results) => {
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

// API for Dashboard status
app.get('/api/restaurant-stats/:resId', async(req, res) => {
    const { resId } = req.params;
    const conn = db.promise();

    try{
        //Restaurant Name and Status
        const [resInfo] = await conn.query("SELECT restaurant_name, status FROM restaurants WHERE id = ?", [resId]);

        // Total menu item
        const [menuCount] = await conn.query("SELECT COUNT(*) as total FROM products WHERE restaurant_id = ?", [resId]);
        
        // store status
        const statusSql = "SELECT status FROM restaurants WHERE id = ?";

        //pending order
        const [orders] = await conn.query("SELECT COUNT(*) as active FROM orders WHERE restaurant_id = ? AND status = 'pending'", [resId]);


        // Todays income 
        const [earnings] = await conn.query("SELECT SUM(total_price) as todayTotal FROM orders WHERE restaurant_id = ? AND DATE(created_at) = CURDATE()", [resId]);

        //Weekly income
        const [weeklySales] = await conn.query(`
            SELECT DAYNAME(created_at) as day, SUM(total_price) as total 
            FROM orders 
            WHERE restaurant_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DAYNAME(created_at)
        `, [resId]);

        //Incoming Order
        const [latestOrders] = await conn.query("SELECT id, total_price, status FROM orders WHERE restaurant_id = ? ORDER BY id DESC LIMIT 3", [resId]);

        res.json({
            name: resInfo[0]?.restaurant_name || localStorage.getItem('resName'),
            status: resInfo[0]?.status || "inactive",
            totalMenu: menuCount[0]?.total || 0,
            activeOrders: orders[0]?.active || 0,
            todayEarning: earnings[0]?.todayTotal || 0,
            avgRating: 4.8, // আপাতত ডামি রেটিং
            weeklySales: weeklySales.length > 0 ? weeklySales : [
                {day: 'Sun', total: 0}, {day: 'Mon', total: 0}, {day: 'Tue', total: 0}, {day: 'Wed', total: 0}
            ],
            incomingOrders: latestOrders
        });

    }catch(err){
        console.error("Dashboard API Error:", err);
        res.status(500).json({ error: "Internal Server Error" });   
    }
    /*db.query(menuCountSql, [resId], (err, menuRes) => {
        if (err) return res.status(500).json(err);
        
        db.query(statusSql, [resId], (err, statusRes) => {
            if (err) return res.status(500).json(err);
            
            res.json({
                totalMenu: menuRes[0].totalMenu,
                storeStatus: statusRes[0].status, // 'active' or 'inactive'
                activeOrders: 0, // পরে অর্ডার টেবিল হলে আপডেট হবে
                todayEarning: 0,
                avgRating: 4.8
            });
        });
    });*/
});

//  API for Store status
app.put('/api/update-store-status/:resId', (req, res) => {
    const { resId } = req.params;
    const { status } = req.body; // 'active' or 'inactive'
    
    const sql = "UPDATE restaurants SET status = ? WHERE id = ?";
    db.query(sql, [status, resId], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Status updated successfully", status });
    });
});

// API for food Status
app.patch('/api/update-food-status/:id', (req, res) => {
    const { id } = req.params;
    const { is_available } = req.body; // status: true or false

    const sql = "UPDATE products SET is_available = ? WHERE id = ?";
    db.query(sql, [is_available ? 1 : 0, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json({ message: "Status updated successfully" });
    });
});

// API for All food update
app.patch('/api/update-all-status', (req, res) => {
    const { restaurant_id, is_available } = req.body;
    const sql = "UPDATE products SET is_available = ? WHERE restaurant_id = ?";
    db.query(sql, [is_available ? 1 : 0, restaurant_id], (err, result) => {
        if (err) return res.is_available(500).json({ error: err.message });
        res.json({ message: "All items updated" });
    });
});

// API for Inventory List
app.get('/api/inventory/:resId', (req, res) => {
    const { resId } = req.params;
    const sql = "SELECT id, name, price FROM products WHERE restaurant_id = ? AND is_available = 1";
    db.query(sql, [resId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// API for Order info
app.post('/api/save-order', async (req, res) => {
    const { customer, items, billing, payment, subscription, restaurant_id } = req.body;
    const conn = await db.promise();

    try {
        // Start Transaction
        await conn.beginTransaction();

        // ১. অর্ডার টেবিল এ ডাটা সেভ
        const [orderResult] = await conn.query(
            `INSERT INTO orders 
            (restaurant_id, customer_name, customer_phone, customer_address, subtotal, discount, total_amount, paid_amount, due_amount, payment_method, order_status, reference) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                restaurant_id, 
                customer.name, 
                customer.mobile, 
                customer.address, 
                billing.subTotal, 
                billing.discount, 
                billing.finalTotal, 
                billing.paidAmount, 
                billing.dueAmount, 
                payment.paymentMethod, // CASH or DIGITAL
                subscription.status,   // Paid or Due
                subscription.reference || null // Due হলে রেফারেন্স নাম
            ]
        );

        const orderId = orderResult.insertId;

        // ২. অর্ডার আইটেম টেবিল এ ডাটা সেভ
        const itemValues = items.map(item => [
            orderId, 
            item.searchId, 
            item.quantity, 
            item.price, 
            item.total
        ]);

        await conn.query(
            `INSERT INTO order_items (order_id, product_id, quantity, price, total_price) VALUES ?`,
            [itemValues]
        );

        await conn.commit();
        res.status(201).json({ message: "Order saved successfully!", orderId });
    } catch (error) {
        await conn.rollback();
        console.error("Order Save Error:", error);
        res.status(500).json({ message: "Failed to save order", error: error.message });
    }
});

app.get('/api/orders/:resId', async (req, res) => {
    const { resId } = req.params;
    try {
        // promise() ব্যবহার করে কুয়েরি করা কারণ আপনি async/await ব্যবহার করছেন
        const [rows] = await db.promise().query(
            "SELECT * FROM orders WHERE restaurant_id = ? ORDER BY id DESC", 
            [resId]
        );
        res.json(rows);
    } catch (err) {
        console.error("Fetch Orders Error:", err);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

// --- স্ট্যাটাস আপডেট এপিআই ---
app.put('/api/orders/status/:id', async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    try {
        await db.promise().query(
            "UPDATE orders SET order_status = ? WHERE id = ?", 
            [status, id]
        );
        res.status(200).send("Status Updated Successfully");
    } catch (err) {
        console.error("Update Status Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- অর্ডার ডিলিট এপিআই ---
app.delete('/api/orders/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const conn = db.promise();
        await conn.query("DELETE FROM order_items WHERE order_id = ?", [id]);
        await conn.query("DELETE FROM orders WHERE id = ?", [id]);
        res.status(200).json({ message: "Order Deleted" });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ error: "Delete failed" });
    }
});

app.get('/api/order-details/:orderId', async (req, res) => {
    try {
        const [items] = await db.promise().query(
            `SELECT oi.*, p.name as product_name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`, 
            [req.params.orderId]
        );
        const [orderInfo] = await db.promise().query(`SELECT * FROM orders WHERE id = ?`, [req.params.orderId]);
        res.json({
            items: items,
            info: orderInfo[0]
        });
    } catch (err) {
       console.error("Order Details Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Server Port setup
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});