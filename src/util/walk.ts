import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export function* walk(filePath: string): Generator<string> {
    for (const file of readdirSync(filePath)) {
        const joined = join(filePath, file);

        if (statSync(joined).isDirectory()) {
            yield* walk(joined);
        } else {
            yield join(joined);
        }
    }
}
