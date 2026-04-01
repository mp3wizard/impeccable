import { BUNDLE_DOWNLOAD_PROVIDERS } from "../../../../lib/download-providers.js";

const SECURITY_HEADERS = {
	'X-Content-Type-Options': 'nosniff',
	'X-Frame-Options': 'DENY',
};

export async function onRequestGet(context) {
	const { provider } = context.params;
	const cf = context.request.cf ?? {};
	const ip = context.request.headers.get('CF-Connecting-IP') ?? 'unknown';

	if (!provider || !BUNDLE_DOWNLOAD_PROVIDERS.includes(provider)) {
		console.log(JSON.stringify({ event: 'bundle_download_rejected', reason: 'invalid_provider', provider, ip, country: cf.country }));
		return Response.json({ error: "Invalid provider" }, { status: 400, headers: SECURITY_HEADERS });
	}

	const url = new URL(context.request.url);
	url.pathname = `/_data/dist/${provider}.zip`;

	let response;
	try {
		response = await context.env.ASSETS.fetch(url);
	} catch (err) {
		console.error(JSON.stringify({ event: 'bundle_download_error', provider, ip, error: String(err) }));
		return Response.json({ error: "Internal error" }, { status: 500, headers: SECURITY_HEADERS });
	}

	if (!response.ok) {
		console.log(JSON.stringify({ event: 'bundle_download_not_found', provider, ip }));
		return Response.json({ error: "Bundle not found" }, { status: 404, headers: SECURITY_HEADERS });
	}

	const content = await response.arrayBuffer();
	const safeProvider = provider.replace(/[^a-zA-Z0-9._-]/g, '');

	console.log(JSON.stringify({ event: 'bundle_download_ok', provider, ip, country: cf.country }));

	return new Response(content, {
		headers: {
			...SECURITY_HEADERS,
			'Content-Type': 'application/zip',
			'Content-Disposition': `attachment; filename="impeccable-style-${safeProvider}.zip"`,
			'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
		}
	});
}
