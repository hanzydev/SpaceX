import chalk from 'chalk';

export const warn = (message: string) => {
    console.warn(`${chalk.bgYellow(chalk.black(' WARN '))} ${message}`);
};

export const error = (message: string) => {
    console.error(`${chalk.bgRed(chalk.black(' ERROR '))} ${message}`);
};

export const info = (message: string) => {
    console.log(`${chalk.bgBlue(chalk.black(' INFO '))} ${message}`);
};

export const success = (message: string) => {
    console.log(`${chalk.bgGreen(chalk.black(' SUCCESS '))} ${message}`);
};
