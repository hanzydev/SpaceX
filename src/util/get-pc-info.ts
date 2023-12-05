import os from 'node:os';
import { setTimeout as sleep } from 'node:timers/promises';
import { filesize } from 'filesize';
import { destr } from 'destr';
import { execAsync } from './exec-async';

export const getOSName = async () => {
    if (os.platform() === 'darwin') {
        try {
            const process = await execAsync('sw_vers');
            const output = process.stdout.split(os.EOL);

            const productName = output[0].split(':')[1].trim();
            const productVersion = output[1].split(':')[1].trim();

            return `${productName} ${productVersion}`;
        } catch {
            return 'macOS';
        }
    }

    if (os.platform() === 'linux') {
        try {
            const process = await execAsync('cat /etc/os-release');
            const output = process.stdout.split(os.EOL);

            const name = output
                .find((line) => line.startsWith('NAME='))
                ?.split('=')[1]
                .replace(/"/g, '');

            const versionKey = output.find((line) => line.startsWith('VERSION='))
                ? 'VERSION='
                : 'VERSION_ID=';
            const version =
                output
                    .find((line) => line.startsWith(versionKey))
                    ?.split('=')[1]
                    .replace(/"/g, '') ?? '';

            return `${name} ${version}`.trim();
        } catch {
            return 'Linux';
        }
    }

    if (os.platform() === 'win32') {
        try {
            const process = await execAsync('wmic os get Caption');
            const output = process.stdout.split(os.EOL);

            return output[1].replace(/\r|\n/g, '').trim();
        } catch {
            return 'Windows';
        }
    }

    return os.platform();
};

export const getCPUInfo = async () => {
    if (os.platform() === 'linux') {
        try {
            const process = await execAsync('lscpu -J');
            const data: { field: string; data: string }[] = (destr(process.stdout) as any).lscpu;

            const before = readFileSync('/proc/stat', { encoding: 'utf-8' });
            await sleep(1000);
            const after = readFileSync('/proc/stat', { encoding: 'utf-8' });

            const beforeData = before
                .split(os.EOL)
                .filter((line) => line.includes('cpu '))
                .map((line) => line.replace(/\s+/g, ' ').trim().split(' '));

            const afterData = after
                .split(os.EOL)
                .filter((line) => line.includes('cpu '))
                .map((line) => line.replace(/\s+/g, ' ').trim().split(' '));

            const totalBefore = beforeData[0].slice(1).reduce((a, b) => +a + +b, 0);
            const totalAfter = afterData[0].slice(1).reduce((a, b) => +a + +b, 0);

            const idleBefore = +beforeData[0][4];
            const idleAfter = +afterData[0][4];

            const idle = idleAfter - idleBefore;
            const total = totalAfter - totalBefore;

            const usage = +(((total - idle) / total) * 100).toFixed(2);
            const speed = data.find((d) => d.field === 'CPU MHz:')?.data;

            return {
                name: (data.find((d) => d.field === 'Model name:')?.data ?? 'Unknown')
                    .replace(/\s*@\s*\d+.\d+GHz\s*/, '')
                    .replace('CPU', '')
                    .trim(),
                speed: +(speed ? +speed / 1000 : 0).toFixed(2),
                cores: +(data.find((d) => d.field === 'CPU(s):')?.data ?? 0),
                usage,
            };
        } catch {}
    }

    if (os.platform() === 'win32') {
        try {
            const process = await execAsync(
                'wmic cpu get Name,MaxClockSpeed,NumberOfLogicalProcessors,LoadPercentage',
            );
            const output = process.stdout.split(os.EOL);

            const _data = output[1]
                .replace(/\r|\n/g, '')
                .trim()
                .split(/\s{2,}/g);

            const data = _data.length === 4 ? _data : ['0', ..._data];

            return {
                name: data[2]
                    .replace(/\s*@\s*\d+.\d+GHz\s*/g, '')
                    .replace('CPU', '')
                    .replace(/  +/, ' ')
                    .trim(),
                speed: +(+data[1] / 1000).toFixed(2),
                cores: +data[3],
                usage: +data[0].replace('%', ''),
            };
        } catch {}
    }

    return {
        name: 'Unknown',
        speed: 0,
        cores: 0,
        usage: 0,
    };
};

export const getDiskInfo = async () => {
    if (os.platform() === 'linux') {
        try {
            const getDefaultDrive = async () => {
                const process = await execAsync('blkid');
                const output = process.stdout.split(os.EOL);

                const [data] = output
                    .filter((line) => line.includes('TYPE="ext4"'))
                    .map((line) => line.replace(/\s+/g, ' ').trim().split(' '));

                return data[0].split(':')[0];
            };

            const defaultDrive = await getDefaultDrive();

            const process = await execAsync('df -B1 --output=source,size,used');
            const output = process.stdout.split(os.EOL);

            const [data] = output
                .filter((line) => line.includes(defaultDrive))
                .map((line) => line.replace(/\s+/g, ' ').trim().split(' '));

            return {
                total: +data[1],
                free: +data[1] - +data[2],
                used: +data[2],
            };
        } catch {}
    }

    if (os.platform() === 'win32') {
        try {
            const _process = await execAsync('wmic logicaldisk get Name,Size,FreeSpace');
            const output = _process.stdout.split(os.EOL);

            const [data] = output
                .filter((line) => line.includes(process.env.SystemDrive!))
                .map((line) => line.replace(/\s+/g, ' ').trim().split(' '));

            return {
                total: +data[2],
                free: +data[0],
                used: +data[2] - +data[0],
            };
        } catch {}
    }

    return {
        total: 0,
        free: 0,
        used: 0,
    };
};

const getNetworkStats = async () => {
    if (os.platform() === 'linux') {
        try {
            const getDefaultNetworkInterface = async () => {
                const process = await execAsync('ip route show default');
                const output = process.stdout.split(os.EOL);

                const data = output
                    .filter((line) => line.includes('default'))
                    .map((line) => line.replace(/\s+/g, ' ').trim().split(' '));

                return data[0][4];
            };

            const fetch = async () => {
                const defaultInterface = await getDefaultNetworkInterface();

                const process = await execAsync('cat /proc/net/dev');
                const output = process.stdout.split(os.EOL);

                const data = output
                    .filter((line) => line.includes(defaultInterface))
                    .map((line) => line.replace(/\s+/g, ' ').trim().split(' '));

                return {
                    rx: +data[0][1],
                    tx: +data[0][9],
                };
            };

            const before = await fetch();
            await sleep(1000);
            const after = await fetch();

            return {
                in: +((after.rx - before.rx) / 1024 / 1024).toFixed(2),
                out: +((after.tx - before.tx) / 1024 / 1024).toFixed(2),
            };
        } catch {}
    }

    if (os.platform() === 'win32') {
        try {
            const fetch = async () => {
                const process = await execAsync('netstat -e');
                const output = process.stdout.split(os.EOL);

                const data = output
                    .filter((line) => line.includes('Bytes'))
                    .map((line) => line.replace(/\s+/g, ' ').trim().split(' '));

                return {
                    rx: +data[0][1],
                    tx: +data[0][2],
                };
            };

            const before = await fetch();
            await sleep(1000);
            const after = await fetch();

            return {
                in: +((after.rx - before.rx) / 1024 / 1024).toFixed(2),
                out: +((after.tx - before.tx) / 1024 / 1024).toFixed(2),
            };
        } catch {}
    }

    return {
        in: 0,
        out: 0,
    };
};

export const getPCInfo = async (): Promise<PCInfo> => {
    const osName = await getOSName();
    const cpu = await getCPUInfo();
    const disk = await getDiskInfo();
    const network = await getNetworkStats();

    const memory = {
        total: os.totalmem(),
        free: os.freemem(),
    };

    return {
        ram: {
            total: filesize(memory.total, {
                base: 2,
                standard: 'jedec',
            }) as string,
            free: filesize(memory.free, {
                base: 2,
                standard: 'jedec',
            }) as string,
            used: filesize(memory.total - memory.free, {
                base: 2,
                standard: 'jedec',
            }) as string,
            usage: +(((memory.total - memory.free) / memory.total) * 100).toFixed(2),
        },
        disk: {
            total: filesize(disk.total, {
                base: 2,
                standard: 'jedec',
            }) as string,
            free: filesize(disk.free, {
                base: 2,
                standard: 'jedec',
            }) as string,
            used: filesize(disk.total - disk.free, {
                base: 2,
                standard: 'jedec',
            }) as string,
            usage: +(((disk.total - disk.free) / disk.total) * 100).toFixed(2),
        },
        cpu,
        network,
        os: {
            name: osName,
            platform: os.platform(),
            release: os.release(),
            arch: os.arch(),
        },
    };
};
