const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest) {
    if (!fs.existsSync(src)) return;
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(file => {
            copyRecursive(path.join(src, file), path.join(dest, file));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

// 1. Copy required OpenNext worker runtime support folders to assets directory for Cloudflare Pages _worker.js
const targetDirs = ['cloudflare', 'middleware', '.build', 'server-functions'];
targetDirs.forEach(dir => {
    copyRecursive(path.join('.open-next', dir), path.join('.open-next', 'assets', dir));
});

// Copy worker entrypoint as Cloudflare Pages _worker.js
fs.copyFileSync(path.join('.open-next', 'worker.js'), path.join('.open-next', 'assets', '_worker.js'));

// 2. Copy all Next.js pre-rendered static HTML, RSC, and body assets into .open-next/assets
// This allows Cloudflare CDN to serve pre-rendered pages directly with 0ms Worker CPU time.
function copyPrerenderedPages(srcDir, destDir) {
    if (!fs.existsSync(srcDir)) return;

    function scanAndCopy(dir, relativePath = '') {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relPath = path.join(relativePath, entry.name);

            if (entry.isDirectory()) {
                scanAndCopy(fullPath, relPath);
            } else if (entry.isFile()) {
                if (entry.name.endsWith('.html')) {
                    if (entry.name === '_not-found.html') {
                        // Standard Cloudflare Pages 404 handler
                        fs.copyFileSync(fullPath, path.join(destDir, '404.html'));
                    } else if (entry.name === 'index.html') {
                        const target = path.join(destDir, relPath);
                        fs.mkdirSync(path.dirname(target), { recursive: true });
                        fs.copyFileSync(fullPath, target);
                    } else {
                        // Copy as page.html
                        const targetHtml = path.join(destDir, relPath);
                        fs.mkdirSync(path.dirname(targetHtml), { recursive: true });
                        fs.copyFileSync(fullPath, targetHtml);

                        // Also create page/index.html so clean URLs (/about, /blog/foo) resolve statically
                        const baseRoute = relPath.slice(0, -5);
                        const targetDirIndex = path.join(destDir, baseRoute, 'index.html');
                        fs.mkdirSync(path.dirname(targetDirIndex), { recursive: true });
                        fs.copyFileSync(fullPath, targetDirIndex);
                    }
                } else if (entry.name.endsWith('.rsc')) {
                    const target = path.join(destDir, relPath);
                    fs.mkdirSync(path.dirname(target), { recursive: true });
                    fs.copyFileSync(fullPath, target);
                } else if (entry.name.endsWith('.body')) {
                    // e.g. sitemap.xml.body -> sitemap.xml, robots.txt.body -> robots.txt
                    const baseName = entry.name.slice(0, -5);
                    const target = path.join(destDir, path.dirname(relPath), baseName);
                    fs.mkdirSync(path.dirname(target), { recursive: true });
                    fs.copyFileSync(fullPath, target);
                }
            }
        }
    }

    scanAndCopy(srcDir);
}

copyPrerenderedPages(path.join('.next', 'server', 'app'), path.join('.open-next', 'assets'));

// 3. Define _routes.json
// Crucial: Only route dynamic requests to _worker.js.
// All static pages, images, and pre-rendered routes will bypass the Worker and be served by Cloudflare CDN at 0ms Worker CPU.
const routesJson = {
    version: 1,
    include: [
        '/api/*',
        '/greet/*',
        '/love-space/*',
        '/love-score/*',
        '/wishes/edit/*',
        '/wishes/dashboard/*',
        '/auth/*'
    ],
    exclude: [
        '/_next/*',
        '/templates/*',
        '/*.webp',
        '/*.svg',
        '/*.mp3',
        '/*.png'
    ]
};

fs.writeFileSync(path.join('.open-next', 'assets', '_routes.json'), JSON.stringify(routesJson, null, 2));

console.log('Successfully structured OpenNext output and copied pre-rendered pages for Cloudflare Pages!');
