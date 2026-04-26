const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || __dirname;
const DATA_FILE = path.join(DATA_DIR, 'cms-data.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const JWT_SECRET = process.env.JWT_SECRET || 'gr-cms-secret-change-in-production';
const JWT_EXPIRES = '8h';

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Hanya file gambar yang diizinkan (JPG, PNG, WebP, GIF)'));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));
app.use('/uploads', express.static(UPLOADS_DIR));

// ===================================
// DEFAULT CMS DATA
// ===================================
const DEFAULT_DATA = {
  password: 'admin123',
  settings: {
    brandName: 'Grand Residence',
    whatsapp: '628123456789',
    phone: '0812-3456-789',
    email: 'info@grandresidence.id',
    hours: 'Senin - Minggu: 08.00 - 17.00',
    address: 'Jl. Raya Serpong No. 123, Kec. Serpong, Kota Tangerang Selatan, Banten 15310',
    facebook: '#',
    instagram: '#',
    youtube: '#',
    twitter: '#',
  },
  hero: {
    badge: 'Unit Terbatas — Booking Sekarang',
    headline: 'Hunian Nyaman',
    highlight: 'Lokasi Strategis',
    subheadline: 'Wujudkan rumah impian Anda di kawasan berkembang dengan fasilitas lengkap, keamanan 24 jam, dan akses mudah ke pusat kota.',
    priceText: 'Mulai dari Rp 500 Jutaan',
    backgroundImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80',
    trustBadges: ['Legalitas Lengkap', 'Developer Terpercaya', '200+ Unit Terjual'],
  },
  features: [
    { icon: 'map-pin', title: 'Lokasi Strategis', desc: 'Dekat pusat perbelanjaan, sekolah, rumah sakit, dan akses tol.' },
    { icon: 'droplets', title: 'Bebas Banjir', desc: 'Dilengkapi sistem drainase modern dan area resapan air.' },
    { icon: 'route', title: 'Akses Mudah', desc: '5 menit ke gerbang tol dan jalur transportasi umum.' },
    { icon: 'shield-check', title: 'Lingkungan Aman', desc: 'Keamanan 24 jam, CCTV, dan sistem one gate access.' },
    { icon: 'trees', title: 'Asri & Hijau', desc: 'Taman bermain, jogging track, dan ruang terbuka hijau.' },
  ],
  clusters: [
    { id: 'sakura', name: 'Cluster Sakura', thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80', description: 'Hunian asri dengan suasana alam yang menenangkan' },
    { id: 'magnolia', name: 'Cluster Magnolia', thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', description: 'Desain kontemporer untuk keluarga modern' },
    { id: 'emerald', name: 'Cluster Emerald', thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80', description: 'Kavling premium dengan lahan luas dan privasi maksimal' },
  ],
  properties: [
    {
      id: 'type36', cluster_id: 'sakura', name: 'Type 36/72', price: 'Rp 550 Juta',
      badge: 'Best Seller', badgeColor: 'blue', availability: 'Tersedia', rating: '4.9',
      bedrooms: '2 KT', bathrooms: '1 KM', landArea: 'LT 72m²',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80',
      ],
      desc: 'Tipe starter yang ideal untuk pasangan muda. Desain minimalis modern dengan pencahayaan alami yang optimal. Dilengkapi taman kecil di depan rumah.',
      specs: { 'Luas Tanah': '72 m²', 'Luas Bangunan': '36 m²', 'Kamar Tidur': '2', 'Kamar Mandi': '1', 'Lantai': '1', 'Carport': '1 Mobil', 'Listrik': '1300 Watt', 'Air': 'PDAM', 'Sertifikat': 'SHM' },
    },
    {
      id: 'sk-type45', cluster_id: 'sakura', name: 'Type 45/90', price: 'Rp 750 Juta',
      badge: 'Populer', badgeColor: 'amber', availability: 'Tersedia', rating: '5.0',
      bedrooms: '3 KT', bathrooms: '2 KM', landArea: 'LT 90m²',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7c17a4?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1616137466211-f736a1ee2c6c?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=900&q=80',
      ],
      desc: 'Tipe paling diminati dengan layout optimal untuk keluarga kecil. Ruang tamu luas, dapur bersih terpisah, dan halaman belakang yang nyaman.',
      specs: { 'Luas Tanah': '90 m²', 'Luas Bangunan': '45 m²', 'Kamar Tidur': '3', 'Kamar Mandi': '2', 'Lantai': '1', 'Carport': '1 Mobil', 'Listrik': '2200 Watt', 'Air': 'PDAM', 'Sertifikat': 'SHM' },
    },
    {
      id: 'mg-type45', cluster_id: 'magnolia', name: 'Type 45/90', price: 'Rp 780 Juta',
      badge: 'Populer', badgeColor: 'amber', availability: 'Tersedia', rating: '4.8',
      bedrooms: '3 KT', bathrooms: '2 KM', landArea: 'LT 90m²',
      image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7c17a4?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1600566753376-12c8ab7c17a4?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1616137466211-f736a1ee2c6c?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=900&q=80',
      ],
      desc: 'Hunian nyaman di kawasan Magnolia dengan taman privat dan pencahayaan alami. Cocok untuk keluarga muda yang aktif.',
      specs: { 'Luas Tanah': '90 m²', 'Luas Bangunan': '45 m²', 'Kamar Tidur': '3', 'Kamar Mandi': '2', 'Lantai': '1', 'Carport': '1 Mobil', 'Listrik': '2200 Watt', 'Air': 'PDAM', 'Sertifikat': 'SHM' },
    },
    {
      id: 'mg-type60', cluster_id: 'magnolia', name: 'Type 60/120', price: 'Rp 980 Juta',
      badge: 'Premium', badgeColor: 'green', availability: '3 Unit Lagi', rating: '5.0',
      bedrooms: '3 KT', bathrooms: '2 KM', landArea: 'LT 120m²',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=900&q=80',
      ],
      desc: 'Tipe premium dua lantai dengan ruang keluarga luas, master bedroom mezzanine, dan taman belakang privat di kawasan Magnolia.',
      specs: { 'Luas Tanah': '120 m²', 'Luas Bangunan': '60 m²', 'Kamar Tidur': '3', 'Kamar Mandi': '2', 'Lantai': '1.5 (Mezzanine)', 'Carport': '2 Mobil', 'Listrik': '2200 Watt', 'Air': 'PDAM', 'Sertifikat': 'SHM' },
    },
    {
      id: 'em-type60', cluster_id: 'emerald', name: 'Type 60/120', price: 'Rp 1,1 Miliar',
      badge: 'Eksklusif', badgeColor: 'green', availability: '2 Unit Lagi', rating: '5.0',
      bedrooms: '3 KT', bathrooms: '2 KM', landArea: 'LT 120m²',
      image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=900&q=80',
      ],
      desc: 'Unit eksklusif di Cluster Emerald dengan kavling pojok, taman luas, dan akses jalan lebih lebar. Privasi maksimal untuk keluarga premium.',
      specs: { 'Luas Tanah': '120 m²', 'Luas Bangunan': '60 m²', 'Kamar Tidur': '3', 'Kamar Mandi': '2', 'Lantai': '1.5 (Mezzanine)', 'Carport': '2 Mobil', 'Listrik': '3500 Watt', 'Air': 'PDAM', 'Sertifikat': 'SHM' },
    },
  ],
  testimonials: [
    { name: 'Budi Santoso', role: 'Penghuni Type 45', text: 'Prosesnya sangat mudah dan transparan. Rumah yang kami dapat melebihi ekspektasi. Lingkungannya asri, tenang, dan sangat cocok untuk keluarga muda seperti kami.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', rating: 5 },
    { name: 'Sari Wijaya', role: 'Penghuni Type 60', text: 'Saya bandingkan dengan banyak perumahan lain, Grand Residence paling worth it dari segi harga, kualitas bangunan, dan lokasi. Anak-anak juga senang ada taman bermain.', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80', rating: 5 },
    { name: 'Andi Pratama', role: 'Penghuni Type 36', text: 'Developer-nya sangat profesional dan responsif. Setelah serah terima, layanan after-salesnya juga sangat baik. Sangat merekomendasikan Grand Residence!', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80', rating: 5 },
  ],
  location: {
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.2!2d106.82!3d-6.21!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTInMzYuMCJTIDEwNsKwNDknMTIuMCJF!5e0!3m2!1sid!2sid!4v1',
    facilities: [
      { icon: 'graduation-cap', name: 'Sekolah & Universitas', distance: '3 menit berkendara', color: 'blue' },
      { icon: 'heart-pulse', name: 'Rumah Sakit', distance: '5 menit berkendara', color: 'red' },
      { icon: 'shopping-bag', name: 'Mall & Pusat Belanja', distance: '7 menit berkendara', color: 'purple' },
      { icon: 'train-front', name: 'Stasiun & Tol', distance: '5 menit berkendara', color: 'green' },
      { icon: 'utensils', name: 'Restoran & Kuliner', distance: '2 menit berkendara', color: 'orange' },
      { icon: 'church', name: 'Tempat Ibadah', distance: '1 menit berjalan kaki', color: 'cyan' },
    ],
  },
  cta: {
    badge: 'Promo Terbatas — Diskon hingga 10%',
    headline1: 'Jangan Lewatkan Kesempatan',
    highlight: 'Rumah Impian',
    subheadline: 'Hubungi tim marketing kami sekarang untuk mendapatkan penawaran terbaik, simulasi KPR, dan jadwal kunjungan ke lokasi.',
    backgroundImage: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2000&q=80',
    trustBadges: ['SHM & IMB Lengkap', 'KPR Semua Bank', 'Free Biaya Notaris', 'DP Ringan'],
  },
};

// ===================================
// HELPER: Read/Write JSON file
// ===================================
function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading data file:', e.message);
  }
  const initial = { ...DEFAULT_DATA, password: bcrypt.hashSync(DEFAULT_DATA.password, 10) };
  writeData(initial);
  return initial;
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Migrate plain-text password to bcrypt hash on startup
function migratePassword() {
  const data = readData();
  if (data.password && !data.password.startsWith('$2')) {
    data.password = bcrypt.hashSync(data.password, 10);
    writeData(data);
    console.log('  🔐 Password telah dienkripsi dengan bcrypt.');
  }
}

