import {
	FILE_DOWNLOAD_PROVIDERS,
	FILE_DOWNLOAD_PROVIDER_CONFIG_DIRS
} from "../../../../../lib/download-providers.js";

const VALID_ID = /^[a-zA-Z0-9_-]+$/;

const SECURITY_HEADERS = {
	'X-Content-Type-Options': 'nosniff',
	'X-Frame-Options': 'DENY',
};

export async function onRequestGet(context) {
	const { type, provider, id } = context.params;
	const cf = context.request.cf ?? {};
	const ip = context.request.headers.get('CF-Connecting-IP') ?? 'unknown';

	if (type !== 'skill' && type !== 'command') {
		console.log(JSON.stringify({ event: 'file_download_rejected', reason: 'invalid_type', type, ip }));
		return Response.json({ error: "Invalid type" }, { status: 400, headers: SECURITY_HEADERS });
	}

	if (!provider || !FILE_DOWNLOAD_PROVIDERS.includes(provider)) {
		console.log(JSON.stringify({ event: 'file_download_rejected', reason: 'invalid_provider', provider, ip }));
		return Response.json({ error: "Invalid provider" }, { status: 400, headers: SECURITY_HEADERS });
	}

	if (!id || !VALID_ID.test(id)) {
		console.log(JSON.stringify({ event: 'file_download_rejected', reason: 'invalid_id', id, ip }));
		return Response.json({ error: "Invalid file ID" }, { status: 400, headers: SECURITY_HEADERS });
	}

	const configDir = FILE_DOWNLOAD_PROVIDER_CONFIG_DIRS[provider];
	if (!configDir) {
		console.log(JSON.stringify({ event: 'file_download_rejected', reason: 'no_config_dir', provider, ip }));
		return Response.json({ error: "Invalid provider" }, { status: 400, headers: SECURITY_HEADERS });
	}

	const url = new URL(context.request.url);
	url.pathname = `/_data/dist/${provider}/${configDir}/skills/${id}/SKILL.md`;

	let response;
	try {
		response = await context.env.ASSETS.fetch(url);
	} catch (err) {
		console.error(JSON.stringify({ event: 'file_download_error', type, provider, id, ip, error: String(err) }));
		return Response.json({ error: "Internal error" }, { status: 500, headers: SECURITY_HEADERS });
	}

	if (!response.ok) {
		console.log(JSON.stringify({ event: 'file_download_not_found', type, provider, id, ip }));
		return Response.json({ error: "File not found" }, { status: 404, headers: SECURITY_HEADERS });
	}

	const content = await response.arrayBuffer();

	console.log(JSON.stringify({ event: 'file_download_ok', type, provider, id, ip, country: cf.country }));

	return new Response(content, {
		headers: {
			...SECURITY_HEADERS,
			'Content-Type': 'application/octet-stream',
			'Content-Disposition': 'attachment; filename="SKILL.md"',
			'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
		}
	});
}
