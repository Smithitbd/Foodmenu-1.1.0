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
import nodemailer from'nodemailer';

const app = express();
const saltRounds = 10;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, 'uploads');
const adminUploadDir = path.join(__dirname, 'uploads', 'AdminProfile');
app.use(cors()); 
app.use(express.json());

//path.join() ==> path.resolve()

// ফোল্ডার না থাকলে তৈরি করবে
/*if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}*/

[uploadDir, adminUploadDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const restaurantUploadDir = path.join(__dirname, 'uploads', 'Restaurants');
if (!fs.existsSync(restaurantUploadDir)) fs.mkdirSync(restaurantUploadDir, { recursive: true });

const areaUploadDir = path.join(__dirname, 'uploads', 'Area');
if (!fs.existsSync(areaUploadDir)) fs.mkdirSync(areaUploadDir, { recursive: true });

const topResUploadDir = path.join(__dirname, 'uploads', 'TopRestrurant');
if (!fs.existsSync(topResUploadDir)) fs.mkdirSync(topResUploadDir, { recursive: true });

const offersUploadDir = path.join(__dirname, 'uploads', 'offers');
if (!fs.existsSync(offersUploadDir)) fs.mkdirSync(offersUploadDir, { recursive: true });


const storage = multer.memoryStorage(); 

const upload = multer({ 
  storage: storage
});
const uploadAdmin = multer({ storage: storage, limits: { fileSize: 1 * 1024 * 1024 } });
const uploadOffer = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Database Connection ---
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'jubo',
    waitForConnections: true,
    connectionLimit: 10
}).promise();

console.log('Successfully connected to the MySql Database via Pool!');

// Nodemailer সেটআপ (ইমেইল পাঠানোর জন্য)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mkantidas138@gmail.com', 
        pass: 'tmym zwgc lhom udnn'    // Generate app password from google
    }
});

// --- BASIC ROUTES ---
app.get('/', (req, res) => {
    res.send('Foodmenu backend server is running bruh.....!');
});

