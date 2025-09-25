#!/usr/bin/env node

const { defineCommand, runMain } = require('citty');
const prompts = require('prompts');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to scan examples folder and find projects
function scanExamples() {
  const examplesDir = __dirname;
  const projects = [];

  try {
    const items = fs.readdirSync(examplesDir, { withFileTypes: true });

    for (const item of items) {
      if (item.isDirectory() && item.name.match(/^\d+-/)) {
        const projectPath = path.join(examplesDir, item.name);
        const packageJsonPath = path.join(projectPath, 'package.json');

        // Check if it has package.json
        if (fs.existsSync(packageJsonPath)) {
          try {
            const packageJson = JSON.parse(
              fs.readFileSync(packageJsonPath, 'utf8'),
            );
            projects.push({
              name: item.name,
              displayName: item.name
                .replace(/^\d+-/, '')
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase()),
              path: projectPath,
              description: packageJson.description || 'Lithia example',
            });
          } catch (error) {
            console.warn(
              `Error reading package.json from ${item.name}:`,
              error.message,
            );
          }
        }
      }
    }

    // Sort by number
    projects.sort((a, b) => {
      const numA = parseInt(a.name.match(/^(\d+)-/)?.[1] || '0');
      const numB = parseInt(b.name.match(/^(\d+)-/)?.[1] || '0');
      return numA - numB;
    });
  } catch (error) {
    console.error('Error scanning examples folder:', error.message);
    process.exit(1);
  }

  return projects;
}

