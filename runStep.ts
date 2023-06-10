import { mergeReadableStreams } from "./deps.ts";

export async function runStep(step: Step) {
    if (step.type === "script") {
        await runScript(step);
    }
    else {
        await runContainer(step);
    }
}

export async function runScript(step: Step) {
    const command = new Deno.Command("sh", {
        args: [
            "-c",
            step.command,
        ],
        stdout: "piped",
        stderr: "piped",
    });

    console.log("---------------------------");
    console.log(`\t${step.name}\tSTART`);
    console.log("---------------------------");

    const process = command.spawn();

    const output = mergeReadableStreams(
        process.stdout,
        process.stderr,
    );

    for await (const chunk of output) {
        Deno.stdout.write(chunk);
    }

    const exit = (await process.status).code;

    console.log("---------------------------");
    console.log(`\t${step.name}\tEND`);
    console.log("---------------------------");

    if (exit !== 0) {
        Deno.exit(exit);
    }
}

export async function runContainer(step: Step) {
    const command = new Deno.Command("docker", {
        args: [
            "run",
            "-t",
            // "-v",
            // `${Deno.cwd()}:/tasky`,
            "-w",
            "/tasky",
            "--name",
            step.name,
            "--entrypoint",
            "sh",
            step.image,
            "-c",
            step.command,
        ],
        stdout: "piped",
        stderr: "piped",
    });

    console.log("---------------------------");
    console.log(`\t${step.name}\tSTART`);
    console.log("---------------------------");

    const process = command.spawn();

    const output = mergeReadableStreams(
        process.stdout,
        process.stderr,
    );

    for await (const chunk of output) {
        Deno.stdout.write(chunk);
    }

    const exit = (await process.status).code;

    console.log("---------------------------");
    console.log(`\t${step.name}\tEND`);
    console.log("---------------------------");

    if (exit !== 0) {
        Deno.exit(exit);
    }
}