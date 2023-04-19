#!/usr/bin/env node
import {Command} from 'commander';

// Create a new instance of commander
const program = new Command();

// Define the command and its description
program
    .command('world')
    .description('Prints "Hello" when you say "world"')
    .action(() => {
        console.log('Hello');
    });

// Parse the arguments and execute the appropriate command
program.parse(process.argv);
