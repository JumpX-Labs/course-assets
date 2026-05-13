const fs = require('fs');
const path = require('path');

const COURSES_DIR = path.join(__dirname, 'courses');
const OUTPUT_FILE = path.join(__dirname, 'index.html');
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.svg', '.webp', '.gif'];

// Ensure courses directory exists
if (!fs.existsSync(COURSES_DIR)) {
  fs.mkdirSync(COURSES_DIR, { recursive: true });
}

// Helper to format folder name: ai-bootcamp -> Ai Bootcamp
function formatFolderName(name) {
  return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Generate the gallery data
function buildGalleryData() {
  const categories = [];
  
  const folders = fs.readdirSync(COURSES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory());

  for (const folder of folders) {
    const categoryName = formatFolderName(folder.name);
    const categoryPath = path.join(COURSES_DIR, folder.name);
    
    const files = fs.readdirSync(categoryPath, { withFileTypes: true })
      .filter(dirent => dirent.isFile() && ALLOWED_EXTENSIONS.includes(path.extname(dirent.name).toLowerCase()))
      .map(file => {
        const filePath = path.join('courses', folder.name, file.name);
        const stat = fs.statSync(path.join(categoryPath, file.name));
        return {
          filename: file.name,
          path: filePath.replace(/\\/g, '/'), // normalize for web
          mtime: stat.mtimeMs,
          size: (stat.size / 1024).toFixed(1) // KB
        };
      });

    if (files.length > 0) {
      categories.push({
        id: folder.name,
        name: categoryName,
        images: files
      });
    }
  }

  return categories;
}

// Generate HTML
function generateHTML(categories) {
  const timestamp = Date.now();
  
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JumpX Assets Portal</title>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #f4f4f5; /* zinc-100 */
            --surface-color: #ffffff;
            --border-color: #000000;
            --text-primary: #000000;
            --text-secondary: #52525b; /* zinc-600 */
            --accent-color: #ccff00; /* Neon Lime Green */
            --font-sans: 'Inter', sans-serif;
            --font-mono: 'JetBrains Mono', monospace;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-primary);
            font-family: var(--font-sans);
            display: flex;
            min-height: 100vh;
        }

        /* Sidebar Navigation */
        .sidebar {
            width: 280px;
            background-color: var(--bg-color);
            border-right: 2px solid var(--border-color);
            padding: 2rem 1.5rem;
            position: fixed;
            height: 100vh;
            overflow-y: auto;
            z-index: 10;
        }

        .logo {
            font-family: var(--font-mono);
            font-size: 2rem;
            font-weight: 800;
            margin-bottom: 3rem;
            color: var(--text-primary);
            text-transform: uppercase;
            letter-spacing: -1px;
            line-height: 1.1;
            padding-bottom: 1rem;
            border-bottom: 4px solid var(--border-color);
        }

        .logo-x {
            background-color: var(--text-primary);
            color: var(--accent-color);
            padding: 0 4px;
        }

        .nav-label {
            font-family: var(--font-mono);
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: var(--text-secondary);
            margin-bottom: 1rem;
            font-weight: 700;
        }

        .nav-item {
            display: block;
            padding: 0.75rem 1rem;
            color: var(--text-primary);
            text-decoration: none;
            margin-bottom: 0.5rem;
            font-size: 0.85rem;
            font-family: var(--font-mono);
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 700;
            border: 2px solid transparent;
            transition: all 0.1s ease;
        }

        .nav-item:hover, .nav-item.active {
            background-color: var(--accent-color);
            border: 2px solid var(--border-color);
            box-shadow: 3px 3px 0px var(--border-color);
        }

        /* Main Content */
        .main-content {
            flex: 1;
            margin-left: 280px;
            padding: 3rem 4rem;
            max-width: 1800px;
        }

        .header {
            margin-bottom: 4rem;
            padding-bottom: 2rem;
            border-bottom: 2px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }

        .header h1 {
            font-size: 3.5rem;
            font-weight: 900;
            letter-spacing: -2px;
            text-transform: uppercase;
            line-height: 1;
        }

        .meta-info {
            background-color: var(--text-primary);
            color: var(--accent-color);
            padding: 0.5rem 1rem;
            font-family: var(--font-mono);
            font-size: 0.8rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: -4px 4px 0px var(--border-color);
        }

        .category-section {
            margin-bottom: 5rem;
        }

        .category-title {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 2rem;
            color: var(--text-primary);
            text-transform: uppercase;
            letter-spacing: -1px;
            display: inline-block;
            background-color: var(--accent-color);
            padding: 0.2rem 1rem;
            border: 2px solid var(--border-color);
            box-shadow: 4px 4px 0px var(--border-color);
        }

        /* Waterfall / Masonry Layout */
        .gallery-grid {
            column-count: 1;
            column-gap: 2rem;
        }

        @media (min-width: 900px) { .gallery-grid { column-count: 2; } }
        @media (min-width: 1400px) { .gallery-grid { column-count: 3; } }
        @media (min-width: 1800px) { .gallery-grid { column-count: 4; } }

        .asset-card {
            background-color: var(--surface-color);
            border: 2px solid var(--border-color);
            break-inside: avoid;
            margin-bottom: 2rem;
            position: relative;
            box-shadow: 6px 6px 0px var(--border-color);
            transition: transform 0.1s ease, box-shadow 0.1s ease;
        }

        .asset-card:hover {
            transform: translate(-2px, -2px);
            box-shadow: 8px 8px 0px var(--border-color);
        }

        .asset-image-wrapper {
            position: relative;
            background: #e4e4e7;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border-bottom: 2px solid var(--border-color);
        }
        
        .checkerboard {
            background-image: linear-gradient(45deg, #d4d4d8 25%, transparent 25%), 
                              linear-gradient(-45deg, #d4d4d8 25%, transparent 25%), 
                              linear-gradient(45deg, transparent 75%, #d4d4d8 75%), 
                              linear-gradient(-45deg, transparent 75%, #d4d4d8 75%);
            background-size: 20px 20px;
            background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }

        .asset-image {
            width: 100%;
            height: auto;
            display: block;
            object-fit: contain;
            max-height: 500px;
        }

        .asset-info {
            padding: 1.5rem;
            background-color: var(--surface-color);
        }

        .asset-meta-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            font-family: var(--font-mono);
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--text-secondary);
        }

        .asset-name {
            font-family: var(--font-mono);
            font-size: 1rem;
            font-weight: 800;
            margin-bottom: 1.5rem;
            word-break: break-all;
            color: var(--text-primary);
        }

        .copy-btn {
            width: 100%;
            padding: 0.8rem;
            background: var(--bg-color);
            color: var(--text-primary);
            border: 2px solid var(--border-color);
            font-family: var(--font-mono);
            font-weight: 800;
            font-size: 0.85rem;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 3px 3px 0px var(--border-color);
            transition: all 0.1s ease;
        }

        .copy-btn:hover {
            background: var(--accent-color);
            transform: translate(-1px, -1px);
            box-shadow: 4px 4px 0px var(--border-color);
        }

        .copy-btn:active {
            transform: translate(2px, 2px);
            box-shadow: 1px 1px 0px var(--border-color);
        }

        /* Toast Notification */
        .toast {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: var(--text-primary);
            color: var(--accent-color);
            padding: 1.5rem 2rem;
            font-family: var(--font-mono);
            font-weight: 800;
            font-size: 1rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.2s ease-out;
            z-index: 1000;
            border: 2px solid var(--accent-color);
            box-shadow: -8px 8px 0px var(--border-color);
        }

        .toast.show {
            transform: translateY(0);
            opacity: 1;
        }

        /* Empty State */
        .empty-state {
            padding: 6rem 2rem;
            text-align: center;
            color: var(--text-primary);
            font-family: var(--font-mono);
            font-weight: 800;
            font-size: 1.2rem;
            text-transform: uppercase;
            border: 2px dashed var(--border-color);
            background-color: var(--surface-color);
            box-shadow: 8px 8px 0px var(--border-color);
        }
    </style>
</head>
<body>

    <!-- Sidebar Navigation -->
    <aside class="sidebar">
        <div class="logo">Jump<span class="logo-x">X</span><br><span style="font-size: 0.8rem; font-weight: 800; color: var(--text-secondary); letter-spacing: 2px;">Assets_CDN</span></div>
        <div class="nav-label">Directories</div>
        <nav id="nav-menu">
            ${categories.length === 0 ? '<p style="color: var(--text-secondary); font-family: var(--font-mono); font-size: 0.85rem; font-weight: 700;">[EMPTY_SET]</p>' : ''}
            ${categories.map(c => `<a href="#${c.id}" class="nav-item">/${c.id}</a>`).join('\n            ')}
        </nav>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
        <header class="header">
            <div>
                <h1>Global Assets</h1>
                <p style="font-family: var(--font-mono); font-weight: 700; color: var(--text-secondary); margin-top: 0.5rem; text-transform: uppercase; letter-spacing: 1px;">Single Source of Truth Repository</p>
            </div>
            <div class="meta-info">
                SYS.UPDATE: ${new Date().toISOString().split('T')[0]}
            </div>
        </header>

        ${categories.length === 0 ? 
          '<div class="empty-state">ERR: No directories detected in /courses/.</div>' 
        : categories.map(category => `
        <section id="${category.id}" class="category-section">
            <h2 class="category-title">/${category.id}</h2>
            <div class="gallery-grid">
                ${category.images.map(img => `
                <div class="asset-card">
                    <div class="asset-image-wrapper checkerboard">
                        <img src="${img.path}" alt="${img.filename}" class="asset-image" loading="lazy">
                    </div>
                    <div class="asset-info">
                        <div class="asset-meta-row">
                            <span>EXT: ${img.filename.split('.').pop().toUpperCase()}</span>
                            <span>SIZE: ${img.size} KB</span>
                        </div>
                        <div class="asset-name">${img.filename}</div>
                        <button class="copy-btn" onclick="copyToClipboard(this, '/${img.path}?v=${img.mtime}')">
                            Copy CDN Link
                        </button>
                    </div>
                </div>
                `).join('')}
            </div>
        </section>
        `).join('')}
    </main>

    <div id="toast" class="toast">DATA_COPIED_TO_CLIPBOARD</div>

    <script>
        function copyToClipboard(btn, path) {
            const url = window.location.origin + path;
            
            navigator.clipboard.writeText(url).then(() => {
                const originalText = btn.innerText;
                btn.innerText = '[ COPIED ]';
                btn.style.background = 'var(--text-primary)';
                btn.style.color = 'var(--accent-color)';
                
                showToast('LINK_COPIED: ' + url);
                
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.background = 'var(--bg-color)';
                    btn.style.color = 'var(--text-primary)';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                showToast('ERR: CLIPBOARD_DENIED');
            });
        }

        function showToast(message) {
            const toast = document.getElementById('toast');
            toast.innerText = message;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        const sections = document.querySelectorAll('.category-section');
        const navItems = document.querySelectorAll('.nav-item');

        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (pageYOffset >= sectionTop - 150) {
                    current = section.getAttribute('id');
                }
            });

            navItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href') === '#' + current) {
                    item.classList.add('active');
                }
            });
        });
    </script>
</body>
</html>`;

  fs.writeFileSync(OUTPUT_FILE, html);
  console.log(`[SYS] Gallery generated -> ${OUTPUT_FILE}`);
  console.log(`[SYS] Indexed ${categories.length} directories, ${categories.reduce((acc, c) => acc + c.images.length, 0)} assets total.`);
}

const data = buildGalleryData();
generateHTML(data);
