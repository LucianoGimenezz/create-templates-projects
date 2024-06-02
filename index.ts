import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {cp, readFile, writeFile} from "node:fs/promises"
import {hideBin} from 'yargs/helpers'
import yargs from 'yargs'
import prompts from 'prompts'
import {glob} from 'glob'
import color from 'picocolors'

process.on('uncaughtException', (err) => {
    console.error(err)
    process.exit(1)
});

const TEMPLATES = [{
    title: 'Nest + Typeorm + Sql server ',
    value: 'nest-project'
}]


const args = yargs(hideBin(process.argv)).options({
    name: {
        type: 'string',
        alias: 'n',
        description: 'Project name'
    },
    template: {
        type: 'string',
        alias: 't',
        description: 'Project template'
    
    },
});

prompts.override(args.argv);

(async () => {

   const {
    name, 
    template 
  } = await args.argv;


  const project = await prompts(
    [
        {
            type: 'text',
            name: 'name',
            message: 'What is the name for your project?',
            initial: name || 'default-name',
            validate: (value) => {
                if (value.match(/[^a-zA-Z0-9-_]+/g))
                    return "Project name can only contain letters, numbers, dashes and underscores";
        
                  return true;
            }
        },
        {
            type: 'select',
            name: 'template',
            message: 'Which template would you like?',
            initial: template || 0,
            choices: TEMPLATES
        },
    ],
    {
        onCancel: () => {
            console.log('\nsee ya!\n')
            process.exit(0)
        }
    }
  )


  const folderPathofChoseTemplate = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    'templates',
    project.template,
  )

  const userDestination = path.join(process.cwd(), project.name)


  await cp(folderPathofChoseTemplate, userDestination,
     { recursive: true, filter: (src) => !src.includes('node_modules') })


  // Get all files from the destination folder
  const files = await glob(`**/*`, {nodir: true, cwd: userDestination, absolute: true});

  // Read each file and replace the tokens
  for await (const file of files) {
    const data = await readFile(file, "utf8");
    const draft = data.replace(/{{name}}/g, project.name);

    await writeFile(file, draft, "utf8");
  }

   console.log("\n✨ Project created ✨");
   console.log(`\n${color.yellow(`Next steps:`)}\n`);
   console.log(`${color.green(`cd`)} ${project.name}`);
   console.log(`${color.green(`yarn`)}`);
   console.log(`${color.green(`yarn`)} start:dev`);

})()