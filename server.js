const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const app = express();

// --- CONFIGURATION ---
// Render pe process.env use hoga, local pe hardcoded
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dljupzine', 
  api_key: process.env.CLOUDINARY_API_KEY || '658533244982168', 
  api_secret: process.env.CLOUDINARY_API_SECRET || 'uEzzKO4fgoBjKJgUsMSGKZyH1N0' 
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sachet_products',
    allowed_formats: ['jpg', 'png', 'jpeg']
  },
});
const upload = multer({ storage: storage });

// --- DATABASE CONNECTION ---
// Agar Render pe MONGO_URI variable hai toh wo, warna local DB
const dbURI = 'mongodb+srv://atul:sachet123@cluster0.mongodb.net/sachetDB?retryWrites=true&w=majority';
mongoose.connect(dbURI)
    .then(() => console.log("Sachet DB Connected Successfully!"))
    .catch(err => console.log("DB Connection Error: ", err));

const itemSchema = new mongoose.Schema({
    name: String,
    quantity: String,
    expiryDate: Date,
    imageUrl: String
});
const Item = mongoose.model('Item', itemSchema);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// --- ROUTES ---
app.get('/', async (req, res) => {
    try {
        const items = await Item.find().sort({ expiryDate: 1 });
        res.render('index', { items: items });
    } catch (err) {
        res.status(500).send("Database se data nahi aa raha.");
    }
});

app.post('/add', upload.single('image'), async (req, res) => {
    try {
        const newItem = new Item({
            name: req.body.name,
            quantity: req.body.quantity,
            expiryDate: req.body.expiry,
            imageUrl: req.file ? req.file.path : 'https://via.placeholder.com/150'
        });
        await newItem.save();
        res.redirect('/');
    } catch (err) {
        res.send("Error: Photo upload ya data save fail ho gaya!");
    }
});

app.post('/delete', async (req, res) => {
    await Item.findByIdAndDelete(req.body.id);
    res.redirect('/');
});

// --- PORT CONFIG (Very Important for Render) ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sachet App is running on port ${PORT}`));