// ===================================
// AUTH MIDDLEWARE
// ===================================
function authMiddleware(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  try {
    jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Sesi kedaluwarsa, silakan login kembali' });
  }
}

// ===================================
// API ROUTES
// ===================================

// POST login
app.post('/api/login', (req, res) => {
  const data = readData();
  const { password } = req.body;
  if (!password) return res.status(400).json({ success: false, message: 'Password diperlukan' });

  const valid = bcrypt.compareSync(password, data.password);
  if (valid) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Password salah' });
  }
});

// GET all CMS data (public, for landing page)
app.get('/api/cms', (req, res) => {
  const data = readData();
  const { password, ...publicData } = data;
  res.json(publicData);
});

// GET all CMS data (protected, for admin panel)
app.get('/api/cms/admin', authMiddleware, (req, res) => {
  const data = readData();
  const { password, ...adminData } = data;
  res.json(adminData);
});

// GET export data (protected)
app.get('/api/cms/export', authMiddleware, (req, res) => {
  const data = readData();
  const { password, ...exportData } = data;
  res.setHeader('Content-Disposition', 'attachment; filename=cms-data-export.json');
  res.json(exportData);
});

// PUT update all CMS data (protected)
app.put('/api/cms', authMiddleware, (req, res) => {
  try {
    const data = readData();
    const updates = req.body;
    updates.password = data.password; // Preserve password — never update via this endpoint
    writeData(updates);
    res.json({ success: true, message: 'Data berhasil disimpan' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PUT update specific section (protected)
app.put('/api/cms/:section', authMiddleware, (req, res) => {
  try {
    const data = readData();
    const { section } = req.params;
    data[section] = req.body;
    writeData(data);
    res.json({ success: true, message: `${section} berhasil disimpan` });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PUT change password (protected)
app.put('/api/password', authMiddleware, (req, res) => {
  try {
    const data = readData();
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ success: false, message: 'Password minimal 4 karakter' });
    }
    data.password = bcrypt.hashSync(newPassword, 10);
    writeData(data);
    res.json({ success: true, message: 'Password berhasil diubah' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST reset to defaults (protected) — keeps current password
app.post('/api/cms/reset', authMiddleware, (req, res) => {
  try {
    const data = readData();
    const resetData = { ...DEFAULT_DATA, password: data.password };
    writeData(resetData);
    res.json({ success: true, message: 'Data berhasil di-reset' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST import data (protected)
app.post('/api/cms/import', authMiddleware, (req, res) => {
  try {
    const importedData = req.body;
    const data = readData();
    importedData.password = data.password; // Keep current password
    writeData(importedData);
    res.json({ success: true, message: 'Data berhasil diimport' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST upload image (protected)
app.post('/api/upload', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Harap pilih file gambar terlebih dahulu' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, url: imageUrl });
});

// Error handler (covers multer file-type/size errors)
app.use((err, req, res, next) => {
  res.status(400).json({ success: false, message: err.message || 'Terjadi kesalahan' });
});

// ===================================
// START SERVER
// ===================================
migratePassword();

// Local / Render / Railway: start a real server
// Vercel: skip listen, export the app for serverless
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  ✅ Grand Residence CMS Server running on port ${PORT}`);
    console.log(`  📁 Data dir : ${DATA_DIR}`);
  });
}

module.exports = app;
