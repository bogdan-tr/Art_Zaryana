#!/usr/bin/env node

/**
 * Collection Generator Script
 * Makes creating and managing collections much easier
 * 
 * Usage: node generate-collections.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function to validate and clean filenames
function validateFilename(filename) {
  const clean = filename.trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-') // Replace invalid chars with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  
  return clean;
}

// Read existing collections data
function getCollectionsData() {
  const collectionsFile = path.join(__dirname, 'collections.json');
  if (fs.existsSync(collectionsFile)) {
    return JSON.parse(fs.readFileSync(collectionsFile, 'utf8'));
  }
  return {};
}

// Save collections data
function saveCollectionsData(data) {
  const collectionsFile = path.join(__dirname, 'collections.json');
  fs.writeFileSync(collectionsFile, JSON.stringify(data, null, 2));
}

// Read existing artworks from index.html
function getArtworksFromIndex() {
  const indexPath = path.join(__dirname, 'index.html');
  if (!fs.existsSync(indexPath)) {
    return [];
  }
  
  const content = fs.readFileSync(indexPath, 'utf8');
  const artworks = [];
  
  // Find all art cards in the main gallery (not in series section)
  const artCardRegex = /<a\s+href="([^"]+)"\s+class="art-card">[\s\S]*?<h3\s+class="art-name">([^<]+)<\/h3>[\s\S]*?<p\s+class="art-description">([^<]+)<\/p>[\s\S]*?<p\s+class="art-price">([^<]+)<\/p>[\s\S]*?<span\s+class="art-status">([^<]+)<\/span>[\s\S]*?<\/a>/g;
  
  let match;
  while ((match = artCardRegex.exec(content)) !== null) {
    artworks.push({
      filename: match[1],
      title: match[2].trim(),
      description: match[3].trim(),
      price: match[4].trim(),
      availability: match[5].trim()
    });
  }
  
  return artworks;
}

// Remove artwork from index.html
function removeArtworkFromIndex(artworkFilename) {
  const indexPath = path.join(__dirname, 'index.html');
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Find and remove the specific art card
  const artCardRegex = new RegExp(`<a\\s+href="${artworkFilename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s+class="art-card"[\\s\\S]*?<\\/a>`, 'g');
  content = content.replace(artCardRegex, '');
  
  fs.writeFileSync(indexPath, content);
  return true;
}

// Update index.html series section with new collection
function updateIndexSeries(collection) {
  const indexPath = path.join(__dirname, 'index.html');
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Find the series-grid div
  const seriesGridStart = content.indexOf('<div class="series-grid">');
  if (seriesGridStart === -1) {
    throw new Error('Could not find series-grid div in index.html');
  }
  
  // Find the last existing series-card and insert after it
  const seriesCardRegex = /<a[^>]*class="series-card"[^>]*>[\s\S]*?<\/a>/g;
  const seriesCards = content.match(seriesCardRegex) || [];
  
  if (seriesCards.length === 0) {
    throw new Error('Could not find existing series cards in index.html');
  }
  
  const lastCard = seriesCards[seriesCards.length - 1];
  const lastCardEnd = content.indexOf(lastCard) + lastCard.length;
  
  // Calculate collection stats
  const availableArtworks = collection.artworks.filter(a => a.availability.toLowerCase() === 'available').length;
  
  // Generate preview images (use first 2 artworks)
  const previewImages = collection.artworks.slice(0, 2).map((artwork, index) => {
    return `                <img src="${artwork.image}" alt="${artwork.title}" class="preview-img preview-img-${index + 1}">`;
  }).join('\n');
  
  // Create new series card
  const newSeriesCard = `          <a href="collections/${collection.filename}" class="series-card">
            <div class="series-preview">
              <div class="preview-images">
${previewImages}
              </div>
              <div class="series-overlay">
                <span class="view-collection">View Collection</span>
              </div>
            </div>
            <div class="series-info">
              <h3 class="series-name">${collection.name}</h3>
              <div class="series-stats">
                <span class="series-count">${collection.artworks.length} Artworks</span>
                <span class="series-available">${availableArtworks} Available</span>
              </div>
              <p class="series-description">${collection.description.substring(0, 100)}${collection.description.length > 100 ? '...' : ''}</p>
            </div>
          </a>`;
  
  // Insert new card after the last existing card
  const updatedContent = content.slice(0, lastCardEnd) + 
                       '\n' + newSeriesCard + '\n        ' + 
                       content.slice(lastCardEnd);
  
  fs.writeFileSync(indexPath, updatedContent);
  return true;
}

// HTML template for collection page
function getCollectionHTMLTemplate(data) {
  return `<!doctype html>
<html lang="en">
  <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
  <script>
    emailjs.init("0NSJYK5U3mp5S7SeV"); //
  </script>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Art Zaryana Gallery - ${data.name}</title>
    <link rel="stylesheet" href="collections.css" />
    <link
      href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&family=Tangerine:wght@400;700&display=swap"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
      rel="stylesheet"
    />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
    />
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
  </head>
  <body>
    <style>
body {
  font-family: "Montserrat", sans-serif;
  line-height: 1.6;
  /* background-color: #0a0a0a; */
  background:
    linear-gradient(to bottom, ${data.backgroundOverlay || 'rgba(64, 0, 109, 0.8)'}, rgba(0, 0, 0, 1)),
    url("${data.backgroundImage || 'collection_bgs/stole-3419985_1920.jpg'}");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  color: #e0e0e0;
  overflow-x: hidden;
}
    </style>
    <nav>
      <div class="site-name">Art Zaryana</div>
      <ul class="nav-links">
        <li><a href="../index.html">Home</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>

      <input type="checkbox" id="hamburger-toggle" class="hamburger-toggle" />
      <label for="hamburger-toggle" class="hamburger">
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
      </label>
    </nav>

    <div class="off-screen-menu">
      <ul>
        <li><a href="../index.html">Home</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </div>

    <main class="gallery-container">
      <section id="gallery" class="gallery-section">
        <div class="section-header">
          <h2>${data.name}</h2>
          <p>
            ${data.description}
          </p>
        </div>

        <div class="art-grid">
          ${data.artworks.map(artwork => getArtworkCardTemplate(artwork)).join('\n')}
        </div>
      </section>

      <section id="contact" class="contact-section">
        <div class="contact-container">
          <div class="contact-info">
            <h2>Interested in buying the collection?</h2>
            <p>
              Have a question about an artwork or this collection? I'd love to
              hear from you.
            </p>
            <div class="contact-details">
              <div class="contact-item">
                <span class="contact-icon">📧</span>
                <div>
                  <h3>Email</h3>
                  <p>oleseattle@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          <div class="contact-form">
            <form id="contactForm">
              <h3>Send a Message</h3>
              <div class="form-group">
                <input
                  type="text"
                  placeholder="Your Name"
                  name="contactName"
                  id="contactName"
                  required
                />
              </div>
              <div class="form-group">
                <input
                  type="email"
                  placeholder="Your Email"
                  name="contactEmail"
                  id="contactEmail"
                  required
                />
              </div>
              <div class="form-group">
                <textarea
                  placeholder="Your Message"
                  name="contactMessage"
                  id="contactMessage"
                  rows="3"
                  required
                ></textarea>
              </div>
              <button type="submit" class="submit-btn">Send Message</button>
            </form>
          </div>
        </div>
      </section>
    </main>

    <footer>
      <div class="stars-container footer-stars">
        <div
          class="star star-small"
          style="top: 10%; left: 20%; animation-delay: 0s"
        ></div>
        <div
          class="star star-medium"
          style="top: 15%; left: 70%; animation-delay: 0.7s"
        ></div>
        <div
          class="star star-small"
          style="top: 25%; left: 40%; animation-delay: 1.4s"
        ></div>
        <div
          class="star star-medium"
          style="top: 30%; left: 85%; animation-delay: 0.3s"
        ></div>
        <div
          class="star star-small"
          style="top: 40%; left: 15%; animation-delay: 1.1s"
        ></div>
        <div
          class="star star-medium"
          style="top: 45%; left: 55%; animation-delay: 1.8s"
        ></div>
        <div
          class="star star-small"
          style="top: 55%; left: 30%; animation-delay: 0.5s"
        ></div>
        <div
          class="star star-medium"
          style="top: 60%; left: 75%; animation-delay: 1.2s"
        ></div>
        <div
          class="star star-small"
          style="top: 70%; left: 10%; animation-delay: 1.9s"
        ></div>
        <div
          class="star star-medium"
          style="top: 75%; left: 45%; animation-delay: 0.8s"
        ></div>
        <div
          class="star star-small"
          style="top: 80%; left: 80%; animation-delay: 1.5s"
        ></div>
        <div
          class="star star-medium"
          style="top: 85%; left: 25%; animation-delay: 0.2s"
        ></div>
        <div
          class="star star-small"
          style="top: 90%; left: 60%; animation-delay: 1.6s"
        ></div>
      </div>
      <div class="footer-content">
        <div class="footer-section">
          <h3>Art Zaryana</h3>
          <p>Art that speaks to the soul.</p>
        </div>
        <div class="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#gallery">Gallery</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Follow</h4>
          <p>Stay connected for new works!</p>
          <div class="social-links">
            <a
              href="https://www.instagram.com/art_zaryana/"
              target="_blank"
              class="social-icon instagram"
            >
              <i class="fab fa-instagram"></i>
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=100082963551065"
              target="_blank"
              class="social-icon facebook"
            >
              <i class="fab fa-facebook-f"></i>
            </a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 Art Zaryana. All rights reserved.</p>
      </div>
    </footer>

    <script>
      function checkVisibility() {
        const elements = document.querySelectorAll('.art-card, .section-header, .about-section, .contact-section');
        
        elements.forEach(element => {
          const rect = element.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
          
          if (isVisible) {
            element.classList.add('visible');
          }
        });
      }

      // Run on page load and scroll
      window.addEventListener('load', checkVisibility);
      window.addEventListener('scroll', checkVisibility);
      checkVisibility();
      
      document.addEventListener("DOMContentLoaded", function () {
        const offScreenMenu = document.querySelector(".off-screen-menu");
        const hamMenuToggle = document.getElementById("hamburger-toggle");

        // Toggle hamburger menu
        hamMenuToggle.addEventListener("change", () => {
          offScreenMenu.classList.toggle("active");
        });

        // Smooth scrolling for all navigation links
        const navLinks = document.querySelectorAll('a[href^="#"]');

        navLinks.forEach((link) => {
          link.addEventListener("click", function (e) {
            e.preventDefault();

            const targetId = this.getAttribute("href");
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
              targetElement.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });

              // Close mobile menu if open
              hamMenuToggle.checked = false;
              offScreenMenu.classList.remove("active");
            }
          });
        });

        // Form submission
        document
          .getElementById("contactForm")
          .addEventListener("submit", function (e) {
            e.preventDefault(); // prevent normal form submission

            emailjs
              .sendForm(
                "service_c40osld", // from EmailJS dashboard
                "template_v2deo3f", // from EmailJS template
                this, // the form element
              )
              .then(
                function () {
                  alert("Message sent! I respond soon.");
                },
                function (error) {
                  console.error("FAILED...", error);
                  alert("Oops, something went wrong. Try again later.");
                },
              );
          });

        // Add scroll effect to nav
        window.addEventListener("scroll", function () {
          const nav = document.querySelector("nav");
          if (window.scrollY > 100) {
            nav.style.background = "rgba(0, 0, 0, 0.98)";
          } else {
            nav.style.background = "rgba(0, 0, 0, 0.95)";
          }
        });
      });
    </script>
  </body>
