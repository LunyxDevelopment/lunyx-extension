// create-extension.js
const { exec } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",
    
    // Text colors
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    
    // Background colors
    bgBlack: "\x1b[40m",
    bgRed: "\x1b[41m",
    bgGreen: "\x1b[42m",
    bgYellow: "\x1b[43m",
    bgBlue: "\x1b[44m",
    bgMagenta: "\x1b[45m",
    bgCyan: "\x1b[46m",
    bgWhite: "\x1b[47m"
};

// Helper function to colorize text
function colorize(text, color) {
    return `${color}${text}${colors.reset}`;
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log(colorize('✨ Welcome to your Lunyx Extension Creator! ✨', colors.cyan));

rl.question(colorize('What name do you want to give to your Lunyx extension? ', colors.blue), (projectName) => {
    if (!projectName) {
        console.error(colorize('Project name cannot be empty. Exiting.', colors.red));
        rl.close();
        return;
    }

    const idSanitizedName = projectName.toLowerCase().replace(/\s/g, '');

    rl.question(colorize('What class name do you want to use for your main plugin file (e.g., MyExtension)? ', colors.blue), (className) => {
        if (!className) {
            console.error(colorize('Class name cannot be empty. Exiting.', colors.red));
            rl.close();
            return;
        }

        const pluginJsonContent = {
            "id": `lunyx.extension.${idSanitizedName}`,
            "name": `Lunyx: ${projectName}`,
            "main": "main.js",
            "version": "1.0.0",
            "readme": "readme.md",
            "icon": "icon.png",
            "files": [],
            "minVersionCode": 290,
            "license": "MIT",
            "changelogs": "changelogs.md",
            "keywords": [],
            "price": 0,
            "author": {
                "name": "Rugved",
                "email": "rugveddanej.mail@gmail.com",
                "github": "rugveddanej"
            }
        };

        const packageJsonContent = {
            "name": `lunyx-extension-${idSanitizedName}`,
            "version": "1.0.0",
            "description": "Lunyx Extension",
            "main": "src/main.js",
            "repository": `https://github.com/LunyxDevelopment/lunyx-extension-${idSanitizedName}.git`,
            "author": "Lunyx Development",
            "license": "MIT",
            "dependencies": {
                "@types/ace": "^0.0.50",
                "html-tag-js": "^1.1.41"
            },
            "devDependencies": {
                "esbuild": "^0.25.4",
                "esbuild-sass-plugin": "^3.3.1",
                "inquirer": "^12.6.1",
                "jszip": "^3.10.1"
            },
            "scripts": {
                "setup": "node setup.js",
                "dev": "node esbuild.config.mjs --serve",
                "build": "node esbuild.config.mjs"
            },
            "browserslist": "cover 100%,not android < 5"
        };

        const mainJsContent = `import plugin from '../plugin.json';

class Lunyx${className} {

    async init() {
        // plugin initialisation
    }

    async destroy() {
        // plugin clean up
    }
}

if (window.acode) {
    const LunyxExtension = new ${className}();
    acode.setPluginInit(plugin.id, async (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
        if (!baseUrl.endsWith('/')) {
            baseUrl += '/';
        }
        LunyxExtension.baseUrl = baseUrl;
        await LunyxExtension.init($page, cacheFile, cacheFileUrl);
    });
    acode.setPluginUnmount(plugin.id, () => {
        LunyxExtension.destroy();
    });
}
`;

        const pluginJsonPath = 'plugin.json';
        const packageJsonPath = 'package.json';
        const srcDirPath = 'src';
        const mainJsPath = path.join(srcDirPath, 'main.js');

        fs.mkdir(srcDirPath, { recursive: true }, (err) => {
            if (err) {
                console.error(colorize(`Failed to create directory ${srcDirPath}: ${err.message}`, colors.red));
                rl.close();
                return;
            }

            fs.writeFile(pluginJsonPath, JSON.stringify(pluginJsonContent, null, 2), (writeError) => {
                if (writeError) {
                    console.error(colorize(`Failed to write plugin.json: ${writeError.message}`, colors.red));
                    rl.close();
                    return;
                }

                fs.writeFile(packageJsonPath, JSON.stringify(packageJsonContent, null, 2), (writeError) => {
                    if (writeError) {
                        console.error(colorize(`Failed to write package.json: ${writeError.message}`, colors.red));
                        rl.close();
                        return;
                    }

                    fs.writeFile(mainJsPath, mainJsContent, (writeError) => {
                        if (writeError) {
                            console.error(colorize(`Failed to write ${mainJsPath}: ${writeError.message}`, colors.red));
                            rl.close();
                            return;
                        }

                        console.log(colorize('\n⏳ Installing dependencies (this might take a moment)...', colors.yellow));

                        const spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
                        let spinnerIndex = 0;
                        let spinnerInterval;

                        const startSpinner = () => {
                            spinnerInterval = setInterval(() => {
                                process.stdout.write(`\r${colorize(spinnerChars[spinnerIndex++], colors.magenta)} `);
                                spinnerIndex = spinnerIndex % spinnerChars.length;
                            }, 100);
                        };

                        const stopSpinner = () => {
                            clearInterval(spinnerInterval);
                            process.stdout.write('\r');
                        };

                        startSpinner();

                        exec('npm install > /dev/null 2>&1', (npmError, stdout, stderr) => {
                            stopSpinner();

                            if (npmError) {
                                console.error(colorize(`❌ Failed to install dependencies: ${npmError.message}`, colors.red));
                                console.error(colorize(`   You might need to run 'npm install' manually.`, colors.red));
                            } else {
                                console.log(colorize(`✅ Dependencies installed successfully!`, colors.green));
                            }

                            console.log(colorize(`You can run 'npm run dev' to start development server.`, colors.cyan));

                            rl.close();
                        });
                    });
                });
            });
        });
    });
});