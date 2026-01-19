#!/usr/bin/env node

/**
 * Artwork Generator Script
 * Makes adding new artpieces to OlesArt gallery much easier
 * 
 * Usage: node generate-artwork.js
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

// HTML template for new artwork
function getArtworkHTMLTemplate(data) {
  return `<!doctype html>
<html lang="en">
  <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
  <script>
    emailjs.init("0NSJYK5U3mp5S7SeV"); //
  </script>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${data.title} - Art Zaryana Gallery</title>
    <link rel="stylesheet" href="artwork-style.css" />
    <link
      href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&family=Tangerine:wght@400;700&display=swap"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <nav>
      <div class="site-name">Art Zaryana</div>
      <ul class="nav-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="index.html#gallery">Gallery</a></li>
        <li><a href="index.html#contact">Contact</a></li>
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
        <li><a href="index.html">Home</a></li>
        <li><a href="index.html#gallery">Gallery</a></li>
        <li><a href="index.html#contact">Contact</a></li>
      </ul>
    </div>

    <main>
      <div class="artwork-hero">
        <div class="image-container">
          <button class="nav-arrow nav-arrow-left" id="prevImage">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <img
            src="${data.mainImage}"
            alt="${data.title}"
            class="artwork-image"
            id="mainImage"
          />
          <button class="nav-arrow nav-arrow-right" id="nextImage">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
          <div class="image-counter" id="imageCounter">1 / ${data.images.length}</div>
        </div>
        <div class="thumbnail-container" id="thumbnailContainer"></div>
      </div>

      <div class="artwork-details">
        <div class="details-grid">
          <div class="main-info">
            <h1 class="artwork-title">${data.title}</h1>
            <p class="artwork-price">${data.price}</p>

            <div class="description-section">
              <h2>Description</h2>
              ${data.description.split('\n').map(p => `<p>${p}</p>`).join('')}
            </div>

            <div class="cta-buttons">
              <button class="btn-primary" id="purchaseBtn">
                Request Purchase
              </button>
              <button class="btn-secondary" id="contactBtn">Contact me</button>
            </div>
          </div>

          <div class="specifications">
            <h2>Specifications</h2>
            <div class="spec-item">
              <span class="spec-label">Medium:</span>
              <span class="spec-value">${data.medium}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Dimensions:</span>
              <span class="spec-value">${data.dimensions}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Year:</span>
              <span class="spec-value">${data.year}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Frame:</span>
              <span class="spec-value">${data.frame}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Availability:</span>
              <span class="spec-value status-${data.availability.toLowerCase()}">${data.availability}</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Purchase Modal -->
    <div id="purchaseModal" class="modal">
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Request Purchase</h2>
        <p class="modal-subtitle">
          Complete the form below to initiate a secure purchase
        </p>

        <form id="purchaseForm">
          <div class="form-section">
            <h3>Personal Information</h3>
            <div class="form-group">
              <label for="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                required
                placeholder="John Doe"
              />
            </div>

            <div class="form-group">
              <label for="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="john@example.com"
              />
            </div>

            <div class="form-group">
              <label for="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div class="form-section">
            <h3>Shipping Information</h3>
            <div class="form-group">
              <label for="address">Street Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                required
                placeholder="123 Main Street"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  placeholder="New York"
                />
              </div>

              <div class="form-group">
                <label for="state">State/Province *</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  required
                  placeholder="NY"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="zip">ZIP/Postal Code *</label>
                <input
                  type="text"
                  id="zip"
                  name="zip"
                  required
                  placeholder="10001"
                />
              </div>

              <div class="form-group">
                <label for="country">Country *</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  required
                  placeholder="United States"
                />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Additional Information</h3>
            <div class="form-group">
              <label for="message">Message (Optional)</label>
              <textarea
                id="message"
                name="message"
                rows="4"
                placeholder="Any special requests or questions..."
              ></textarea>
            </div>
          </div>

          <div class="payment-options">
            <div class="payment-option">
              <input
                type="radio"
                id="directContact"
                name="paymentMethod"
                value="contact"
              />
              <label for="directContact">
                <span class="option-title">Direct Contact</span>
                <span class="option-desc"
                  >I will reach out back to you directly to arrange payment and
                  delivery</span
                >
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" id="cancelBtn">
              Cancel
            </button>
            <button type="submit" class="btn-submit">Submit Request</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Contact Modal -->
    <div id="contactModal" class="modal">
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Contact me</h2>
        <p class="modal-subtitle">
          I'll be happy to respond to your questions or comments.
        </p>

        <form id="contactForm">
          <div class="form-group">
            <label for="contactName">Name *</label>
            <input
              type="text"
              id="contactName"
              name="contactName"
              required
              placeholder="Your name"
            />
          </div>

          <div class="form-group">
            <label for="contactEmail">Email *</label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              required
              placeholder="your@email.com"
            />
          </div>

          <div class="form-group">
            <label for="contactMessage">Message *</label>
            <textarea
              id="contactMessage"
              name="contactMessage"
              rows="6"
              required
              placeholder="Ask about the artwork, shipping, or any other questions..."
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" id="contactCancelBtn">
              Cancel
            </button>
            <button type="submit" class="btn-submit">Send Message</button>
          </div>
        </form>
      </div>
    </div>

    <footer>
      <p>&copy; 2025 Art Zaryana. All rights reserved.</p>
    </footer>

    <script>
      document.addEventListener("DOMContentLoaded", function () {
        const offScreenMenu = document.querySelector(".off-screen-menu");
        const hamMenuToggle = document.getElementById("hamburger-toggle");

        hamMenuToggle.addEventListener("change", () => {
          offScreenMenu.classList.toggle("active");
        });

        // Image gallery functionality
        const images = ${JSON.stringify(data.images, null, 8)};

        let currentImageIndex = 0;
        const mainImage = document.getElementById("mainImage");
        const prevBtn = document.getElementById("prevImage");
        const nextBtn = document.getElementById("nextImage");
        const imageCounter = document.getElementById("imageCounter");
        const thumbnailContainer =
          document.getElementById("thumbnailContainer");

        function updateGallery() {
          mainImage.src = images[currentImageIndex];
          imageCounter.textContent = \`\${currentImageIndex + 1} / \${images.length}\`;

          document.querySelectorAll(".thumbnail").forEach((thumb, index) => {
            thumb.classList.toggle("active", index === currentImageIndex);
          });

          if (images.length <= 1) {
            prevBtn.style.display = "none";
            nextBtn.style.display = "none";
            imageCounter.style.display = "none";
          }
        }

        function createThumbnails() {
          if (images.length <= 1) {
            thumbnailContainer.style.display = "none";
            return;
          }

          images.forEach((src, index) => {
            const thumb = document.createElement("div");
            thumb.className = "thumbnail";
            if (index === 0) thumb.classList.add("active");

            const img = document.createElement("img");
            img.src = src;
            img.alt = \`View \${index + 1}\`;

            thumb.appendChild(img);
            thumb.addEventListener("click", () => {
              currentImageIndex = index;
              updateGallery();
            });

            thumbnailContainer.appendChild(thumb);
          });
        }

        function showNextImage() {
          currentImageIndex = (currentImageIndex + 1) % images.length;
          updateGallery();
        }

        function showPrevImage() {
          currentImageIndex =
            (currentImageIndex - 1 + images.length) % images.length;
          updateGallery();
        }

        nextBtn.addEventListener("click", showNextImage);
        prevBtn.addEventListener("click", showPrevImage);

        document.addEventListener("keydown", (e) => {
          if (e.key === "ArrowRight") {
            showNextImage();
          } else if (e.key === "ArrowLeft") {
            showPrevImage();
          }
        });

        createThumbnails();
        updateGallery();

        // Modal functionality
        const purchaseModal = document.getElementById("purchaseModal");
        const contactModal = document.getElementById("contactModal");
        const purchaseBtn = document.getElementById("purchaseBtn");
        const contactBtn = document.getElementById("contactBtn");
        const cancelBtn = document.getElementById("cancelBtn");
        const contactCancelBtn = document.getElementById("contactCancelBtn");
        const closeBtns = document.getElementsByClassName("close");

        purchaseBtn.onclick = () => {
          purchaseModal.style.display = "block";
          document.body.style.overflow = "hidden";
        };

        contactBtn.onclick = () => {
          contactModal.style.display = "block";
          document.body.style.overflow = "hidden";
        };

        cancelBtn.onclick = () => {
          purchaseModal.style.display = "none";
          document.body.style.overflow = "auto";
        };

        contactCancelBtn.onclick = () => {
          contactModal.style.display = "none";
          document.body.style.overflow = "auto";
        };

        Array.from(closeBtns).forEach((btn) => {
          btn.onclick = function () {
            purchaseModal.style.display = "none";
            contactModal.style.display = "none";
            document.body.style.overflow = "auto";
          };
        });

        window.onclick = (event) => {
          if (event.target == purchaseModal) {
            purchaseModal.style.display = "none";
            document.body.style.overflow = "auto";
          }
          if (event.target == contactModal) {
            contactModal.style.display = "none";
            document.body.style.overflow = "auto";
          }
        };

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
        document
          .getElementById("purchaseForm")
          .addEventListener("submit", function (e) {
            e.preventDefault(); // prevent normal form submission

            emailjs
              .sendForm(
                "service_c40osld", // from EmailJS dashboard
                "template_9ptxv7o", // from EmailJS template
                this, // the form element
              )
              .then(
                function () {
                  alert("Message sent! I will respond soon.");
                },
                function (error) {
                  console.error("FAILED...", error);
                  alert("Oops, something went wrong. Try again later.");
                },
              );
          });
      });
    </script>
  </body>
</html>`;
}

// Gallery card HTML template
function getGalleryCardTemplate(data, filename) {
  return `          <a href="${filename}" class="art-card">
            <div class="art-image-container">
              <img
                src="${data.mainImage}"
                alt="${data.title}"
                class="art-image"
              />
              <div class="art-overlay">
                <span class="view-details">View Details</span>
              </div>
            </div>
            <div class="art-info">
              <h3 class="art-name">${data.title}</h3>
              <p class="art-description">${data.shortDescription}</p>
              <div class="art-footer">
                <p class="art-price">${data.price}</p>
                <span class="art-status">${data.availability}</span>
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

// Main function
async function main() {
  colorLog('cyan', '\n🎨 Artwork Generator for OlesArt Gallery');
  colorLog('yellow', '=====================================\n');
  
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
    
    // Get artwork details
    colorLog('bright', 'Please enter the artwork details:\n');
    
    const title = await prompt('Artwork title: ');
    if (!title.trim()) throw new Error('Artwork title is required');
    
    const price = await prompt('Price (e.g., $450): ');
    if (!price.trim()) throw new Error('Price is required');
    
    const shortDescription = await prompt('Short description (for gallery card): ');
    if (!shortDescription.trim()) throw new Error('Short description is required');
    
    const description = await prompt('Full description (use \\n for paragraphs): ');
    if (!description.trim()) throw new Error('Full description is required');
    
    const medium = await prompt('Medium (e.g., Oil on Canvas): ');
    if (!medium.trim()) throw new Error('Medium is required');
    
    const dimensions = await prompt('Dimensions (e.g., 18" × 24" (45cm × 60cm)): ');
    if (!dimensions.trim()) throw new Error('Dimensions are required');
    
    const year = await prompt('Year: ', new Date().getFullYear().toString());
    if (!year.trim()) throw new Error('Year is required');
    
    const frame = await prompt('Frame (e.g., Can be requested): ', 'Can be requested');
    const availability = await prompt('Availability (Available/Sold): ', 'Available');
    
    // Get images
    colorLog('\nbright', 'Image paths (relative to project root):');
    const mainImage = await prompt('Main image path (e.g., Artpieces/artwork_name.jpg): ');
    if (!mainImage.trim()) throw new Error('Main image path is required');
    
    // Validate that the main image exists
    const mainImagePath = path.join(__dirname, mainImage.trim());
    if (!fs.existsSync(mainImagePath)) {
      colorLog('yellow', `⚠️  Warning: Main image file not found at ${mainImage}`);
      const continueAnyway = await prompt('Continue anyway? (y/N): ', 'n');
      if (continueAnyway.toLowerCase() !== 'y') {
        throw new Error('Setup cancelled - please ensure image path is correct');
      }
    }
    
    const additionalImages = [];
    let addMore = true;
    let imageCount = 1;
    
    while (addMore) {
      const image = await prompt(`Additional image ${imageCount} path (or press Enter to skip): `);
      if (image.trim()) {
        additionalImages.push(image);
        imageCount++;
      } else {
        addMore = false;
      }
    }
    
    // Prepare data
    const artworkData = {
      title: title.trim(),
      price: price.trim(),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      medium: medium.trim(),
      dimensions: dimensions.trim(),
      year: year.trim(),
      frame: frame.trim(),
      availability: availability.trim(),
      mainImage: mainImage.trim(),
      images: [mainImage.trim(), ...additionalImages]
    };
    
    // Generate files
    const filename = await prompt('HTML filename (without .html extension, e.g., "golden-way"): ');
    if (!filename.trim()) throw new Error('Filename is required');
    
    // Validate filename
    const cleanFilename = filename.trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-') // Replace invalid chars with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    if (!cleanFilename) throw new Error('Filename contains no valid characters');
    
    const fullFilename = `${cleanFilename}.html`;
    
    // Check if file already exists
    const artworkFilePath = path.join(__dirname, fullFilename);
    if (fs.existsSync(artworkFilePath)) {
      const overwrite = await prompt(`File ${fullFilename} already exists. Overwrite? (y/N): `, 'n');
      if (overwrite.toLowerCase() !== 'y') {
        throw new Error('Setup cancelled - file already exists');
      }
    }
    
    // Create artwork HTML file
    fs.writeFileSync(artworkFilePath, getArtworkHTMLTemplate(artworkData));
    colorLog('green', `✅ Created ${fullFilename}`);
    
    // Update index.html with new gallery card
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Find the art-grid div and insert before its closing tag
    const artGridStart = indexContent.indexOf('<div class="art-grid">');
    if (artGridStart === -1) {
      throw new Error('Could not find .art-grid div in index.html');
    }
    
    // Find the corresponding closing div for art-grid
    let artGridEnd = artGridStart;
    let divCount = 1;
    let pos = artGridStart + '<div class="art-grid">'.length;
    
    while (divCount > 0 && pos < indexContent.length) {
      if (indexContent.substring(pos, pos + 4) === '<div') {
        divCount++;
      } else if (indexContent.substring(pos, pos + 6) === '</div>') {
        divCount--;
        if (divCount === 0) {
          artGridEnd = pos;
          break;
        }
      }
      pos++;
    }
    
    if (artGridEnd === artGridStart) {
      throw new Error('Could not find the end of .art-grid div');
    }
    
    // Insert the new card before the closing </div> of art-grid
    const newCard = getGalleryCardTemplate(artworkData, fullFilename);
    const insertPosition = indexContent.lastIndexOf('</div>', artGridEnd);
    
    if (insertPosition === -1) {
      throw new Error('Could not find insertion point in art-grid');
    }
    
    indexContent = indexContent.slice(0, insertPosition) + 
                   '\n' + newCard + 
                   '\n        ' + 
                   indexContent.slice(insertPosition);
    
    fs.writeFileSync(indexPath, indexContent);
    colorLog('green', `✅ Added gallery card to index.html`);
    
    // Success message
    colorLog('\ngreen', '🎉 Artwork successfully added to the gallery!');
    colorLog('cyan', `\nFiles created/updated:`);
    colorLog('white', `  • ${fullFilename} created (artwork detail page)`);
    colorLog('white', `  • index.html updated (gallery card added)`);
    colorLog('white', `  • index.html.backup created (safety backup)`);
    colorLog('\nyellow', `Next steps:`);
    colorLog('white', `  1. Make sure your images are in the correct path: ${artworkData.mainImage}`);
    if (artworkData.images.length > 1) {
      colorLog('white', `     Additional images: ${artworkData.images.slice(1).join(', ')}`);
    }
    colorLog('white', `  2. Test the new artwork page by opening ${fullFilename}`);
    colorLog('white', `  3. Check that the gallery card appears correctly on the main page`);
    colorLog('white', `  4. Verify the new artwork links to ${fullFilename}`);
    colorLog('green', `\n✨ Your artwork "${artworkData.title}" is now live at ${fullFilename}! ✨`);
    
  } catch (error) {
    colorLog('red', `\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { getArtworkHTMLTemplate, getGalleryCardTemplate, validateFilename };
