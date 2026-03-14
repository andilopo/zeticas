const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Load .env
const envPath = path.resolve(__dirname, '../.env');
const envConfig = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) envVars[key.trim()] = value.trim();
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;
const projectId = supabaseUrl.split('//')[1].split('.')[0];

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

async function uploadFile(bucket, filePath, destName) {
    const fileContent = fs.readFileSync(filePath);
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(destName, fileContent, {
            contentType: 'image/' + path.extname(destName).slice(1),
            upsert: true
        });

    if (error) {
        throw error;
    }
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${destName}`;
}

async function migrateAll() {
    console.log("Starting full image migration...");
    const srcDir = path.resolve(__dirname, '../src');
    const assetsDir = path.resolve(__dirname, '../src/assets');

    const assetMap = {}; // localFileName -> newUrl
    const remoteMap = {}; // oldUrl -> newUrl

    // 1. Migrate Local Assets
    console.log("Migrating local assets...");
    if (fs.existsSync(assetsDir)) {
        const files = fs.readdirSync(assetsDir);
        for (const file of files) {
            if (file.match(/\.(png|jpg|jpeg|gif|svg)$/)) {
                const localPath = path.join(assetsDir, file);
                try {
                    console.log(`Uploading local asset: ${file}`);
                    const newUrl = await uploadFile('assets', localPath, file);
                    assetMap[file] = newUrl;
                } catch (err) {
                    console.error(`Error uploading ${file}:`, err.message);
                }
            }
        }
    }

    // 2. Discover and Migrate Remote WordPress URLs
    console.log("Discovering remote URLs in src...");
    const urlRegex = /https:\/\/www\.zeticas\.com\/wp-content\/uploads\/[^\s"']+\.(png|jpg|jpeg|gif|svg)/gi;
    const remoteUrls = new Set();

    const findUrls = (dir) => {
        const list = fs.readdirSync(dir);
        list.forEach(item => {
            const fullPath = path.join(dir, item);
            if (fs.statSync(fullPath).isDirectory()) {
                findUrls(fullPath);
            } else if (item.match(/\.(jsx|js|css)$/)) {
                const fileContent = fs.readFileSync(fullPath, 'utf8');
                let match;
                while ((match = urlRegex.exec(fileContent)) !== null) {
                    remoteUrls.add(match[0]);
                }
            }
        });
    };
    findUrls(srcDir);

    if (!fs.existsSync('tmp_img')) fs.mkdirSync('tmp_img');

    for (const url of remoteUrls) {
        const fileName = url.split('/').pop();
        const localPath = path.join('tmp_img', fileName);
        try {
            console.log(`Downloading remote URL: ${url}`);
            await downloadFile(url, localPath);
            console.log(`Uploading to Supabase: ${fileName}`);
            const newUrl = await uploadFile('products', localPath, fileName);
            remoteMap[url] = newUrl;
        } catch (err) {
            console.error(`Error migrating remote URL ${url}:`, err.message);
        }
    }

    // 3. Update all references in code
    console.log("Updating all references in code...");
    const updateReferences = (dir) => {
        const list = fs.readdirSync(dir);
        list.forEach(item => {
            const fullPath = path.join(dir, item);
            if (fs.statSync(fullPath).isDirectory()) {
                updateReferences(fullPath);
            } else if (item.match(/\.(jsx|js|css)$/)) {
                let fileContent = fs.readFileSync(fullPath, 'utf8');
                let changed = false;

                // Update remote URLs
                Object.keys(remoteMap).forEach(oldUrl => {
                    if (fileContent.includes(oldUrl)) {
                        fileContent = fileContent.split(oldUrl).join(remoteMap[oldUrl]);
                        changed = true;
                    }
                });

                // Update local asset paths
                Object.keys(assetMap).forEach(fileName => {
                    const newUrl = assetMap[fileName];

                    // Match imports: import logo from '../assets/logo.png'
                    const importRegex = new RegExp(`import\\s+(\\w+)\\s+from\\s+['"](\\.\\.\\/|\\.\\/)*assets\\/${fileName}['"]`, 'g');
                    if (importRegex.test(fileContent)) {
                        fileContent = fileContent.replace(importRegex, `const $1 = '${newUrl}'`);
                        changed = true;
                    }

                    // Match paths like ../assets/logo.png or ./assets/logo.png or assets/logo.png
                    // and replace with the new URL
                    const pathRegex = new RegExp(`['"](\\.\\.\\/|\\.\\/)*assets\\/${fileName}['"]`, 'g');
                    if (pathRegex.test(fileContent)) {
                        fileContent = fileContent.replace(pathRegex, `'${newUrl}'`);
                        changed = true;
                    }

                    // CSS url()
                    const cssRegex = new RegExp(`url\\(['"]?(\\.\\.\\/|\\.\\/)*assets\\/${fileName}['"]?\\)`, 'g');
                    if (cssRegex.test(fileContent)) {
                        fileContent = fileContent.replace(cssRegex, `url('${newUrl}')`);
                        changed = true;
                    }
                });

                if (changed) {
                    console.log(`Updated file: ${fullPath}`);
                    fs.writeFileSync(fullPath, fileContent);
                }
            }
        });
    };
    updateReferences(srcDir);
}

migrateAll().then(() => {
    console.log("Migration sequence completed.");
    if (fs.existsSync('tmp_img')) {
        const files = fs.readdirSync('tmp_img');
        for (const file of files) fs.unlinkSync(path.join('tmp_img', file));
        fs.rmdirSync('tmp_img');
    }
}).catch(err => {
    console.error("Critical Migration Error:", err);
});
