import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import multer from 'multer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const app = express();
const saltRounds = 10;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, 'uploads');

// ফোল্ডার না থাকলে তৈরি করবে
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// --- Multer Configuration ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// --- Database Connection ---
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'foodmenubd',
    waitForConnections: true,
    connectionLimit: 10
}).promise();

console.log('Successfully connected to the MySql Database via Pool!');

// --- BASIC ROUTES ---
app.get('/', (req, res) => {
    res.send('Foodmenu backend server is running bruh.....!');
});

// --- RESTAURANT APIS ---
app.get('/api/restaurants', async (req, res) => {
    try {
        const sql = "SELECT * FROM restaurants";
        const [results] = await db.query(sql);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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

        if (files['logo']) {
            const file = files['logo'][0];
            logoFileName = `logo-${Date.now()}.webp`;
            await sharp(file.buffer).resize(400, 400, { fit: 'inside' }).webp({ quality: 80 }).toFile(path.join(uploadDir, logoFileName));
        }

        if (files['idFileFront']) {
            const file = files['idFileFront'][0];
            if (file.mimetype.startsWith('image/')) {
                nidFileName = `nid-${Date.now()}.webp`;
                await sharp(file.buffer).resize(1200).webp({ quality: 75 }).toFile(path.join(uploadDir, nidFileName));
            } else {
                nidFileName = `nid-${Date.now()}${path.extname(file.originalname)}`;
                fs.writeFileSync(path.join(uploadDir, nidFileName), file.buffer);
            }
        } else if (files['idFilePdf']) {
            const file = files['idFilePdf'][0];
            nidFileName = `doc-${Date.now()}.pdf`;
            fs.writeFileSync(path.join(uploadDir, nidFileName), file.buffer);
        }

        const hashedPassword = await bcrypt.hash(owner_password, saltRounds);
        const sql = `INSERT INTO restaurants (owner_name, owner_email, owner_password, restaurant_name, slug, logo, nid_doc, location, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await db.query(sql, [owner_name, owner_email, hashedPassword, restaurant_name, slug, logoFileName, nidFileName, location, 'inactive']);
        res.status(201).json({ message: "Registration Successful!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const sql = "SELECT * FROM restaurants WHERE owner_email = ? OR owner_name = ? OR restaurant_name = ?";
        const [results] = await db.query(sql, [identifier, identifier, identifier]);

        if (results.length > 0) {
            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.owner_password);
            if (isMatch) {
                res.status(200).json({
                    message: "Login Successfully",
                    user: { id: user.id, name: user.owner_name, restaurant: user.restaurant_name, logo: user.logo }
                });
            } else {
                res.status(401).json({ message: "Invalid credentials!" });
            }
        } else {
            res.status(401).json({ message: "User not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- MENU & PRODUCT APIS ---
app.post('/api/add-product', upload.array('images', 10), async (req, res) => {
    try {
        const { restaurant_id, name, price, offer_price, category } = req.body;
        const files = req.files;
        const [productResult] = await db.query(
            `INSERT INTO products (restaurant_id, name, price, offer_price, category) VALUES (?, ?, ?, ?, ?)`,
            [restaurant_id, name, price, offer_price || 0, category]
        );
        const productId = productResult.insertId;

        if (files && files.length > 0) {
            for (const file of files) {
                const fileName = `prod-${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
                await sharp(file.buffer).resize(500, 500, { fit: 'cover' }).webp({ quality: 80 }).toFile(path.join(uploadDir, fileName));
                await db.query(`INSERT INTO product_images (product_id, image_path) VALUES (?, ?)`, [productId, fileName]);
            }
        }
        res.status(201).json({ message: "Product added successfully!", productId });
    } catch (error) {
        res.status(500).json({ message: "Server error occurred!" });
    }
});

