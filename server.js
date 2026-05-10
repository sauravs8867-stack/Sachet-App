const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const app = express();

// --- CLOUDINARY CONFIG ---
cloudinary.config({ 
  cloud_name: 'dljupzine', 
  api_key: '658533244982168', 
  api_secret: 'uEzzKO4fgoBjKJgUsMSGKZyH1N0' 
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sachet_products',
    allowed_formats: ['jpg', 'png', 'jpeg']
  },
});
const upload = multer({ storage: storage });

// --- DATABASE ---
mongoose.connect('mongodb://127.0.0.1:27017/sachetDB');

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
    const items = await Item.find().sort({ expiryDate: 1 });
    res.render('index', { items: items });
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
        res.send("Error: Photo upload fail ho gaya!");
    }
});

app.post('/delete', async (req, res) => {
    await Item.findByIdAndDelete(req.body.id);
    res.redirect('/');
});

app.listen(3000, () => console.log("Sachet Final Live: http://localhost:3000"));