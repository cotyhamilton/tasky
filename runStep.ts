export async function runStep(step: Step, index: number) {
	const id = String(index).padStart(2, "0") + "__" +
		step.name.trim().split(" ").join("-");
	if (step.type === "script") {
		await runScript(step, id);
	} else {
		await runContainer(step, id);
	}
}

export async function runScript(step: Step, id: string) {
	const envVars = step.env
		? Object.keys(step.env).map((key) => `${key}=${step.env[key]}`).join(
			" ",
		)
		: "";
	const command = "sh";
	const args = [
		"-c",
		envVars + "\n" + step.command,
	];
	await run(id, command, args);
}

export async function runContainer(step: Step, id: string) {
	const envVars = step.env
		? Object.keys(step.env).flatMap((
			key,
		) => ["-e", `${key}=${step.env[key]}`])
		: [];
	const bin = "docker";
	const args = [
		"run",
		// "-v",
		// `${Deno.cwd()}:/tasky`,
		"-w",
		"/tasky",
		"--name",
		id,
		"--entrypoint",
		"sh",
		...envVars,
		step.image,
		"-c",
		step.command,
	];
	await run(id, bin, args);
}

export async function run(id: string, bin: string, args: string[]) {
	const command = new Deno.Command(bin, {
		args,
	});

	console.log("---------------------------");
	console.log(`START\t${id}`);
	console.log("---------------------------");

	const process = command.spawn();

	const exit = (await process.status).code;

	console.log("---------------------------");
	console.log(`END\t${id}`);
	console.log("---------------------------");

	if (exit !== 0) {
		Deno.exit(exit);
	}
}