app.get('/api/menu-list', async (req, res) => {
    try {
        const { restaurant_id } = req.query;
        const sql = `SELECT p.*, GROUP_CONCAT(pi.image_path) as all_images FROM products p LEFT JOIN product_images pi ON p.id = pi.product_id WHERE p.restaurant_id = ? GROUP BY p.id ORDER BY p.id DESC`;
        const [results] = await db.query(sql, [restaurant_id]);
        const updatedResults = results.map(item => ({
            ...item,
            images: item.all_images ? item.all_images.split(',') : []
        }));
        res.json(updatedResults);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/update-product/:id', async (req, res) => {
    try {
        const { name, price, category } = req.body;
        await db.query("UPDATE products SET name = ?, price = ?, category = ? WHERE id = ?", [name, price, category, req.params.id]);
        res.status(200).json({ message: "Product updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/delete-product/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM product_images WHERE product_id = ?", [id]);
        const [result] = await db.query("DELETE FROM products WHERE id = ?", [id]);
        res.status(result.affectedRows > 0 ? 200 : 404).json({ message: result.affectedRows > 0 ? "Deleted" : "Not Found" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CATEGORY APIS ---
app.post('/api/add-category', async (req, res) => {
    try {
        const { name, restaurant_id } = req.body;
        await db.query("INSERT INTO categories (name, restaurant_id) VALUES (?, ?)", [name, restaurant_id]);
        res.status(201).json({ message: "Category added successfully!" });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "Category already exists!" });
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/get-categories', async (req, res) => {
    try {
        const [results] = await db.query("SELECT id, name FROM categories WHERE restaurant_id = ? ORDER BY name ASC", [req.query.restaurant_id]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/update-category/:id', async (req, res) => {
    try {
        await db.query("UPDATE categories SET name = ? WHERE id = ?", [req.body.name, req.params.id]);
        res.send("Updated");
    } catch (err) { res.status(500).send(err); }
});

app.delete('/api/delete-category/:id', async (req, res) => {
    try {
        await db.query("DELETE FROM categories WHERE id = ?", [req.params.id]);
        res.send("Deleted");
    } catch (err) { res.status(500).send(err); }
});

// --- STATUS UPDATES ---
app.put('/api/update-store-status/:resId', async (req, res) => {
    try {
        await db.query("UPDATE restaurants SET status = ? WHERE id = ?", [req.body.status, req.params.resId]);
        res.json({ message: "Status updated" });
    } catch (err) { res.status(500).json(err); }
});

app.patch('/api/update-food-status/:id', async (req, res) => {
    try {
        await db.query("UPDATE products SET is_available = ? WHERE id = ?", [req.body.is_available ? 1 : 0, req.params.id]);
        res.json({ message: "Status updated" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/update-all-status', async (req, res) => {
    try {
        await db.query("UPDATE products SET is_available = ? WHERE restaurant_id = ?", [req.body.is_available ? 1 : 0, req.body.restaurant_id]);
        res.json({ message: "All items updated" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- ORDER APIS ---
app.post('/api/save-order', async (req, res) => {
    try {
        const { customer, items, billing, payment, subscription, restaurant_id } = req.body;
        const [orderResult] = await db.query(
            `INSERT INTO orders (restaurant_id, customer_name, customer_phone, customer_address, subtotal, discount, total_amount, paid_amount, due_amount, payment_method, order_status, reference) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [restaurant_id, customer.name, customer.mobile, customer.address, billing.subTotal, billing.discount, billing.finalTotal, billing.paidAmount, billing.dueAmount, payment.paymentMethod, subscription.status, subscription.reference || null]
        );
        const orderId = orderResult.insertId;
        const itemValues = items.map(item => [orderId, item.searchId, item.quantity, item.price, item.total]);
        await db.query(`INSERT INTO order_items (order_id, product_id, quantity, price, total_price) VALUES ?`, [itemValues]);
        res.status(201).json({ message: "Order saved!", orderId });
    } catch (error) {
        res.status(500).json({ message: "Order failed", error: error.message });
    }
});

app.get('/api/orders/:resId', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM orders WHERE restaurant_id = ? ORDER BY id DESC", [req.params.resId]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: "Failed to fetch orders" }); }
});

app.put('/api/orders/status/:id', async (req, res) => {
    try {
        await db.query("UPDATE orders SET order_status = ? WHERE id = ?", [req.body.status, req.params.id]);
        res.status(200).send("Status Updated");
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/orders/:id', async (req, res) => {
    try {
        await db.query("DELETE FROM order_items WHERE order_id = ?", [req.params.id]);
        await db.query("DELETE FROM orders WHERE id = ?", [req.params.id]);
        res.status(200).json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/order-details/:orderId', async (req, res) => {
    try {
        const [items] = await db.query(`SELECT oi.*, p.name as product_name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`, [req.params.orderId]);
        const [orderInfo] = await db.query(`SELECT * FROM orders WHERE id = ?`, [req.params.orderId]);
        res.json({ items, info: orderInfo[0] });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- CART & DELIVERY APIS ---
app.get('/api/cart-details', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM cart_orders ORDER BY id DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/cart-delete/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM cart_orders WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- DELIVERY AREA APIS (FIXED) ---
app.get('/api/delivery-areas/:resId', async (req, res) => {
    try {
        const { resId } = req.params;
        if (!resId || resId === 'undefined') return res.status(400).json({ message: "Invalid ID" });
        const [rows] = await db.query("SELECT * FROM delivery_areas WHERE restaurant_id = ? ORDER BY id DESC", [resId]);
        res.status(200).json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/delivery-areas', async (req, res) => {
    try {
        const { restaurant_id, areaName, deliveryCharge } = req.body;
        await db.query("INSERT INTO delivery_areas (restaurant_id, areaName, deliveryCharge) VALUES (?, ?, ?)", [restaurant_id, areaName, deliveryCharge]);
        res.status(201).json({ success: true, message: "Data Saved!" });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.put('/api/delivery-areas/:id', async (req, res) => {
    try {
        await db.query("UPDATE delivery_areas SET areaName = ?, deliveryCharge = ? WHERE id = ?", [req.body.areaName, req.body.deliveryCharge, req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/delivery-areas/:id', async (req, res) => {
    try {
        await db.query("DELETE FROM delivery_areas WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- DASHBOARD STATS ---
app.get('/api/restaurant-stats/:resId', async (req, res) => {
    try {
        const { resId } = req.params;
        const [resInfo] = await db.query("SELECT restaurant_name, status FROM restaurants WHERE id = ?", [resId]);
        const [menuCount] = await db.query("SELECT COUNT(*) as total FROM products WHERE restaurant_id = ?", [resId]);
        const [orders] = await db.query("SELECT COUNT(*) as active FROM orders WHERE restaurant_id = ? AND order_status = 'pending'", [resId]);
        const [earnings] = await db.query("SELECT SUM(total_amount) as todayTotal FROM orders WHERE restaurant_id = ? AND DATE(created_at) = CURDATE()", [resId]);
        const [weeklySales] = await db.query(`SELECT DAYNAME(created_at) as day, SUM(total_amount) as total FROM orders WHERE restaurant_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY DAYNAME(created_at)`, [resId]);
        const [latestOrders] = await db.query("SELECT id, total_amount, order_status FROM orders WHERE restaurant_id = ? ORDER BY id DESC LIMIT 3", [resId]);

        res.json({
            name: resInfo[0]?.restaurant_name || "Restaurant",
            status: resInfo[0]?.status || "inactive",
            totalMenu: menuCount[0]?.total || 0,
            activeOrders: orders[0]?.active || 0,
            todayEarning: earnings[0]?.todayTotal || 0,
            avgRating: 4.8,
            weeklySales: weeklySales.length > 0 ? weeklySales : [],
            incomingOrders: latestOrders
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/api/inventory/:resId', async (req, res) => {
    try {
        const [results] = await db.query("SELECT id, name, price FROM products WHERE restaurant_id = ? AND is_available = 1", [req.params.resId]);
        res.json(results);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Manage Shop ---
//Api for brunch add 
app.post('/api/shops', upload.fields([{ name: 'logo' }, { name: 'bgImage' }]), (req, res) => {
  const { owner_name, owner_email, restaurant_name, location, social_link, contact_mobile } = req.body;
  const logo = req.files['logo'] ? req.files['logo'][0].filename : null;
  const bg_image = req.files['bgImage'] ? req.files['bgImage'][0].filename : null;
  const slug = restaurant_name.toLowerCase().replace(/ /g, '-') + '-' + Date.now();

  const query = "INSERT INTO restaurants (owner_name, owner_email, restaurant_name, contact_mobile, slug, logo, bg_image, location, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')";
  
  db.query(query, [owner_name, owner_email, restaurant_name, contact_mobile, slug, logo, bg_image, location], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(200).json({ message: "Branch added!" });
  });
});

//  API  for update logo
app.put('/api/shops/:id', upload.fields([{ name: 'logo' }, { name: 'bgImage' }]), async (req, res) => {
    const shopId = req.params.id;
    const { restaurant_name, location, social_link, contact_mobile } = req.body;

    try {
        // ১. আগে ডাটাবেস থেকে পুরানো ফাইলের নাম জেনে নিন
        const [oldData] = await db.query("SELECT logo, bg_image FROM restaurants WHERE id = ?", [shopId]);
        
        let newLogo = oldData[0].logo;
        let newBg = oldData[0].bg_image;

        // ২. যদি নতুন লোগো আপলোড হয়, পুরানোটা লোকাল সার্ভার থেকে ডিলিট করুন
        if (req.files['logo']) {
            if (oldData[0].logo) {
                const oldLogoPath = path.join(__dirname, 'uploads', oldData[0].logo);
                if (fs.existsSync(oldLogoPath)) fs.unlinkSync(oldLogoPath); // ডিলিট লজিক
            }
            newLogo = req.files['logo'][0].filename;
        }

        // ৩. যদি নতুন ব্যাকগ্রাউন্ড আপলোড হয়, পুরানোটা ডিলিট করুন
        if (req.files['bgImage']) {
            if (oldData[0].bg_image) {
                const oldBgPath = path.join(__dirname, 'uploads', oldData[0].bg_image);
                if (fs.existsSync(oldBgPath)) fs.unlinkSync(oldBgPath); // ডিলিট লজিক
            }
            newBg = req.files['bgImage'][0].filename;
        }

        // ৪. ডাটাবেস আপডেট
        const sql = "UPDATE restaurants SET restaurant_name=?, location=?, social_link=?, contact_mobile=?, logo=?, bg_image=? WHERE id=?";
        await db.query(sql, [restaurant_name, location, social_link, contact_mobile, newLogo, newBg, shopId]);

        res.json({ message: "Updated successfully and old files removed!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//API for reports (graph+table)
app.get('/api/reports', async (req, res) => {
    const { resId, from, to } = req.query; 

    if (!resId || resId === 'null') {
        return res.status(400).json({ error: "Restaurant ID is missing!" });
    }

    try {
        let sql = "SELECT * FROM orders WHERE restaurant_id = ?";
        let params = [resId];

        // আপনার SQL এ তারিখের কলামের নাম 'created_at'
        if (from && to && from !== "" && to !== "") {
            sql += " AND DATE(created_at) BETWEEN ? AND ?";
            params.push(from, to);
        }

        sql += " ORDER BY id DESC";

        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

app.get('/api/reports/graph', async (req, res) => {
    const { resId } = req.query;

    if (!resId) {
        return res.status(400).json({ error: "Restaurant ID is missing!" });
    }

    try {
        // গত ৬ মাসের ডাটা মাসের নাম অনুযায়ী গ্রুপিং করার কুয়েরি
        const sql = `
            SELECT 
                MONTHNAME(created_at) as name, 
                SUM(total_amount) as earning, 
                SUM(due_amount) as due, 
                SUM(id) as qty 
            FROM orders 
            WHERE restaurant_id = ? 
            AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY MONTH(created_at), name
            ORDER BY MONTH(created_at) ASC
        `;
        
        // নোট: 'qty' এর জন্য আপনার টেবিলে আলাদা কলাম থাকলে সেটি SUM করবেন, 
        // আমি আপাতত অর্ডারের সংখ্যা বা আইডি কাউন্ট হিসেবে দেখাচ্ছি।

        const [rows] = await db.query(sql, [resId]);
        res.json(rows);
    } catch (error) {
        console.error("Graph Error:", error);
        res.status(500).json({ error: error.message });
    }
});

//Api for edit restaurant
app.get('/api/restaurant/:id', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM restaurants WHERE id = ?", [req.params.id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: "Restaurant not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- চুড়ান্ত ফিক্সড আপডেট এপিআই (সব কলাম এবং ফাইল সিঙ্ক করা) ---

app.put('/api/restaurant/update-all/:id', upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
]), async (req, res) => {
    const { id } = req.params;
    const { restaurant_name, location, contact_mobile, slug } = req.body;
    
    // নতুন ইমেজ থাকলে সেটি নিন, না থাকলে পুরানোটাই রাখুন
    let logoFile = req.files['logo'] ? req.files['logo'][0].filename : null;
    let coverFile = req.files['cover'] ? req.files['cover'][0].filename : null;

    try {
        // SQL query তে bg_image এবং logo আপডেট করুন
        let sql = "UPDATE restaurants SET restaurant_name=?, location=?, contact_mobile=?, slug=?";
        let params = [restaurant_name, location, contact_mobile, slug];

        if (logoFile) { sql += ", logo=?"; params.push(logoFile); }
        if (coverFile) { sql += ", bg_image=?"; params.push(coverFile); }

        sql += " WHERE id=?";
        params.push(id);

        await db.query(sql, params);
        res.json({ success: true, message: "Updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database update failed" });
    }
});

app.get('/setup-offer-data/:restaurant_id', async (req, res) => {
    const { restaurant_id } = req.params;
    try {
        const [products] = await db.query(
            "SELECT id, name, price FROM products WHERE restaurant_id = ?", 
            [restaurant_id]
        );
        const [areas] = await db.query(
            "SELECT id, areaName FROM delivery_areas WHERE restaurant_id = ?", 
            [restaurant_id]
        );
        res.json({ products, areas });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ২. অফার লঞ্চ করা এবং প্রোডাক্ট টেবিলের দাম আপডেট করা
app.post('/launch-offer', upload.single('offerImage'), async (req, res) => {
    const { 
        offerTitle, productId, itemName, originalPrice, 
        offerPrice, endDate, selectedAreas, quantityType, totalQuantity 
    } = req.body;
    
    const offerImage = req.file ? req.file.filename : null;
    const startDate = new Date().toISOString().split('T')[0]; // আজকের তারিখ

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // ক. অফার টেবিলে ডাটা ইনসার্ট
        await connection.query(
            `INSERT INTO offers (offerTitle, itemName, originalPrice, offerPrice, startDate, endDate, selectedAreas, quantityType, totalQuantity, offerImage, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
            [offerTitle, itemName, originalPrice, offerPrice, startDate, endDate, selectedAreas, quantityType, totalQuantity, offerImage]
        );

        // খ. প্রোডাক্ট টেবিলে সরাসরি অফার প্রাইস আপডেট (Sync)
        await connection.query(
            "UPDATE products SET offer_price = ? WHERE id = ?",
            [offerPrice, productId]
        );

        await connection.commit();
        res.json({ success: true, message: "Offer launched and product updated!" });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});