// Function to run the server
function runServer(project) {
  console.log(`\nStarting ${project.displayName}...`);
  console.log(`Folder: ${project.path}`);
  console.log(`\nServer will start at http://localhost:3000`);
  console.log(`\nPress Ctrl+C to stop the server\n`);

  const child = spawn('npm', ['run', 'dev'], {
    cwd: project.path,
    stdio: 'inherit',
    shell: true,
  });

  // Signal handling to stop the server
  const cleanup = () => {
    console.log('\n\nStopping server...');
    child.kill('SIGTERM');
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  child.on('error', (error) => {
    console.error('Error running server:', error.message);
    process.exit(1);
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Server exited with code ${code}`);
      process.exit(code);
    }
  });
}

// Main command to run examples
const runCommand = defineCommand({
  meta: {
    name: 'run',
    description: 'Run a Lithia example',
  },
  args: {
    project: {
      type: 'string',
      description: 'Project name to run directly',
      alias: 'p',
    },
  },
  async run({ args }) {
    try {
      const projects = scanExamples();

      if (projects.length === 0) {
        console.log('No projects found in examples/ folder');
        console.log('Make sure projects follow the pattern: 1-project-name');
        process.exit(1);
      }

      let selectedProject;

      if (args.project) {
        // Projeto especificado via argumento
        selectedProject = projects.find(
          (p) =>
            p.name === args.project ||
            p.name.includes(args.project) ||
            p.displayName.toLowerCase().includes(args.project.toLowerCase()),
        );

        if (!selectedProject) {
          console.log(`Project "${args.project}" not found`);
          console.log('Available projects:');
          projects.forEach((p) =>
            console.log(`  - ${p.name} (${p.displayName})`),
          );
          process.exit(1);
        }
      } else {
        // Interactive selection
        console.log('Select an example to run:\n');

        const response = await prompts({
          type: 'select',
          name: 'project',
          message: 'Which example do you want to run?',
          choices: projects.map((project) => ({
            title: `${project.name} - ${project.displayName}`,
            value: project,
            description: project.description,
          })),
        });

        if (!response.project) {
          console.log('No project selected');
          process.exit(0);
        }

        selectedProject = response.project;
      }

      // Check if project has dependencies installed
      const nodeModulesPath = path.join(selectedProject.path, 'node_modules');
      if (!fs.existsSync(nodeModulesPath)) {
        console.log('Installing dependencies...');
        const installProcess = spawn('npm', ['install'], {
          cwd: selectedProject.path,
          stdio: 'inherit',
          shell: true,
        });

        installProcess.on('exit', (code) => {
          if (code === 0) {
            runServer(selectedProject);
          } else {
            console.error('Error installing dependencies');
            process.exit(1);
          }
        });
      } else {
        runServer(selectedProject);
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  },
});

// Command to list projects
const listCommand = defineCommand({
  meta: {
    name: 'list',
    description: 'List all available examples',
  },
  run() {
    const projects = scanExamples();

    if (projects.length === 0) {
      console.log('No projects found in examples/ folder');
      return;
    }

    console.log('Available examples:\n');
    projects.forEach((project) => {
      console.log(`  ${project.name}`);
      console.log(`    ${project.displayName}`);
      console.log(`    ${project.path}`);
      console.log(`    ${project.description}\n`);
    });
  },
});

// Command to create new example
const createCommand = defineCommand({
  meta: {
    name: 'create',
    description: 'Create a new example',
  },
  args: {
    name: {
      type: 'positional',
      description: 'Name of the example',
      required: true,
    },
  },
  async run({ args }) {
    const projects = scanExamples();
    const nextNumber = projects.length + 1;
    const projectName = `${nextNumber}-${args.name}`;
    const projectPath = path.join(__dirname, projectName);

    if (fs.existsSync(projectPath)) {
      console.log(`Project ${projectName} already exists`);
      process.exit(1);
    }

    console.log(`Creating project ${projectName}...`);

    try {
      // Create basic structure
      fs.mkdirSync(projectPath, { recursive: true });
      fs.mkdirSync(path.join(projectPath, 'src', 'routes'), {
        recursive: true,
      });

      // Create package.json
      const packageJson = {
        name: `lithia-example-${args.name}`,
        version: '1.0.0',
        description: `Lithia ${args.name} example`,
        scripts: {
          dev: 'node ../../dist/cli/index.js dev',
          build: 'node ../../dist/cli/index.js build',
          start: 'node ../../dist/cli/index.js start',
        },
        dependencies: {
          lithia: 'file:../../dist',
          zod: '^3.24.1',
        },
      };

      fs.writeFileSync(
        path.join(projectPath, 'package.json'),
        JSON.stringify(packageJson, null, 2),
      );

      // Create tsconfig.json
      const tsconfig = {
        compilerOptions: {
          target: 'ESNext',
          module: 'ESNext',
          moduleResolution: 'bundler',
          allowJs: false,
          types: ['node'],
          resolveJsonModule: true,
          strict: true,
          baseUrl: '',
          paths: {
            '@/*': ['src/*'],
            lithia: ['../../dist'],
            'lithia/*': ['../../dist/*'],
          },
        },
        exclude: [],
      };

      fs.writeFileSync(
        path.join(projectPath, 'tsconfig.json'),
        JSON.stringify(tsconfig, null, 2),
      );

      // Create lithia.config.js
      const lithiaConfig = `const { defineLithiaConfig } = require('lithia');

module.exports = defineLithiaConfig({
  globalMiddlewares: [],
});`;

      fs.writeFileSync(
        path.join(projectPath, 'lithia.config.js'),
        lithiaConfig,
      );

      // Create example route
      const helloRoute = `import { LithiaRequest, LithiaResponse } from 'lithia';

export default async function handler(req: LithiaRequest, res: LithiaResponse) {
  res.json({
    message: 'Hello, from ${args.name}! 🚀',
  });
}`;

      fs.writeFileSync(
        path.join(projectPath, 'src', 'routes', 'hello.get.ts'),
        helloRoute,
      );

      console.log(`Project ${projectName} created successfully!`);
      console.log(`Location: ${projectPath}`);
      console.log(`\nTo run:`);
      console.log(`  cd examples/${projectName}`);
      console.log(`  npm install`);
      console.log(`  npm run dev`);
    } catch (error) {
      console.error('Error creating project:', error.message);
      process.exit(1);
    }
  },
});

// Main command
const main = defineCommand({
  meta: {
    name: 'lithia-examples',
    description: 'CLI to run Lithia examples',
    version: '1.0.0',
  },
  subCommands: {
    run: runCommand,
    list: listCommand,
    create: createCommand,
  },
});

// Uncaught error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught error:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection:', reason);
  process.exit(1);
});

// Export for testing
module.exports = { main, runCommand, listCommand, createCommand };

// Run CLI
runMain(main);
