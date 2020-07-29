import { spawn } from "child_process";

export const executeCommand = (
    command: string,
    args?: Array<string>,
    cwd?: string
): Promise<void> => {
    return new Promise((resolve, reject) => {
        let stderrChunks: Array<string> = [];
        let stdoutChunks: Array<string> = [];
        const spwned = spawn(command, args ? args : [], {
            shell: true,
            cwd: cwd,
            stdio: [process.stdin, process.stdout, "pipe"]
        });
        spwned.stderr.on("data", data => {
            stderrChunks = [...stderrChunks, data];
        });
        spwned.on("exit", code => {
            if (code !== 0) {
                return reject(stderrChunks.join());
            } else {
                return resolve();
            }
        });
        spwned.on("close", resolve);
    });
};