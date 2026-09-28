/**
 * Multi-threaded SVG to PNG batch rasterizer using @resvg/resvg-js & Node worker_threads.
 * Renders all shapes across multiple CPU cores in parallel.
 */
import fs from 'node:fs';
import path from 'node:path';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);

function runWorker() {
    const { files, svgDir, pngDir, width } = workerData;
    const createdDirs = new Set();
    let renderedCount = 0;

    for (const svgFile of files) {
        const rel = path.relative(svgDir, svgFile);
        const pngFile = path.join(pngDir, rel.replace(/\.svg$/, '.png'));
        if (fs.existsSync(pngFile) && fs.statSync(pngFile).size > 100) {
            continue;
        }
        const dir = path.dirname(pngFile);
        if (!createdDirs.has(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            createdDirs.add(dir);
        }

        try {
            const svg = fs.readFileSync(svgFile, 'utf8');
            const resvg = new Resvg(svg, {
                fitTo: { mode: 'width', value: width },
                background: 'rgba(0, 0, 0, 0)',
                shapeRendering: 2
            });
            const png = resvg.render().asPng();
            fs.writeFileSync(pngFile, png);
            renderedCount++;
        } catch (err) {
            console.error(`Error rendering ${svgFile}:`, err.message);
        }
    }
    parentPort.postMessage({ renderedCount });
}

function getAllSvgFiles(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            results = results.concat(getAllSvgFiles(filePath));
        } else if (file.endsWith('.svg')) {
            results.push(filePath);
        }
    }
    return results;
}

export async function runParallelRasterizer(svgDir = 'assets/svg', pngDir = 'assets/png', width = 1024) {
    const allFiles = getAllSvgFiles(svgDir);
    const totalFiles = allFiles.length;
    const numWorkers = Math.min(Math.max(os.cpus().length - 2, 4), 12);

    console.log(`=================================================================`);
    console.log(`   PARALLEL PNG RASTERIZER: ${totalFiles} SVGs -> ${pngDir}`);
    console.log(`   Using ${numWorkers} parallel worker threads at ${width}x${width}`);
    console.log(`=================================================================`);

    const start = Date.now();
    
    // Chunk files across workers
    const chunks = Array.from({ length: numWorkers }, () => []);
    allFiles.forEach((file, idx) => {
        chunks[idx % numWorkers].push(file);
    });

    let completedWorkers = 0;
    let totalRendered = 0;

    const workerPromises = chunks.map((chunk, i) => {
        return new Promise((resolve, reject) => {
            const worker = new Worker(__filename, {
                workerData: {
                    files: chunk,
                    svgDir,
                    pngDir,
                    width
                }
            });

            worker.on('message', (msg) => {
                totalRendered += msg.renderedCount;
                completedWorkers++;
                console.log(`[Worker ${i + 1}/${numWorkers}] finished ${msg.renderedCount} images (${completedWorkers}/${numWorkers} workers done)`);
            });

            worker.on('error', reject);
            worker.on('exit', (code) => {
                if (code !== 0) reject(new Error(`Worker ${i + 1} stopped with exit code ${code}`));
                else resolve();
            });
        });
    });

    await Promise.all(workerPromises);
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`\nAll ${totalRendered} PNGs rendered successfully in ${elapsed}s!`);
}

if (!isMainThread) {
    runWorker();
} else {
    const isDirectRun = process.argv[1] && (path.resolve(process.argv[1]) === path.resolve(__filename));
    if (isDirectRun) {
        const args = process.argv.slice(2);
        let svgDir = 'assets/svg';
        let pngDir = 'assets/png';
        let width = 1024;

        for (let i = 0; i < args.length; i++) {
            if (args[i] === '--category' && args[i + 1]) {
                const cat = args[i + 1];
                svgDir = path.join('assets/svg', cat);
                pngDir = path.join('assets/png', cat);
                i++;
            } else if (args[i] === '--width' && args[i + 1]) {
                width = parseInt(args[i + 1], 10);
                i++;
            } else if (!args[i].startsWith('--')) {
                if (i === 0) svgDir = args[0];
                else if (i === 1) pngDir = args[1];
                else if (i === 2) width = parseInt(args[2], 10);
            }
        }

        runParallelRasterizer(svgDir, pngDir, width).catch(err => {
            console.error('Rasterization failed:', err);
            process.exit(1);
        });
    }
}
