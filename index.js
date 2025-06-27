const express = require('express');
const cors = require('cors');
const dns = require('dns');
const { URL } = require('url');
const path = require('path');

const app = express();

app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Simple storage for URLs
let urls = [];
let idCounter = 1;

// Root
// Serve your EJS form at root
app.get('/', (req, res) => {
  res.render('index');
});


// POST new URL
app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }

    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      } else {
        const shortUrl = idCounter++;
        urls.push({ original_url: url, short_url: shortUrl });

        return res.json({
          original_url: url,
          short_url: shortUrl
        });
      }
    });
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }
});

// Redirect short URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);

  const found = urls.find(entry => entry.short_url === shortUrl);

  if (found) {
    return res.redirect(found.original_url);
  } else {
    return res.json({ error: 'No short URL found for given input' });
  }
});

// Listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`URL Shortener Microservice listening on port ${PORT}`);
});
