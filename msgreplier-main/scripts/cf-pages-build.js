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

const targetDirs = ['cloudflare', 'middleware', '.build', 'server-functions'];

targetDirs.forEach(dir => {
    copyRecursive(path.join('.open-next', dir), path.join('.open-next', 'assets', dir));
});

fs.copyFileSync(path.join('.open-next', 'worker.js'), path.join('.open-next', 'assets', '_worker.js'));

const routesJson = {
    version: 1,
    include: ['/*'],
    exclude: [
        '/_next/*', 
        '/favicon.ico', 
        '/icon.png', 
        '/sw.js', 
        '/ads.txt', 
        '/templates/*',
        '/*.webp', 
        '/*.svg', 
        '/*.mp3', 
        '/*.png'
    ]
};

fs.writeFileSync(path.join('.open-next', 'assets', '_routes.json'), JSON.stringify(routesJson, null, 2));

console.log('Successfully structured OpenNext output for Cloudflare Pages!');
