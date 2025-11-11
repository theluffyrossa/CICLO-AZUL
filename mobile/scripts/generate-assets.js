const fs = require('fs');
const path = require('path');

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create a simple SVG icon (1024x1024) - Blue circle with text
const iconSvg = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1E88E5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0D47A1;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="512" cy="512" r="512" fill="url(#blueGrad)"/>
  <text x="512" y="480" font-family="Arial, sans-serif" font-size="180" font-weight="bold" fill="white" text-anchor="middle">CICLO</text>
  <text x="512" y="640" font-family="Arial, sans-serif" font-size="180" font-weight="bold" fill="white" text-anchor="middle">AZUL</text>
  <circle cx="512" cy="280" r="80" fill="white" opacity="0.9"/>
  <path d="M 480 750 Q 512 800 544 750" stroke="white" stroke-width="12" fill="none" opacity="0.8"/>
</svg>`;

// Create a simple SVG splash (1284x2778 - iPhone aspect ratio)
const splashSvg = `<svg width="1284" height="2778" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#0D47A1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1E88E5;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1284" height="2778" fill="url(#bgGrad)"/>
  <circle cx="642" cy="1000" r="200" fill="white" opacity="0.9"/>
  <text x="642" y="1480" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="white" text-anchor="middle">CICLO AZUL</text>
  <text x="642" y="1620" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle" opacity="0.8">Gestão de Resíduos Sólidos</text>
</svg>`;

// Save SVG files
fs.writeFileSync(path.join(assetsDir, 'icon.svg'), iconSvg);
fs.writeFileSync(path.join(assetsDir, 'splash.svg'), splashSvg);

console.log('✅ Asset files created successfully!');
console.log('📁 Location:', assetsDir);
console.log('📄 Files: icon.svg, splash.svg');
console.log('\n⚠️  Note: For production, replace these with proper PNG files.');
