import { flags, path, yaml } from "./deps.ts"
import { runStep } from "./runStep.ts";

async function main(args: string[]) {
    const {
        file
    } = flags.parse(args);

    const taskyFilePath = path.resolve(Deno.cwd(), String(file));
    const content = yaml.parse(await Deno.readTextFile(taskyFilePath)) as Yaml;
    const steps = content.steps;

    for await (const step of steps) {
        await runStep(step);
    }
}

if (import.meta.main) {
    await main(Deno.args);
}