function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
    // Di Vercel, /tmp kosong saat cold start: pakai data bawaan repo bila ada
    if (DATA_FILE !== BUNDLED_DATA_FILE && fs.existsSync(BUNDLED_DATA_FILE)) {
      const seeded = JSON.parse(fs.readFileSync(BUNDLED_DATA_FILE, 'utf8'));
      writeData(seeded);
      return seeded;
    }
  } catch (e) {
    console.error('Error reading data file:', e.message);
  }
  const initial = { ...DEFAULT_DATA, password: bcrypt.hashSync(DEFAULT_DATA.password, 10) };
  writeData(initial);
  return initial;
}

function writeData(data) {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing data file:', e.message);
  }
}
