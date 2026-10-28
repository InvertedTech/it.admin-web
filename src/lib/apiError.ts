// The .NET backend always serializes an `Error` object, even on success, with
// Reason set to the string "ERROR_REASON_NO_ERROR". Treat that as no error.
export function isApiError(err: unknown): boolean {
	if (!err) return false;
	if (typeof err === 'string') return true;
	const e = err as any;
	const reason = e.Reason ?? e.reason;
	if (reason && reason !== 'ERROR_REASON_NO_ERROR' && reason !== 0) return true;
	const validation = e.Validation ?? e.validation;
	return Array.isArray(validation) && validation.length > 0;
}
