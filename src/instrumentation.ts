export async function register() {
	const required = [
		'BASE_URL',
		'API_BASE_URL',
		'IT_LOGIN_REDIRECT',
		'AUTH_MODE',
	];
	const missingEnvs = required.filter((val) => !process.env[val]);
	if (missingEnvs.length > 0)
		throw new Error(`Missing required env vars: ${missingEnvs.join(', ')}`);
}
