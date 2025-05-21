// create-extension.js
const { exec } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const colors = require('ansi-colors'); // Import ansi-colors

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(colors.cyan('✨ Welcome to your Lunyx Extension Creator! ✨'));

rl.question(colors.blue('What name do you want to give to your Lunyx extension? '), (projectName) => {
  if (!projectName) {
    console.error(colors.red('Project name cannot be empty. Exiting.'));
    rl.close();
    return;
  }

  const idSanitizedName = projectName.toLowerCase().replace(/\s/g, '');

  rl.question(colors.blue('What class name do you want to use for your main plugin file (e.g., MyExtension)? '), (className) => {
    if (!className) {
      console.error(colors.red('Class name cannot be empty. Exiting.'));
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
        "ansi-colors": "^4.1.3",
        "esbuild": "^0.25.4",
        "esbuild-sass-plugin": "^3.3.1",
        "inquirer": "^12.6.1",
        "jszip": "^3.10.1"
      },
      "scripts": {
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
        console.error(colors.red(`Failed to create directory ${srcDirPath}: ${err.message}`));
        rl.close();
        return;
      }
      // console.log(colors.yellow(`\n📁 Created directory: ${srcDirPath}`)); // Commented out

      fs.writeFile(pluginJsonPath, JSON.stringify(pluginJsonContent, null, 2), (writeError) => {
        if (writeError) {
          console.error(colors.red(`Failed to write plugin.json: ${writeError.message}`));
          rl.close();
          return;
        }
        // console.log(colors.green(`\n🎉 Created ${pluginJsonPath} with the specified name in the current directory! 🎉`)); // Commented out

        fs.writeFile(packageJsonPath, JSON.stringify(packageJsonContent, null, 2), (writeError) => {
          if (writeError) {
            console.error(colors.red(`Failed to write package.json: ${writeError.message}`));
            rl.close();
            return;
          }
          // console.log(colors.green(`\n📦 Created ${packageJsonPath} with the specified name in the current directory! 📦`)); // Commented out

          fs.writeFile(mainJsPath, mainJsContent, (writeError) => {
            if (writeError) {
              console.error(colors.red(`Failed to write ${mainJsPath}: ${writeError.message}`));
              rl.close();
              return;
            }
            // console.log(colors.green(`\n📄 Created ${mainJsPath} with the specified class name!`)); // Commented out

            console.log(colors.yellow('\n⏳ Installing dependencies (this might take a moment)...'));

            const spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
            let spinnerIndex = 0;
            let spinnerInterval;

            const startSpinner = () => {
              spinnerInterval = setInterval(() => {
                process.stdout.write(`\r${colors.magenta(spinnerChars[spinnerIndex++])} `); // Color the spinner
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
                console.error(colors.red(`❌ Failed to install dependencies: ${npmError.message}`));
                console.error(colors.red(`   You might need to run 'npm install' manually.`));
              } else {
                console.log(colors.green(`✅ Dependencies installed successfully!`));
              }

              // console.log(colors.cyan(`\nTo get started, you can now check the 'plugin.json', 'package.json', and 'src/main.js' files.`)); // Commented out
              console.log(colors.cyan(`You can run 'npm run dev' to start development server.`));

              rl.close();
            });
          });
        });
      });
    });
  });
});