// Area List
app.get('/api/areas', async (req, res) => {
    try {
        const [results] = await db.query("SELECT id, name FROM area ORDER BY name ASC");
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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
        const { owner_name, owner_email, owner_password, restaurant_name, restaurant_category, slug, location, area_id } = req.body;
        
        const files = req.files || {};
        let logoFileName = null;
        let nidFileName = null;

        // --- ১. লোগো প্রসেসিং (Sharp ফিক্স) ---
        if (files['logo']) {
            const file = files['logo'][0];
            logoFileName = `logo-${Date.now()}.webp`;
            
            // কারণ memoryStorage এ ফাইল হার্ডড্রাইভে থাকে না, র‍্যামে (buffer) থাকে।
            await sharp(file.buffer) 
                .resize(400, 400, { fit: 'inside' })
                .webp({ quality: 80 })
                .toFile(path.join(uploadDir, logoFileName));
        }

        // --- ২. এনআইডি বা পিডিএফ প্রসেসিং (Buffer ফিক্স) ---
        if (files['idFileFront']) {
            const file = files['idFileFront'][0];
            nidFileName = `nid-${Date.now()}${path.extname(file.originalname)}`;
            // memoryStorage এ file.buffer ব্যবহার করে ফাইল সেভ করতে হয়
            fs.writeFileSync(path.join(uploadDir, nidFileName), file.buffer);
        } else if (files['idFilePdf']) {
            const file = files['idFilePdf'][0];
            nidFileName = `doc-${Date.now()}${path.extname(file.originalname)}`;
            fs.writeFileSync(path.join(uploadDir, nidFileName), file.buffer);
        }

        // ৩. পাসওয়ার্ড হ্যাশিং
        //const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(owner_password, saltRounds);

        // ৪. ডাটাবেস কুয়েরি
        const sql = `INSERT INTO restaurants (owner_name, owner_email, owner_password, restaurant_name, restaurant_category, slug, logo, nid_doc, location, area_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        await db.query(sql, [
            owner_name, owner_email, hashedPassword, restaurant_name, restaurant_category || 'Others', slug, logoFileName, nidFileName, location,area_id, 'inactive'
        ]);
        
        res.status(201).json({ message: "Registration Successful!" });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;

        // ১. প্রথমে Restaurants টেবিলে চেক করুন (Owner Login)
        const ownerSql = "SELECT *, 'owner' as roleType FROM restaurants WHERE owner_email = ? OR owner_name = ? OR restaurant_name = ?";
        const [ownerResults] = await db.query(ownerSql, [identifier, identifier, identifier]);

        if (ownerResults.length > 0) {
            const user = ownerResults[0];

            // স্ট্যাটাস চেক (Block/Active)
            if (user.status === 'blocked') {
                return res.status(403).json({ message: "Your account is blocked by Admin!" });
            }

            const isMatch = await bcrypt.compare(password, user.owner_password);
            if (isMatch) {
                return res.status(200).json({
                    message: "Login Successfully",
                    user: { 
                        id: user.id, 
                        name: user.owner_name, 
                        restaurant: user.restaurant_name, 
                        logo: user.logo,
                        role: 'Owner' // রোল সেট করে দেওয়া
                    }
                });
            }
        }

        // ২. যদি রেস্টুরেন্ট টেবিলে না পায়, তবে Users টেবিলে চেক করুন (Staff Login)
        const staffSql = `SELECT u.*, r.restaurant_name, r.logo, r.status as res_status FROM users u 
                          JOIN restaurants r ON u.restaurant_id = r.id 
                          WHERE u.email = ? OR u.name = ?`;
        const [staffResults] = await db.query(staffSql, [identifier, identifier]);

        if (staffResults.length > 0) {
            const staff = staffResults[0];

            // চেক করুন রেস্টুরেন্ট বা স্টাফ কেউ ব্লকড কি না
            if (staff.status === 'blocked') {
                return res.status(403).json({ message: "This restaurant staff is currently suspended!" });
            }

            // যদি আপনার স্টাফ পাসওয়ার্ড হ্যাশ করা থাকে তবে bcrypt ব্যবহার করুন, নতুবা সরাসরি:
            const isMatch = await bcrypt.compare(password, staff.password);
            //const isMatch = (password === staff.password); // আপনার আগের কোড অনুযায়ী

            if (isMatch) {
                return res.status(200).json({
                    message: "Staff Login Successfully",
                    user: { 
                        id: staff.restaurant_id, // স্টাফের জন্য মেইন আইডি হবে রেস্টুরেন্ট আইডি
                        staffId: staff.id,
                        name: staff.name, 
                        restaurant: staff.restaurant_name, 
                        logo: staff.logo,
                        role: staff.role // Manager, Waiter ইত্যাদি
                    }
                });
            }
        }

        // ৩. কোথাও না পাওয়া গেলে
        res.status(401).json({ message: "Invalid credentials or User not found" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/api/all-restaurants-list', async (req, res) => {
    try {
        // SQL JOIN ব্যবহার করা হয়েছে যাতে area টেবিল থেকে নাম আনা যায়
        const sql = `
            SELECT 
                r.id, 
                r.restaurant_name, 
                r.logo, 
                r.slug, 
                r.status, 
                a.name AS area_name 
            FROM restaurants r
            LEFT JOIN area a ON r.area_id = a.id 
            WHERE r.status = 'active'
        `;
        
        const [results] = await db.query(sql);

        const formattedRestaurants = results.map(row => ({
            id: row.id,
            r_name: row.restaurant_name, 
            // যদি area_id না থাকে বা ভুল থাকে, তবে "Unknown Area" দেখাবে
            address: row.area_name || "Unknown Area", 
            pimage: row.logo ? `http://localhost:5000/uploads/${row.logo}` : 'https://via.placeholder.com/300', 
            slug: row.slug,
            ratings: "4.8" 
        }));

        res.json({ restaurants: formattedRestaurants });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/api/area-restaurants', async (req, res) => {
    try {
        const { area, type } = req.query;

        if (!area) {
            return res.status(400).json({ error: "Area parameter is required" });
        }
        let sql = `
            SELECT id, restaurant_name, location, logo, slug, foodcourt, status 
            FROM restaurants 
            WHERE location = ? AND status = 'active'
        `;
        let params = [area];

        if (type && type !== 'all') {
            sql += " AND foodcourt = ?";
            params.push(type);
        }

        const [results] = await db.query(sql, params);

        const formattedRestaurants = results.map(row => ({
            id: row.id,
            r_name: row.restaurant_name, 
            address: row.location,      
            pimage: row.logo ? `http://localhost:5000/uploads/${row.logo}` : 'https://via.placeholder.com/300', 
            slug: row.slug,
            foodcourt: row.foodcourt, 
            ratings: (Math.random() * (5 - 4.2) + 4.2).toFixed(1), 
            featured: Math.random() > 0.7 ? 1 : 0 
        }));

        res.json({ restaurants: formattedRestaurants });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// --- MENU & PRODUCT APIS ---
app.post('/api/add-product', upload.array('images', 10), async (req, res) => {
    let productId = null;
    try {
        const { restaurant_id, name, price, offer_price, category, estimated_time, quantity } = req.body;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No images uploaded" });
        }

        // ডাটাবেসে প্রোডাক্ট সেভ
        const [productResult] = await db.query(
            `INSERT INTO products (restaurant_id, name, price, offer_price, category, estimated_time, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [restaurant_id, name, price, offer_price || 0, category, estimated_time || 20, quantity || 'Full']
        );
        productId = productResult.insertId;

        // ইমেজ প্রসেসিং লুপ
        for (const file of files) {
            const fileName = `prod-${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
            const uploadPath = path.join(process.cwd(), 'uploads', fileName);

            // এখানে diskStorage না থাকায় file.buffer এখন কাজ করবে
            await sharp(file.buffer) 
                .resize(600, 600, { fit: 'cover' })
                .webp({ quality: 80 })
                .toFile(uploadPath); // সরাসরি ফাইল সেভ হচ্ছে এখানে
            
            await db.query(`INSERT INTO product_images (product_id, image_path) VALUES (?, ?)`, [productId, fileName]);
        }

        res.status(201).json({ success: true, message: "Product added successfully!" });

    } catch (error) {
        console.error("Sharp Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/menu-list', async (req, res) => {
    try {
        const { restaurant_id } = req.query;
        const sql = `SELECT 
                p.*, 
                GROUP_CONCAT(pi.image_path) as all_images,
                o.offerTitle,
                o.offerPrice as promo_price,
                o.endDate as offer_end,
                o.status as offer_status,
                
                IF(o.id IS NOT NULL AND CURDATE() <= o.endDate AND o.status = 'active', 1, 0) AS has_offer,
                
                IF(o.id IS NOT NULL AND CURDATE() <= o.endDate AND o.status = 'active', o.offerTitle, p.name) AS display_name,
                
                IF(o.id IS NOT NULL AND CURDATE() <= o.endDate AND o.status = 'active', o.offerPrice, p.price) AS display_price
            FROM products p 
            LEFT JOIN product_images pi ON p.id = pi.product_id 
            LEFT JOIN offers o ON p.id = o.productId
            WHERE p.restaurant_id = ? 
            GROUP BY p.id 
            ORDER BY p.id DESC`;

        const [results] = await db.query(sql, [restaurant_id]);
        const updatedResults = results.map(item => ({
            ...item,
            images: item.all_images ? item.all_images.split(',') : [],
            final_name: item.display_name,
            final_price: item.display_price
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
        const { status } = req.body; 
        const isOnline = (status === 'active') ? 1 : 0;
        
        // ডাটাবেস আপডেট
        const [result] = await db.query(
            "UPDATE restaurants SET is_online = ? WHERE id = ?", 
            [isOnline, req.params.resId]
        );
        
        res.json({ success: true, message: "Status updated successfully" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
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
        const { customer, items, billing, payment, subscription, restaurant_id, order_type } = req.body;
        
        // table_id এবং order_type সহ ইনসার্ট কুয়েরি
        const [orderResult] = await db.query(
            `INSERT INTO orders (
                restaurant_id, 
                customer_name, 
                customer_phone, 
                customer_address, 
                subtotal, 
                discount, 
                total_amount, 
                paid_amount, 
                due_amount, 
                payment_method, 
                order_status, 
                reference, 
                order_type, 
                table_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
                payment.paymentMethod, 
                subscription.status, 
                subscription.reference || null, 
                order_type || 'Offline', // ফ্রন্টএন্ড থেকে অফলাইন পাঠানো হয়েছে
                customer.table_id || null // সিলেক্ট করা টেবিল আইডি
            ]
        );

        const orderId = orderResult.insertId;
        const itemValues = items.map(item => [orderId, item.searchId, item.quantity, item.price, item.total]);
        
        await db.query(`INSERT INTO order_items (order_id, product_id, quantity, price, total_price) VALUES ?`, [itemValues]);
        
        res.status(201).json({ message: "Order saved!", orderId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Order failed", error: error.message });
    }
});

app.get('/api/orders/:resId', async (req, res) => {
    try {
        // এখানে orders টেবিলের সব কলাম (id, table_id, order_type সহ) আসছে
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

app.get("/order-statused", async (req, res) => {
    const id = parseInt(req.query.id);
    if (!id || isNaN(id)) {
        return res.status(400).json({ error: "Valid Order ID is required" });
    }

    try {
        const sql = `
            SELECT 
                o.id, o.order_status, o.customer_name, o.customer_phone, 
                o.customer_address, o.total_amount, o.order_type,
                r.restaurant_name AS restaurant_name, r.logo AS restaurant_logo
            FROM orders o
            LEFT JOIN restaurants r ON r.id = o.restaurant_id
            WHERE o.id = ? LIMIT 1`;

        const [rows] = await db.query(sql, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.json({
            id: rows[0].id,
            order_status: rows[0].order_status,
            customer_name: rows[0].customer_name,
            customer_phone: rows[0].customer_phone,
            customer_address: rows[0].customer_address,
            total_amount: rows[0].total_amount,
            restaurant_name: rows[0].restaurant_name,
            restaurant_logo: rows[0].restaurant_logo
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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

app.put('/api/orders/full-update/:id', async (req, res) => {
    const { order_status, due_amount, reference, payment_date } = req.body;
    try {
        await db.query(
            "UPDATE orders SET order_status = ?, due_amount = ?, reference = ?, payment_date = ? WHERE id = ?", 
            [order_status, due_amount, reference, payment_date, req.params.id]
        );
        res.status(200).send("Order & Payment Updated Successfully");
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
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

app.get('/api/restaurant-locations', async (req, res) => {
    try {
        //only active restaurant location
        const sql = "SELECT DISTINCT location FROM restaurants WHERE status = 'active' AND location IS NOT NULL";
        const [results] = await db.query(sql);
        

        const locations = results.map(row => row.location);
        

        res.json(["All", ...locations]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- DASHBOARD STATS ---
//Helper Function
const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

const checkOfficialTime = (openingTime, closingTime) => {
    const now = new Date();
    const bstTime = now.toLocaleTimeString('en-GB', { 
        timeZone: 'Asia/Dhaka', hour12: false, hour: '2-digit', minute: '2-digit' 
    });
    const current = timeToMinutes(bstTime);
    const open = timeToMinutes(openingTime);
    let close = timeToMinutes(closingTime);

    if (close === 0) close = 1440; // 00.00 am

    if (close < open) { 
        return current >= open || current <= close;
    }
    return current >= open && current <= close;
};

app.get('/api/dashboard-stats/:resId', async (req, res) => {
    try {
        const { resId } = req.params;
        const [resRows] = await db.query(
            "SELECT id, restaurant_name, is_online, opening_time, closing_time FROM restaurants WHERE id = ?", 
            [resId]
        );
        
        if (resRows.length === 0) return res.status(404).json({ error: "Not found" });
        let restaurant = resRows[0];

        // Logic for open and close
        const now = new Date();
        const bstTime = now.toLocaleTimeString('en-GB', { 
            timeZone: 'Asia/Dhaka', hour12: false, hour: '2-digit', minute: '2-digit' 
        });

        const dbOpeningTime = restaurant.opening_time.substring(0, 5); 
        const dbClosingTime = restaurant.closing_time.substring(0, 5); 
        // Automatic open
        if (bstTime === dbOpeningTime && restaurant.is_online === 0) {
            await db.query("UPDATE restaurants SET is_online = 1 WHERE id = ?", [resId]);
            restaurant.is_online = 1;
        }

        // Automatic closing
        if (bstTime === dbClosingTime && restaurant.is_online === 1) {
            await db.query("UPDATE restaurants SET is_online = 0 WHERE id = ?", [resId]);
            restaurant.is_online = 0;
        }

        const [menuCount] = await db.query("SELECT COUNT(*) as total FROM products WHERE restaurant_id = ?", [resId]);
        const [orders] = await db.query("SELECT COUNT(*) as active FROM orders WHERE restaurant_id = ? AND order_status = 'pending'", [resId]);
       const [earnings] = await db.query(
        "SELECT SUM(total_amount) as todayTotal FROM orders WHERE restaurant_id = ? AND DATE(created_at) = CURDATE() AND order_status != 'cancelled'", 
        [resId]
    );
    const [weeklySalesRows] = await db.query(
        `SELECT 
        DATE_FORMAT(created_at, '%a') as day, 
        SUM(total_amount) as total 
            FROM orders 
            WHERE restaurant_id = ? 
            AND order_status != 'cancelled' 
            AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) 
            GROUP BY DATE(created_at), day 
            ORDER BY DATE(created_at) ASC
        `, [resId]);

    const [latestOrders] = await db.query("SELECT id, total_amount, order_status FROM orders WHERE restaurant_id = ? ORDER BY id DESC LIMIT 3", [resId]);

        res.json({
            name: restaurant.restaurant_name,status: restaurant.is_online === 1 ? 'active' : 'inactive',is_manual_online: restaurant.is_online, opening_time: restaurant.opening_time,closing_time: restaurant.closing_time,totalMenu: menuCount[0]?.total || 0,activeOrders: orders[0]?.active || 0,todayEarning: earnings[0]?.todayTotal || 0,avgRating: 4.8,weeklySales: weeklySalesRows,incomingOrders: latestOrders.map(o => ({ id: o.id, total_price: o.total_amount }))
        });
    } catch (err) {
        res.status(500).json({ error: "Internal Error" });
    }
});

//---Auto off---
app.get('/api/inventory/:resId', async (req, res) => {
    try {
        const sql = `
            SELECT 
                p.id, 
                IF(o.id IS NOT NULL AND CURDATE() <= o.endDate AND o.status = 'active', o.offerTitle, p.name) AS name,
                IF(o.id IS NOT NULL AND CURDATE() <= o.endDate AND o.status = 'active', o.offerPrice, p.price) AS price
            FROM products p
            LEFT JOIN offers o ON p.id = o.productId
            WHERE p.restaurant_id = ? AND p.is_available = 1`;
            
        const [results] = await db.query(sql, [req.params.resId]);
        res.json(results);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// --- Manage Shop ---
app.put('/api/restaurant/update-all/:id', upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
]), async (req, res) => {
    const { id } = req.params;
    const { restaurant_name, location, contact_mobile, slug, opening_time, closing_time } = req.body;
    const files = req.files;

    try {
        // ১. আগে ডাটাবেস থেকে বর্তমান ফাইলের নামগুলো জানুন
        const [rows] = await db.query("SELECT logo, bg_image FROM restaurants WHERE id = ?", [id]);
        if (rows.length === 0) return res.status(404).json({ error: "Restaurant not found" });

        let currentLogo = rows[0].logo;
        let currentCover = rows[0].bg_image;

        // ২. নতুন লোগো থাকলে প্রসেস করুন এবং পুরানোটা ডিলিট করুন
        if (files['logo']) {
            const logoFile = files['logo'][0];
            const newLogoName = `logo-${Date.now()}.webp`;
            
            await sharp(logoFile.buffer)
                .resize(400, 400, { fit: 'inside' })
                .webp({ quality: 80 })
                .toFile(path.join(__dirname, 'uploads', newLogoName));

            if (currentLogo) {
                const oldPath = path.join(__dirname, 'uploads', currentLogo);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            currentLogo = newLogoName;
        }

        // ৩. নতুন কভার থাকলে প্রসেস করুন এবং পুরানোটা ডিলিট করুন
        if (files['cover']) {
            const coverFile = files['cover'][0];
            const newCoverName = `cover-${Date.now()}.webp`;
            
            await sharp(coverFile.buffer)
                .resize(1200, 600, { fit: 'cover' })
                .webp({ quality: 80 })
                .toFile(path.join(__dirname, 'uploads', newCoverName));

            if (currentCover) {
                const oldPath = path.join(__dirname, 'uploads', currentCover);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            currentCover = newCoverName;
        }

        // ৪. ডাটাবেস আপডেট
        const sql = "UPDATE restaurants SET restaurant_name=?, location=?, contact_mobile=?, slug=?, logo=?, bg_image=?, opening_time=?, closing_time=? WHERE id=?";
        await db.query(sql, [
            restaurant_name, 
            location, 
            contact_mobile, 
            slug, 
            currentLogo, 
            currentCover, 
            opening_time, 
            closing_time, 
            id
        ]);

        res.json({ success: true, message: "Store updated successfully!" });

    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
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
        // এখানে WHERE ক্লজে 'order_status != cancelled' যোগ করা হয়েছে
        const sql = `
            SELECT 
                MONTHNAME(created_at) as name, 
                SUM(total_amount) as earning, 
                SUM(due_amount) as due, 
                COUNT(id) as qty 
            FROM orders 
            WHERE restaurant_id = ? 
            AND order_status != 'cancelled' 
            AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY MONTH(created_at), name
            ORDER BY MONTH(created_at) ASC
        `;
        
        // আমি SUM(id) এর বদলে COUNT(id) দিয়েছি কারণ এটি অর্ডারের সঠিক সংখ্যা দিবে

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

app.get('/api/setup-offer-data/:restaurant_id', async (req, res) => {
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

// Offer launch and Product price update
app.post('/api/launch-offer', upload.single('offerImage'), async (req, res) => {
    const { 
        offerTitle, productId, itemName, originalPrice, 
        offerPrice, endDate, selectedAreas, quantityType, totalQuantity 
    } = req.body;
    
    const offerImage = req.file ? req.file.filename : null;
    const startDate = new Date().toISOString().split('T')[0]; 

    // সার্ভার সাইড চেক: আজকের তারিখ কি শেষ তারিখের চেয়ে বড়?
    const isExpired = new Date(endDate) < new Date(startDate);
    const initialStatus = isExpired ? 'inactive' : 'active';

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // ১. অফার টেবিলে ডেটা ইনসার্ট
        await connection.query(
            `INSERT INTO offers (productId, offerTitle, itemName, originalPrice, offerPrice, startDate, endDate, selectedAreas, quantityType, totalQuantity, offerImage, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [productId, offerTitle, itemName, originalPrice, offerPrice, startDate, endDate, selectedAreas, quantityType, totalQuantity, offerImage, initialStatus]
        );

        // ২. প্রোডাক্ট টেবিলে আপডেট (শুধুমাত্র যদি অফারটি এক্টিভ থাকে)
        if (initialStatus === 'active') {
            await connection.query(
                "UPDATE products SET offer_price = ? WHERE id = ?",
                [offerPrice, productId]
            );
        }

        await connection.commit();
        res.json({ 
            success: true, 
            message: initialStatus === 'active' ? "Offer launched successfully!" : "Offer added but it is already expired (Inactive)." 
        });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ error: "Failed to launch offer" });
    } finally {
        connection.release();
    }
});

// ১. রেস্টুরেন্ট অনুযায়ী সব অফার দেখা
app.get('/api/offers/:resId', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM offers WHERE productId IN (SELECT id FROM products WHERE restaurant_id = ?) ORDER BY id DESC", [req.params.resId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ২. অফার স্ট্যাটাস আপডেট (Pause/Active)
app.put('/api/toggle-offer/:id', async (req, res) => {
    const { status, productId, offerPrice, originalPrice } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        // অফার টেবিল আপডেট
        await connection.query("UPDATE offers SET status = ? WHERE id = ?", [status, req.params.id]);
        
        // যদি অফার একটিভ হয় তবে প্রোডাক্টের প্রাইস অফার প্রাইস হবে, আর ইনএক্টিভ হলে অরিজিনাল প্রাইস হবে
        const newPrice = (status === 'active') ? offerPrice : null;
        await connection.query("UPDATE products SET offer_price = ? WHERE id = ?", [newPrice, productId]);

        await connection.commit();
        res.json({ success: true });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally { connection.release(); }
});

// ৩. অফার ডিলিট করা
app.delete('/api/delete-offer/:id/:productId', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query("DELETE FROM offers WHERE id = ?", [req.params.id]);
        // ডিলিট করলে প্রোডাক্টের অফার প্রাইস তুলে দিতে হবে
        await connection.query("UPDATE products SET offer_price = NULL WHERE id = ?", [req.params.productId]);
        await connection.commit();
        res.json({ success: true });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally { connection.release(); }
});

// ৪. অফার আপডেট করার রুট
app.put('/api/update-offer/:id', upload.single('offerImage'), async (req, res) => {
    const { 
        offerTitle, productId, offerPrice, endDate, 
        selectedAreas, quantityType, totalQuantity, status 
    } = req.body;
    
    const offerId = req.params.id;
    let updateQuery = `UPDATE offers SET offerTitle=?, offerPrice=?, endDate=?, selectedAreas=?, quantityType=?, totalQuantity=?`;
    let queryParams = [offerTitle, offerPrice, endDate, selectedAreas, quantityType, totalQuantity];

    // যদি নতুন ইমেজ আপলোড করা হয়
    if (req.file) {
        updateQuery += `, offerImage=?`;
        queryParams.push(req.file.filename);
    }

    updateQuery += ` WHERE id=?`;
    queryParams.push(offerId);

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // ১. অফার টেবিল আপডেট
        await connection.query(updateQuery, queryParams);

        // ২. যদি অফারটি একটিভ থাকে, তবে মেইন প্রোডাক্ট টেবিলের দামও আপডেট হবে
        if (status === 'active') {
            await connection.query(
                "UPDATE products SET offer_price = ? WHERE id = ?",
                [offerPrice, productId]
            );
        }

        await connection.commit();
        res.json({ success: true, message: "Offer updated successfully!" });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

//Restaurant Registration API
// All user
app.get('/api/users', async (req, res) => {
    try {
        const [results] = await db.query("SELECT id, name, email, password, role FROM users ORDER BY id DESC");
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// New User
app.post('/api/users', async (req, res) => {
    const { name, email, password, role, restaurant_id, restaurant_name } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO users (name, email, password, role, restaurant_id, restaurant_name, status) 
                     VALUES (?, ?, ?, ?, ?, ?, 'active')`;
        await db.query(sql, [name, email, hashedPassword, role, restaurant_id, restaurant_name]);
        res.status(201).json({ message: "Staff Registered!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ১. নির্দিষ্ট রেস্টুরেন্টের স্টাফদের লিস্ট দেখা
app.get('/api/users/:resId', async (req, res) => {
    try {
        const [results] = await db.query(
            "SELECT id, name, email, role, status, restaurant_name FROM users WHERE restaurant_id = ? ORDER BY id DESC", 
            [req.params.resId]
        );
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ৩. স্ট্যাটাস আপডেট (Active/Block)
app.patch('/api/users/:id/status', async (req, res) => {
    const { status } = req.body; // status: 'active' or 'blocked'
    try {
        await db.query("UPDATE users SET status = ? WHERE id = ?", [status, req.params.id]);
        res.json({ message: `User is now ${status}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//Update user
app.put('/api/users/:id', async (req, res) => {
    const { name, email, password, role } = req.body;
    const { id } = req.params;
    try {
        const sql = "UPDATE users SET name=?, email=?, password=?, role=? WHERE id=?";
        await db.query(sql, [name, email, password, role, id]);
        res.json({ message: "User updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
    try {
        await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
        res.json({ message: "User deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.getRestaurantMenu = async (req, res) => {
    const { slug } = req.query; // রেস্টুরেন্ট স্লাগ রিসিভ করা

    try {
        // ১. রেস্টুরেন্টের তথ্য আনা
        const [restaurantRows] = await db.execute(
            'SELECT restaurant_name as name, location, logo FROM restaurants WHERE slug = ?',
            [slug]
        );

        if (restaurantRows.length === 0) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        const restaurant = restaurantRows[0];

        // ২. প্রোডাক্ট এবং ইমেজ আনা (JOIN ব্যবহার করে)
        const [productRows] = await db.execute(
            `SELECT 
                p.id, 
                p.name, 
                p.price, 
                p.offer_price, 
                p.category, 
                GROUP_CONCAT(pi.image_path) AS all_images
             FROM products p
             LEFT JOIN product_images pi ON p.id = pi.product_id
             WHERE p.restaurant_id = (SELECT id FROM restaurants WHERE slug = ?)
             GROUP BY p.id`,
            [slug]
        );

        // ৩. রেসপন্স পাঠানো
        res.json({
            restaurant: restaurant,
            products: productRows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};
app.get('/api/menu-list', async (req, res) => {
    try {
        const { restaurant_id } = req.query;

        const sql = `SELECT 
                p.*, 
                r.restaurant_name, r.location, r.logo as restaurant_logo, r.phone,
                GROUP_CONCAT(pi.image_path) as all_images,
                o.offerTitle,
                o.offerPrice as promo_price,
                o.endDate as offer_end,
                o.status as offer_status,
                IF(o.id IS NOT NULL AND CURDATE() <= o.endDate AND o.status = 'active', 1, 0) AS has_offer,
                IF(o.id IS NOT NULL AND CURDATE() <= o.endDate AND o.status = 'active', o.offerTitle, p.name) AS display_name,
                IF(o.id IS NOT NULL AND CURDATE() <= o.endDate AND o.status = 'active', o.offerPrice, p.price) AS display_price
            FROM products p 
            INNER JOIN restaurants r ON p.restaurant_id = r.id
            LEFT JOIN product_images pi ON p.id = pi.product_id 
            LEFT JOIN offers o ON p.id = o.productId
            WHERE p.restaurant_id = ? 
            GROUP BY p.id 
            ORDER BY p.id DESC`;

        const [results] = await db.query(sql, [restaurant_id]);
        
        // ইমেজগুলোকে অ্যারেতে রূপান্তর
        const updatedResults = results.map(item => ({
            ...item,
            images: item.all_images ? item.all_images.split(',') : [],
        }));

        res.json(updatedResults);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// --- PUBLIC API: GET FULL RESTAURANT DATA BY SLUG ---
app.get('/api/public/restaurant/:slug', async (req, res) => {
    try {
        const { slug } = req.params;

        // ১. রেস্টুরেন্টের প্রোফাইল ডাটা এবং ডেলিভারি এরিয়া আনা
        const [restaurantRows] = await db.query(
        `SELECT id, restaurant_name, location, logo, bg_image, contact_mobile, status, is_online 
        FROM restaurants WHERE slug = ?`, [slug]
    );

        if (restaurantRows.length === 0) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        const restaurant = restaurantRows[0];
        const resId = restaurant.id;

        // ২. ডেলিভারি এরিয়া এবং চার্জ আনা
        const [areas] = await db.query(
            "SELECT areaName, deliveryCharge FROM delivery_areas WHERE restaurant_id = ?", [resId]
        );

        // ৩. সব প্রোডাক্ট, ইমেজ এবং অফার (Offers Table + Product Table Discount) একসাথে আনা
        const sqlMenu = `
            SELECT 
                p.id, p.name, p.price, p.offer_price as direct_discount, p.category, p.is_available,
                GROUP_CONCAT(DISTINCT pi.image_path) as all_images,
                o.offerTitle, o.offerPrice as promo_price, o.status as offer_status,
                IF(o.id IS NOT NULL AND CURDATE() <= o.endDate AND o.status = 'active', 1, 0) AS has_promo
            FROM products p 
            LEFT JOIN product_images pi ON p.id = pi.product_id 
            LEFT JOIN offers o ON p.id = o.productId
            WHERE p.restaurant_id = ? AND p.is_available = 1  -- এখানে পরিবর্তন হয়েছে
            GROUP BY p.id 
            ORDER BY p.category ASC, p.id DESC`;

        const [products] = await db.query(sqlMenu, [resId]);

        // ৪. ডাটা ফরম্যাটিং (ফ্রন্টএন্ডের useMemo ফিল্টারিং এর সাথে মিল রেখে)
        const formattedMenu = products.reduce((acc, item) => {
            const category = item.category || 'Uncategorized';
            
            // ইমেজের ফুল লিঙ্ক তৈরি
            const imageArray = item.all_images 
                ? item.all_images.split(',').map(img => `http://localhost:5000/uploads/${img}`)
                : [];

            // অফার লজিক নির্ধারণ
            let displayPrice = item.price;
            let oldPrice = null;
            let displayName = item.name;

            if (item.has_promo) {
                // 'offers' টেবিলের অফার থাকলে প্রাধান্য পাবে
                displayPrice = item.promo_price;
                oldPrice = item.price;
                displayName = item.offerTitle; 
            } else if (item.direct_discount > 0 && item.direct_discount < item.price) {
                // প্রোডাক্ট টেবিলের 'offer_price' থাকলে
                displayPrice = item.direct_discount;
                oldPrice = item.price;
            }

            if (!acc[category]) acc[category] = [];
            
            acc[category].push({
                id: item.id,
                name: item.name, // Original name
                display_name: displayName,
                price: item.price, // Original price
                display_price: displayPrice,
                old_price: oldPrice, // এটি ফ্রন্টএন্ডের filtering এ লাগবে
                category: category,
                images: imageArray,
                is_available: item.is_available
            });
            return acc;
        }, {});

        // ৫. ফাইনাল রেসপন্স
        res.json({
            profile: {
                ...restaurant,
                logo: restaurant.logo ? `http://localhost:5000/uploads/${restaurant.logo}` : null,
                bg_image: restaurant.bg_image ? `http://localhost:5000/uploads/${restaurant.bg_image}` : null,
                delivery_info: areas
            },
            menu: formattedMenu 
        });

    } catch (error) {
        console.error("Single API Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// --- 🔥 IMPROVED MULTI-RESTAURANT ORDER API ---
app.post('/api/place-order', async (req, res) => {
    const { 
        customerInfo, 
        cartItems, 
        method, 
        area, 
        selectedTable, 
        paymentMethod, 
        extraCharge 
    } = req.body;

    // ১. ভ্যালিডেশন চেক (কোড ২ থেকে নেওয়া)
    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ success: false, message: "Cart is empty!" });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // ২. কার্ট আইটেমগুলোকে রেস্টুরেন্ট অনুযায়ী গ্রুপ করা (কোড ২ এর লজিক)
        const itemsByRestaurant = cartItems.reduce((acc, item) => {
            const resId = item.restaurant_id || item.resId;
            if (!acc[resId]) acc[resId] = [];
            acc[resId].push(item);
            return acc;
        }, {});

        const restaurantIds = Object.keys(itemsByRestaurant);
        const results = [];

        // ৩. প্রতিটি রেস্টুরেন্টের জন্য আলাদা অর্ডার প্রসেস করা
        for (const resId of restaurantIds) {
            const items = itemsByRestaurant[resId];
            
            // সাবটোটাল ক্যালকুলেশন
            const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            // ডেলিভারি চার্জ ডিস্ট্রিবিউশন
            // মাল্টি-ভেন্ডর হলে মোট চার্জকে রেস্টুরেন্ট সংখ্যা দিয়ে ভাগ করা হচ্ছে
            const chargePerRes = method === 'Delivery' ? (extraCharge / restaurantIds.length) : (method === 'Pickup' ? (extraCharge / restaurantIds.length) : 0);
            const finalTotal = subtotal + chargePerRes;

            const orderSql = `INSERT INTO orders 
                (restaurant_id, customer_name, customer_phone, customer_address, 
                subtotal, order_type, table_id, total_amount, payment_method, order_status, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`;

            const [orderResult] = await connection.query(orderSql, [
                resId,
                customerInfo.name || 'Customer',
                customerInfo.phone || '000',
                method === 'Delivery' ? `${area}, ${customerInfo.address}` : 'Pickup/Dine-In',
                subtotal,
                method || 'Delivery',
                method === 'Dine-In' ? selectedTable : null,
                finalTotal,
                paymentMethod ? paymentMethod.toUpperCase() : 'CASH' // কোড ২ এর মতো UpperCase
            ]);

            const orderId = orderResult.insertId;

            // ৪. আইটেম ইনসার্ট
            const itemValues = items.map(item => [
                orderId,
                item.id || item.product_id, 
                item.quantity,
                item.price,
                (item.price * item.quantity)
            ]);

            const itemsSql = `INSERT INTO order_items 
                (order_id, product_id, quantity, price, total_price) 
                VALUES ?`;

            await connection.query(itemsSql, [itemValues]);
            results.push({ restaurant_id: resId, order_id: orderId });
        }

        await connection.commit();
        //res.status(201).json({ success: true, message: "Order placed successfully!", details: results });
        res.status(201).json({ 
        success: true, 
        message: "Order placed successfully!", 
        orderId: results[0].order_id,  // ✅ এই লাইন যোগ করো
        details: results 
    });

    } catch (error) {
        await connection.rollback();
        console.error("Order API Error:", error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release(); // কানেকশন রিলিজ করা
    }
});

// common area doe all restaurant 
app.post('/api/get-cart-delivery-info', async (req, res) => {
    try {
        const { restaurantIds } = req.body; // Array of IDs [1, 2, 5]
        
        if (!restaurantIds || restaurantIds.length === 0) {
            return res.json([]);
        }

        // ঐ নির্দিষ্ট রেস্টুরেন্টগুলোর ডেলিভারি এরিয়া এবং চার্জ নিয়ে আসা
        const [rows] = await db.query(
            "SELECT restaurant_id, areaName, deliveryCharge FROM delivery_areas WHERE restaurant_id IN (?)",
            [restaurantIds]
        );

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// table list 
app.get('/api/get-tables/:restaurantId', async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const [rows] = await db.query(
            "SELECT id, table_number, capacity, is_available FROM restaurant_tables WHERE restaurant_id = ?",
            [restaurantId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Place Order API
//Add Table 
app.post('/api/add-table', async (req, res) => {
    const { restaurant_id, table_number, category, capacity } = req.body;

    // ভ্যালিডেশন
    if (!restaurant_id || !table_number || !category || !capacity) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    const query = `INSERT INTO restaurant_tables (restaurant_id, table_number, category, capacity, is_available) VALUES (?, ?, ?, ?, 1)`;

    try {
        db.query(query, [restaurant_id, table_number, category, capacity], (err, result) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).json({ message: "Database error occurred!" });
            }
            res.status(201).json({ 
                success: true, 
                message: "Table added successfully!", 
                tableId: result.insertId 
            });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error!" });
    }
});

//Table Booking
app.get('/api/tables/:resId', async (req, res) => {
    const { resId } = req.params;

    const sql = `
        SELECT t.*, 
        (SELECT customer_name FROM orders 
         WHERE table_id COLLATE utf8mb4_general_ci = CAST(t.id AS CHAR) COLLATE utf8mb4_general_ci
         AND order_status IN ('pending', 'confirmed', 'cooking') 
         LIMIT 1) as customer_name,
        (SELECT customer_phone FROM orders 
         WHERE table_id COLLATE utf8mb4_general_ci = CAST(t.id AS CHAR) COLLATE utf8mb4_general_ci
         AND order_status IN ('pending', 'confirmed', 'cooking') 
         LIMIT 1) as customer_phone
        FROM restaurant_tables t
        WHERE t.restaurant_id = ?
        ORDER BY t.table_number ASC`;

    try {
        const [results] = await db.query(sql, [resId]);
        res.json(results);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update Table status Manually 
app.put('/api/update-table-status', (req, res) => {
    const { tableId, is_available } = req.body;
    const sql = "UPDATE restaurant_tables SET is_available = ? WHERE id = ?";
    db.query(sql, [is_available, tableId], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true });
    });
})

// Contact API
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;

    const sql = "INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [name, email, subject, message], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            // ডাটাবেজে এরর হলে সাথে সাথে এরর রেসপন্স দিন
            return res.status(500).json({ success: false, message: "Database Error" });
        }

        // --- মূল সমাধান এখানে ---
        // ডাটাবেজে সেভ হয়ে গেছে, এখন সাথে সাথে ফ্রন্টএন্ডকে বলে দিন যে কাজ হয়েছে।
        // এতে ফ্রন্টএন্ডের 'Pending' স্ট্যাটাস শেষ হবে এবং Success দেখাবে।
        res.status(200).json({ success: true, message: "Success" });

        // ইমেইল পাঠানোর কাজটা এর পরে হবে, যাতে দেরি হলেও ফ্রন্টএন্ড আটকে না থাকে
        const mailOptions = {
            from: 'mkantidas138@gmail.com',
            to: 'info@smithitbd.com', 
            subject: `Contact: ${subject}`,
            html: `<h3>New Inquiry from ${name}</h3>
                   <p>Email: ${email}</p>
                   <p>Message: ${message}</p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Email error (Backend logs only):", error.message);
            } else {
                console.log("Email sent successfully!");
            }
        });
    });
});

// Admin Dashboard GET API
app.get('/api/admin/messages', async (req, res) => {
    try {
        const sql = "SELECT * FROM contact_messages ORDER BY created_at DESC";
        // mysql2/promise এ এভাবে কুয়েরি করতে হয়
        const [results] = await db.query(sql); 
        
        res.status(200).json(results);
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ 
            success: false, 
            message: "Database error occurred", 
            error: err.message 
        });
    }
});

// ২. মেসেজ ডিলিট করার API (DELETE)
app.delete('/api/admin/messages/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const sql = "DELETE FROM contact_messages WHERE id = ?";
        const [result] = await db.query(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Message not found" 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "Message deleted successfully" 
        });
    } catch (err) {
        console.error("Error deleting message:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to delete message" 
        });
    }
});

//API for Menu download
app.get('/api/download-menu/:restaurant_id', async (req, res) => {
    try {
        const { restaurant_id } = req.params;

        // রেস্টুরেন্ট ইনফো এবং প্রোডাক্ট একসাথে আনার কুয়েরি
        const sql = `
            SELECT 
                r.restaurant_name, 
                r.logo, 
                r.location, 
                r.contact_mobile,
                p.id as prod_id, 
                p.name as prod_name, 
                p.price, 
                p.category,
                (SELECT image_path FROM product_images WHERE product_id = p.id LIMIT 1) as main_image,
                o.offerPrice,
                o.status as offer_status,
                IF(o.id IS NOT NULL AND CURDATE() <= o.endDate AND o.status = 'active', o.offerPrice, p.price) AS final_price
            FROM restaurants r
            LEFT JOIN products p ON r.id = p.restaurant_id
            LEFT JOIN offers o ON p.id = o.productId
            WHERE r.id = ? 
            ORDER BY p.category ASC, p.id DESC`;

        const [results] = await db.query(sql, [restaurant_id]);

        // যদি ডাটাবেজে এই আইডি দিয়ে কোনো রেস্টুরেন্ট না থাকে
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Restaurant not found" });
        }

        // রেস্টুরেন্ট প্রোফাইল ডাটা সাজানো
        const restaurantProfile = {
            name: results[0].restaurant_name || 'Elite Dining',
            logo: results[0].logo ? `http://localhost:5000/uploads/${results[0].logo}` : null,
            address: results[0].location || 'Address not provided',
            phone: results[0].contact_mobile || 'Phone not provided'
        };

        // মেনু আইটেমগুলোকে ক্যাটাগরি অনুযায়ী গ্রুপিং করা
        const menuByCategory = results.reduce((acc, item) => {
            // যদি রেস্টুরেন্টের কোনো প্রোডাক্ট না থাকে (prod_id NULL হবে LEFT JOIN এর কারণে)
            if (!item.prod_id) return acc;

            const cat = item.category || 'General';
            if (!acc[cat]) acc[cat] = [];

            acc[cat].push({
                id: item.prod_id,
                name: item.prod_name,
                price: item.final_price,
                image: item.main_image ? `http://localhost:5000/uploads/${item.main_image}` : null
            });
            return acc;
        }, {});

        // ফাইনাল রেসপন্স
        res.json({
            success: true,
            restaurant: restaurantProfile,
            menu: menuByCategory
        });

    } catch (err) {
        console.error("API Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// SuperAdmin 
//AddArea.jsx
app.get('/api/get-area', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM area");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Database error" });
    }
});
app.post('/api/admin/add-area', upload.single('image'), async (req, res) => {
    try {
        const { name } = req.body;
        let fileName = null;
        if (req.file) {
            fileName = `area-${Date.now()}.webp`;
            await sharp(req.file.buffer).resize(600, 400).webp().toFile(path.join(areaUploadDir, fileName));
        }
        await db.query("INSERT INTO area (name, image) VALUES (?, ?)", [name, fileName]);
        res.json({ message: "Area Added!" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.delete('/api/admin/delete-area/:id', async (req, res) => {
    try {
        const [results] = await db.query("SELECT image FROM area WHERE id = ?", [req.params.id]);
        const img = results[0]?.image;
        if (img && fs.existsSync(path.join(areaUploadDir, img))) fs.unlinkSync(path.join(areaUploadDir, img));
        await db.query("DELETE FROM area WHERE id = ?", [req.params.id]);
        res.json({ message: "Deleted!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.put('/api/admin/update-area/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const [results] = await db.query("SELECT image FROM area WHERE id = ?", [id]);
        let fileName = results[0]?.image;
        if (req.file) {
            if (fileName && fs.existsSync(path.join(areaUploadDir, fileName))) fs.unlinkSync(path.join(areaUploadDir, fileName));
            fileName = `area-${Date.now()}.webp`;
            await sharp(req.file.buffer).resize(600, 400).webp().toFile(path.join(areaUploadDir, fileName));
        }
        await db.query("UPDATE area SET name = ?, image = ? WHERE id = ?", [name, fileName, id]);
        res.json({ message: "Updated!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//AddRestaurant.jsx:
app.post('/api/add-restaurant', upload.single('image'), async (req, res) => {
    try {
        const { customerName, mobile, restaurantName, restaurantType, area, ratings, address, price, discount, paid, subscription, paymentMethod, hasOffer, date } = req.body;
        const priceNum = parseFloat(price) || 0;
        const discountNum = parseFloat(discount) || 0;
        const paidNum = parseFloat(paid) || 0;
        const due = (priceNum - discountNum) - paidNum;
        const offerValue = parseInt(hasOffer) || 0;
        let finalFileName = null;
        if (req.file) {
            finalFileName = `res-${Date.now()}.webp`;
            await sharp(req.file.buffer).resize(800, 600, { fit: 'cover' }).webp({ quality: 80 }).toFile(path.join(restaurantUploadDir, finalFileName));
        }
        const sql = `INSERT INTO allrestaurants (customer_name, mobile, restaurant_name, area, ratings, address, image_path, price, discount, paid, due, subscription, payment_method, order_date, restaurant_type, has_offer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await db.query(sql, [customerName, mobile, restaurantName, area, ratings || 0, address, finalFileName, priceNum, discountNum, paidNum, due, subscription, paymentMethod, date, restaurantType, offerValue]);
        res.status(200).json({ message: "Success" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});


//Area page
app.get('/api/offerss', async (req, res) => {
    const area = req.query.area;
    try {
        const [results] = await db.query(
            "SELECT * FROM offers WHERE UPPER(selectedAreas) = UPPER(?) AND status = 'active' ORDER BY id DESC",
            [area]
        );
        res.json({ success: true, offers: results });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});


//chatlist.jsx
app.get('/api/chatlist', async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM contact_messages ORDER BY id DESC");
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/chatlist', async (req, res) => {
    try {
        const { sender_name, email, description } = req.body;
        if (!sender_name || !email || !description) {
            return res.status(400).json({ message: "All fields are required!" });
        }
        const [result] = await db.query(
            "INSERT INTO contact_messages (sender_name, email, description) VALUES (?, ?, ?)",
            [sender_name, email, description]
        );
        res.status(201).json({ message: "Message Sent!", id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.delete('/api/chatlist/:id', async (req, res) => {
    try {
        const [result] = await db.query("DELETE FROM contact_messages WHERE id = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Message not found!" });
        res.json({ message: "Deleted Successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


//offerlist
app.get('/api/addoffers', async (req, res) => {
    try {
        const [result] = await db.query("SELECT * FROM offers ORDER BY id DESC");
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/addoffers', uploadOffer.single('offerImage'), async (req, res) => {
    try {
        const { offerTitle, area, itemName, offerPrice, totalQuantity, endDate } = req.body;
        let imagePath = null;
        if (req.file) {
            const fileName = `offer-${Date.now()}.webp`;
            const fullPath = path.join(__dirname, 'uploads', 'offers', fileName);
            await sharp(req.file.buffer).resize(600, 400, { fit: 'cover' }).webp({ quality: 80 }).toFile(fullPath);
            imagePath = fileName;
        }
        const sql = `INSERT INTO offers (offerTitle, area, itemName, offerPrice, startDate, endDate, selectedAreas, quantityType, totalQuantity, offerImage, status) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, 'active')`;
        const values = [offerTitle, area, itemName, offerPrice, endDate, area, totalQuantity, totalQuantity, imagePath];
        const [result] = await db.query(sql, values);
        res.status(201).json({ success: true, message: "Offer Created Successfully!", id: result.insertId, image: imagePath });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
app.put('/api/addoffers/:id', uploadOffer.single('offerImage'), async (req, res) => {
    const { id } = req.params;
    const { offerTitle, area, itemName, offerPrice, totalQuantity, endDate } = req.body;
    try {
        const [results] = await db.query("SELECT offerImage FROM offers WHERE id = ?", [id]);
        if (results.length === 0) return res.status(404).json({ message: "Not found" });
        let imagePath = results[0].offerImage;
        if (req.file) {
            if (imagePath) {
                const oldPath = path.join(__dirname, 'uploads', 'offers', imagePath);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            const fileName = `offer-${Date.now()}.webp`;
            const fullPath = path.join(__dirname, 'uploads', 'offers', fileName);
            await sharp(req.file.buffer).resize(600, 400, { fit: 'cover' }).webp({ quality: 80 }).toFile(fullPath);
            imagePath = fileName;
        }
        await db.query(
            `UPDATE offers SET offerTitle=?, area=?, selectedAreas=?, itemName=?, offerPrice=?, quantityType=?, totalQuantity=?, endDate=?, offerImage=? WHERE id=?`,
            [offerTitle, area, area, itemName, offerPrice, totalQuantity, totalQuantity, endDate, imagePath, id]
        );
        res.json({ message: "Updated Successfully", image: imagePath });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.delete('/api/addoffers/:id', async (req, res) => {
    try {
        const [results] = await db.query("SELECT offerImage FROM offers WHERE id = ?", [req.params.id]);
        if (results.length === 0) return res.status(404).json({ message: "Not found" });
        const img = results[0].offerImage;
        if (img) {
            const imgPath = path.join(offersUploadDir, img);
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }
        await db.query("DELETE FROM offers WHERE id = ?", [req.params.id]);
        res.json({ message: "Deleted Successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


//Registration
//SuperAdmin User
app.post('/api/superadmin/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [results] = await db.query("SELECT * FROM superadmins WHERE email = ?", [email]);
        if (results.length > 0 && password === results[0].password) {
            res.json({ message: "Login Successful", admin: { id: results[0].id, name: results[0].name, email: results[0].email, role: results[0].role, image: results[0].image } });
        } else {
            res.status(401).json({ message: "Invalid Credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/api/superadmin/users', async (req, res) => {
    try {
        const [results] = await db.query("SELECT id, name, email, password, role, image FROM superadmins ORDER BY id DESC");
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/superadmin/register', (req, res) => {
    // 1. Manually invoke Multer to catch its errors properly
    uploadAdmin.single('image')(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: "File too large. Max 1MB allowed." });
            }
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(500).json({ message: "Unknown upload error", error: err.message });
        }

        // 2. If upload succeeds, proceed with database logic
        try {
            const { name, email, password, role } = req.body;
            let fileName = null;

            if (req.file) {
                fileName = `admin-${Date.now()}.webp`;
                await sharp(req.file.buffer)
                    .resize(300, 300, { fit: 'cover' })
                    .webp()
                    .toFile(path.join(adminUploadDir, fileName));
            }

            await db.query(
                "INSERT INTO superadmins (name, email, password, role, image) VALUES (?, ?, ?, ?, ?)", 
                [name, email, password, role, fileName]
            );
            
            res.status(201).json({ message: "User created" });

        } catch (e) {
            // 3. Log the ACTUAL error to your Node console so you can debug!
            console.error("Superadmin Registration Error:", e);
            
            // Check for duplicate email error from MySQL
            if (e.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: "Email already exists" });
            }

            // Send back the actual error message to the frontend for debugging
            res.status(500).json({ message: "Internal Server Error", error: e.message });
        }
    });
});
app.put('/api/superadmin/update/:id', uploadAdmin.single('image'), async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await db.query("SELECT image FROM superadmins WHERE id = ?", [id]);
        let fileName = results[0]?.image;
        if (req.file) {
            if (fileName && fs.existsSync(path.join(adminUploadDir, fileName))) fs.unlinkSync(path.join(adminUploadDir, fileName));
            fileName = `admin-${Date.now()}.webp`;
            await sharp(req.file.buffer).resize(300, 300, { fit: 'cover' }).webp().toFile(path.join(adminUploadDir, fileName));
        }
        await db.query("UPDATE superadmins SET name=?, email=?, password=?, role=?, image=? WHERE id=?",
            [req.body.name, req.body.email, req.body.password, req.body.role, fileName, id]);
        res.json({ message: "Updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.delete('/api/superadmin/delete/:id', async (req, res) => {
    try {
        const [results] = await db.query("SELECT image FROM superadmins WHERE id = ?", [req.params.id]);
        const img = results[0]?.image;
        if (img && fs.existsSync(path.join(adminUploadDir, img))) fs.unlinkSync(path.join(adminUploadDir, img));
        await db.query("DELETE FROM superadmins WHERE id = ?", [req.params.id]);
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


//Restaurant add request
app.get('/api/add-requests', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM restaurants ORDER BY created_at DESC');
        res.status(200).json(rows);
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch restaurants" });
    }
});

// 2. DELETE: Remove a restaurant by ID
app.delete('/api/add-requests/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM restaurants WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ error: "Failed to delete" });
    }
});

// 3. PUT: Toggle Status (Active/Inactive)
app.put('/api/restaurants/:id/toggle-status', async (req, res) => {
    const { id } = req.params;
    try {
        // First, find the current status
        const [rows] = await db.query('SELECT status FROM restaurants WHERE id = ?', [id]);
        
        if (rows.length === 0) return res.status(404).json({ message: "Not found" });

        const currentStatus = rows[0].status;
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

        // Update to the flipped status
        await db.query('UPDATE restaurants SET status = ? WHERE id = ?', [newStatus, id]);

        res.status(200).json({ status: newStatus });
    } catch (error) {
        console.error("Toggle Error:", error);
        res.status(500).json({ error: "Update failed" });
    }
});


//REview
app.get('/api/reviews', async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM reviews ORDER BY id DESC");
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
});
app.post('/api/reviews', async (req, res) => {
    try {
        const { name, message } = req.body;
        if (!name || !message) return res.status(400).json({ message: "Name and Message are required!" });
        const [result] = await db.query("INSERT INTO reviews (name, message) VALUES (?, ?)", [name, message]);
        res.status(201).json({ message: "Review Published!", id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: "Failed to save review" });
    }
});
app.put('/api/reviews/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, message } = req.body;
        if (!name || !message) return res.status(400).json({ message: "Updated name and message are required!" });
        const [result] = await db.query("UPDATE reviews SET name = ?, message = ? WHERE id = ?", [name, message, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Review not found!" });
        res.json({ message: "Review Updated Successfully" });
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});
app.delete('/api/reviews/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query("DELETE FROM reviews WHERE id = ?", [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Review not found!" });
        res.json({ message: "Review Deleted Successfully" });
    } catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
});


//Top restaurants
app.get('/api/top_restaurants', async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM top_restaurants ORDER BY id DESC");
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/top_restaurants', upload.single('image'), async (req, res) => {
    try {
        const { viewLink, messengerLink } = req.body;
        let fileName = null;
        if (req.file) {
            fileName = `top-${Date.now()}.webp`;
            await sharp(req.file.buffer).resize(500, 350, { fit: 'cover' }).webp({ quality: 80 }).toFile(path.join(topResUploadDir, fileName));
        }
        const [result] = await db.query("INSERT INTO top_restaurants (viewLink, messengerLink, image) VALUES (?, ?, ?)", [viewLink, messengerLink, fileName]);
        res.status(201).json({ message: "Successfully Added", id: result.insertId, image: fileName });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.put('/api/top_restaurants/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { viewLink, messengerLink } = req.body;
    try {
        const [results] = await db.query("SELECT image FROM top_restaurants WHERE id = ?", [id]);
        if (results.length === 0) return res.status(404).json({ error: "Not found" });
        let fileName = results[0].image;
        if (req.file) {
            if (fileName && fs.existsSync(path.join(topResUploadDir, fileName))) fs.unlinkSync(path.join(topResUploadDir, fileName));
            fileName = `top-${Date.now()}.webp`;
            await sharp(req.file.buffer).resize(500, 350, { fit: 'cover' }).webp().toFile(path.join(topResUploadDir, fileName));
        }
        await db.query("UPDATE top_restaurants SET viewLink = ?, messengerLink = ?, image = ? WHERE id = ?", [viewLink, messengerLink, fileName, id]);
        res.json({ message: "Updated successfully", image: fileName });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})
app.delete('/api/top_restaurants/:id', async (req, res) => {
    try {
        const [results] = await db.query("SELECT image FROM top_restaurants WHERE id = ?", [req.params.id]);
        if (results.length > 0) {
            const fileName = results[0].image;
            if (fileName && fs.existsSync(path.join(topResUploadDir, fileName))) fs.unlinkSync(path.join(topResUploadDir, fileName));
        }
        await db.query("DELETE FROM top_restaurants WHERE id = ?", [req.params.id]);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});