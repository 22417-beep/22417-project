const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/watches';

app.use(express.json());

// svarzvane s bazata danni
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    seedDatabase();
  })
  .catch(err => console.error('Greshka pri vrazka s bazata:', err));

const watchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  imageUrl: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: String, default: 'N/A' }
});

const Watch = mongoose.model('Watch', watchSchema);

// nachalni danni
async function seedDatabase() {
  try {
    const count = await Watch.countDocuments();
    if (count === 0) {
      const initialWatches = [
        {
          name: 'Submariner Date',
          brand: 'Rolex',
          imageUrl: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=600',
          description: 'Klasicheski vodorazdelen chasovnik za gmurkane s kultov dizain i nadejden mehanizam.',
          price: '$10,500'
        },
        {
          name: 'Speedmaster Professional',
          brand: 'Omega',
          imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600',
          description: 'Izvestniyat "Moonwatch", nosen ot kosmonavtite na Lunata. Ikona na hronografite.',
          price: '$7,600'
        },
        {
          name: 'Nautilus 5711',
          brand: 'Patek Philippe',
          imageUrl: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=600',
          description: 'Ultimativniyat sportno-eleganten chasovnik s dizain na Gerald Genta i porozhdasht ogromen interes.',
          price: '$120,000'
        }
      ];
      await Watch.insertMany(initialWatches);
      console.log('Seednati sa nachalnite chasovnici!');
    }
  } catch (error) {
    console.error('Problem sys seedvaneto:', error);
  }
}

// endpoints na prilozhenieto
app.get('/api/watches', async (req, res) => {
  try {
    const watches = await Watch.find();
    res.json(watches);
  } catch (err) {
    res.status(500).json({ message: 'Greshka pri vzimane na chasovnicite' });
  }
});

app.post('/api/watches', async (req, res) => {
  const { name, brand, imageUrl, description, price } = req.body;
  if (!name || !brand || !imageUrl || !description) {
    return res.status(400).json({ message: 'Molya, popalnete vsichki zadaljitelni poleta!' });
  }

  try {
    const newWatch = new Watch({ name, brand, imageUrl, description, price: price || 'N/A' });
    const savedWatch = await newWatch.save();
    res.status(201).json(savedWatch);
  } catch (err) {
    res.status(400).json({ message: 'Greshka pri zapis na chasovnika' });
  }
});

app.delete('/api/watches/:id', async (req, res) => {
  try {
    const deletedWatch = await Watch.findByIdAndDelete(req.params.id);
    if (!deletedWatch) {
      return res.status(404).json({ message: 'Chasovnikat ne e nameren!' });
    }
    res.json({ message: 'Chasovnikat e iztrit!' });
  } catch (err) {
    res.status(500).json({ message: 'Greshka pri triene na chasovnika' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