</html>`;
}

// Artwork card template for collection pages
function getArtworkCardTemplate(artwork) {
  return `          <a href="../${artwork.filename}" class="art-card">
            <div class="art-image-container">
              <img
                src="../${artwork.image}"
                alt="${artwork.title}"
                class="art-image"
              />
              <div class="art-overlay">
                <span class="view-details">View Details</span>
              </div>
            </div>
            <div class="art-info">
              <h3 class="art-name">${artwork.title}</h3>
              <p class="art-description">${artwork.description}</p>
              <div class="art-footer">
                <p class="art-price">${artwork.price}</p>
                <span class="art-status">${artwork.availability}</span>
              </div>
            </div>
          </a>`;
}

// Simple prompt function
function prompt(question, defaultValue = '') {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer || defaultValue);
    });
  });
}

// Create new collection
async function createNewCollection() {
  colorLog('bright', 'Create a New Collection\n');
  
  const name = await prompt('Collection name: ');
  if (!name.trim()) throw new Error('Collection name is required');
  
  const description = await prompt('Collection description: ');
  if (!description.trim()) throw new Error('Collection description is required');
  
  const filename = await prompt('HTML filename (without .html extension): ');
  if (!filename.trim()) throw new Error('Filename is required');
  
  const cleanFilename = validateFilename(filename.trim());
  if (!cleanFilename) throw new Error('Filename contains no valid characters');
  
  const fullFilename = `${cleanFilename}.html`;
  const collectionPath = path.join(__dirname, 'collections', fullFilename);
  
  if (fs.existsSync(collectionPath)) {
    const overwrite = await prompt(`Collection ${fullFilename} already exists. Overwrite? (y/N): `, 'n');
    if (overwrite.toLowerCase() !== 'y') {
      throw new Error('Operation cancelled - collection already exists');
    }
  }
  
  const backgroundImage = await prompt('Background image path (relative to collections/, default: collection_bgs/stole-3419985_1920.jpg): ', 'collection_bgs/stole-3419985_1920.jpg');
  const backgroundOverlay = await prompt('Background overlay color (default: rgba(64, 0, 109, 0.8)): ', 'rgba(64, 0, 109, 0.8)');
  
  // Validate background image exists
  const bgImagePath = path.join(__dirname, 'collections', backgroundImage.trim());
  if (!fs.existsSync(bgImagePath)) {
    colorLog('yellow', `⚠️  Warning: Background image not found at ${backgroundImage}`);
    const continueAnyway = await prompt('Continue anyway? (y/N): ', 'n');
    if (continueAnyway.toLowerCase() !== 'y') {
      throw new Error('Setup cancelled - please ensure background image path is correct');
    }
  }
  
  const collectionsData = getCollectionsData();
  collectionsData[cleanFilename] = {
    name: name.trim(),
    description: description.trim(),
    filename: fullFilename,
    backgroundImage: backgroundImage.trim(),
    backgroundOverlay: backgroundOverlay.trim(),
    artworks: []
  };
  saveCollectionsData(collectionsData);
  
  // Create collection HTML file
  const collectionHTML = getCollectionHTMLTemplate({
    name: name.trim(),
    description: description.trim(),
    backgroundImage: backgroundImage.trim(),
    backgroundOverlay: backgroundOverlay.trim(),
    artworks: []
  });
  
  fs.writeFileSync(collectionPath, collectionHTML);
  colorLog('green', `✅ Created collection: ${fullFilename}`);
  
  // Update index.html series section
  const collectionData = collectionsData[cleanFilename];
  updateIndexSeries(collectionData);
  colorLog('green', `✅ Added collection to main gallery series section`);
  
  // Ask if user wants to add artworks now
  const addArtworks = await prompt('Add artworks to this collection now? (y/N): ', 'n');
  if (addArtworks.toLowerCase() === 'y') {
    await addArtworksToCollection(cleanFilename);
  }
  
  return collectionsData[cleanFilename];
}

// Add artworks to existing collection
async function addArtworksToCollection(collectionKey) {
  const collectionsData = getCollectionsData();
  if (!collectionsData[collectionKey]) {
    throw new Error(`Collection ${collectionKey} not found`);
  }
  
  const collection = collectionsData[collectionKey];
  colorLog('bright', `\nAdding Artworks to "${collection.name}"\n`);
  
  const availableArtworks = getArtworksFromIndex();
  if (availableArtworks.length === 0) {
    colorLog('yellow', '⚠️  No artworks available in main gallery to add to collection.');
    return;
  }
  
  colorLog('cyan', 'Available artworks in main gallery:');
  availableArtworks.forEach((artwork, index) => {
    console.log(`  ${index + 1}. ${artwork.title} (${artwork.filename})`);
  });
  
  const selectedIndexes = await prompt('Enter artwork numbers to add (comma-separated): ');
  if (!selectedIndexes.trim()) return;
  
  const indexesToAdd = selectedIndexes.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0 && n <= availableArtworks.length);
  
  if (indexesToAdd.length === 0) {
    colorLog('yellow', '⚠️  No valid artwork numbers selected.');
    return;
  }
  
  // Get image paths for selected artworks
  for (let index of indexesToAdd) {
    const artwork = availableArtworks[index - 1];
    const artworkPath = path.join(__dirname, artwork.filename);
    
    if (!fs.existsSync(artworkPath)) {
      colorLog('yellow', `⚠️  Warning: Artwork file ${artwork.filename} not found`);
      continue;
    }
    
    // Extract image path from artwork HTML
    const artworkContent = fs.readFileSync(artworkPath, 'utf8');
    const imageMatch = artworkContent.match(/<img[^>]*src="([^"]+)"[^>]*alt="([^"]+)"[^>]*class="artwork-image"/);
    
    if (imageMatch) {
      const artworkData = {
        filename: artwork.filename,
        title: artwork.title,
        description: artwork.description,
        price: artwork.price,
        availability: artwork.availability,
        image: imageMatch[1]
      };
      
      // Add to collection if not already there
      if (!collection.artworks.find(a => a.filename === artwork.filename)) {
        collection.artworks.push(artworkData);
        
        // Remove from main index.html
        removeArtworkFromIndex(artwork.filename);
        
        colorLog('green', `✅ Added "${artwork.title}" to collection and removed from main gallery`);
      } else {
        colorLog('yellow', `⚠️  "${artwork.title}" is already in this collection`);
      }
    } else {
      colorLog('red', `❌ Could not extract image information from ${artwork.filename}`);
    }
  }
  
  // Update collection data and HTML
  saveCollectionsData(collectionsData);
  
  const collectionHTML = getCollectionHTMLTemplate(collection);
  const collectionPath = path.join(__dirname, 'collections', collection.filename);
  fs.writeFileSync(collectionPath, collectionHTML);
  
  colorLog('green', `✅ Updated collection: ${collection.filename}`);
  
  // Update index.html series section with updated collection info
  updateIndexSeries(collection);
  colorLog('green', `✅ Updated collection in main gallery series section`);
}

// List existing collections
function listCollections() {
  const collectionsData = getCollectionsData();
  const collections = Object.keys(collectionsData);
  
  if (collections.length === 0) {
    colorLog('yellow', 'No collections found.');
    return;
  }
  
  colorLog('bright', 'Existing Collections:\n');
  collections.forEach((key, index) => {
    const collection = collectionsData[key];
    console.log(`  ${index + 1}. ${collection.name} (${collection.filename})`);
    console.log(`     ${collection.artworks.length} artworks`);
    console.log(`     ${collection.description.substring(0, 60)}${collection.description.length > 60 ? '...' : ''}\n`);
  });
}

// Main function
async function main() {
  colorLog('cyan', '\n🎨 Collection Generator for OlesArt Gallery');
  colorLog('yellow', '======================================\n');
  
  try {
    // Validate that we're in the right directory
    const indexPath = path.join(__dirname, 'index.html');
    if (!fs.existsSync(indexPath)) {
      throw new Error('index.html not found. Please run this script from the OlesArt project directory.');
    }
    
    // Create backup of index.html
    const backupPath = path.join(__dirname, 'index.html.backup');
    fs.copyFileSync(indexPath, backupPath);
    colorLog('blue', '📋 Created backup of index.html');
    
    while (true) {
      colorLog('bright', 'What would you like to do?');
      console.log('  1. Create a new collection');
      console.log('  2. Add artworks to existing collection');
      console.log('  3. List existing collections');
      console.log('  4. Exit');
      
      const choice = await prompt('\nEnter your choice (1-4): ');
      
      switch (choice.trim()) {
        case '1':
          await createNewCollection();
          break;
        case '2':
          await selectCollectionForAdding();
          break;
        case '3':
          listCollections();
          break;
        case '4':
          colorLog('green', '\n👋 Goodbye!');
          process.exit(0);
        default:
          colorLog('red', 'Invalid choice. Please enter 1-4.');
      }
      
      colorLog('\n', '');
    }
    
  } catch (error) {
    colorLog('red', `\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Select collection for adding artworks
async function selectCollectionForAdding() {
  const collectionsData = getCollectionsData();
  const collections = Object.keys(collectionsData);
  
  if (collections.length === 0) {
    colorLog('yellow', 'No collections found. Please create a collection first.');
    return;
  }
  
  colorLog('bright', 'Select a Collection:\n');
  collections.forEach((key, index) => {
    const collection = collectionsData[key];
    console.log(`  ${index + 1}. ${collection.name} (${collection.artworks.length} artworks)`);
  });
  
  const choice = await prompt('\nEnter collection number: ');
  const index = parseInt(choice.trim()) - 1;
  
  if (index >= 0 && index < collections.length) {
    await addArtworksToCollection(collections[index]);
  } else {
    colorLog('red', 'Invalid collection number.');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { 
  getCollectionHTMLTemplate, 
  getArtworkCardTemplate, 
  validateFilename,
  updateIndexSeries 
};
