const express = require('express');
const cors = require('cors');
const dns = require('dns');
const { URL } = require('url');
const path = require('path');

const app = express();

// Middlewares
app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// In-memory storage
let urls = [];
let idCounter = 1;

// Serve a form at root (optional)
app.get('/', (req, res) => {
  res.render('index');
});

// POST new URL
app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;

  console.log('Received URL:', url);

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }

    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        console.log('DNS lookup failed:', err);
        return res.json({ error: 'invalid url' });
      } else {
        const shortUrl = idCounter++;
        urls.push({ original_url: url, short_url: shortUrl });
        console.log('Stored URLs:', urls);

        return res.json({
          original_url: url,
          short_url: shortUrl
        });
      }
    });

  } catch (err) {
    console.log('Invalid URL:', err.message);
    return res.json({ error: 'invalid url' });
  }
});

// Redirect short URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  console.log('Requested short_url:', shortUrl);

  const found = urls.find(entry => entry.short_url === shortUrl);

  if (found) {
    console.log('Redirecting to:', found.original_url);
    return res.redirect(found.original_url);
  } else {
    console.log('Short URL not found');
    return res.json({ error: 'No short URL found for given input' });
  }
});

// Listen on Render's port or local 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`URL Shortener Microservice listening on port ${PORT}`);
});
