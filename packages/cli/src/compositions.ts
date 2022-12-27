import {getCompositions, RenderInternals} from '@remotion/renderer';
import {convertEntryPointToServeUrl} from './convert-entry-point-to-serve-url';
import {findEntryPoint} from './entry-point';
import {getCliOptions} from './get-cli-options';
import {loadConfig} from './get-config-file-name';
import {Log} from './log';
import {printCompositions} from './print-compositions';
import {bundleOnCliOrTakeServeUrl} from './setup-cache';

export const listCompositionsCommand = async (
	remotionRoot: string,
	args: string[]
) => {
	const {file, reason} = findEntryPoint(args, remotionRoot);

	if (!file) {
		Log.error(
			'The `compositions` command requires you to specify a entry point. For example'
		);
		Log.error('  npx remotion compositions src/index.ts');
		Log.error(
			'See https://www.remotion.dev/docs/register-root for more information.'
		);
		process.exit(1);
	}

	Log.verbose('Entry point:', file, 'reason:', reason);

	const downloadMap = RenderInternals.makeDownloadMap();

	const fullPath = convertEntryPointToServeUrl(file);

	await loadConfig(remotionRoot);

	const {
		browserExecutable,
		ffmpegExecutable,
		ffprobeExecutable,
		chromiumOptions,
		envVariables,
		inputProps,
		puppeteerTimeout,
		port,
		publicDir,
	} = await getCliOptions({
		isLambda: false,
		type: 'get-compositions',
		remotionRoot,
	});

	const {urlOrBundle: bundled, cleanup: cleanupBundle} =
		await bundleOnCliOrTakeServeUrl({
			remotionRoot,
			fullPath,
			steps: ['bundling'],
			publicDir,
			onProgress: () => undefined,
			indentOutput: false,
		});

	const compositions = await getCompositions(bundled, {
		browserExecutable,
		ffmpegExecutable,
		ffprobeExecutable,
		chromiumOptions,
		envVariables,
		inputProps,
		timeoutInMilliseconds: puppeteerTimeout,
		port,
		downloadMap,
	});

	printCompositions(compositions);

	await RenderInternals.cleanDownloadMap(downloadMap);
	await cleanupBundle();
	Log.verboseIndent(true, 'Cleaned up', downloadMap.assetDir);
};
