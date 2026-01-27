'use client';

import { create } from '@bufbuild/protobuf';
import { getValidator } from '@inverted-tech/fragments/validation';
import { useAppForm } from '@/hooks/app-form';
// Re-export the TanStack helpers bound to our app field/form components
// so downstream code can import them from this proto-aware hook module.
export { withForm, withFieldGroup } from './app-form';
import { violationsToTanStackErrors } from '@/hooks/use-proto-validation';

type SubmitResult = void | {
	form?: string | string[];
	fields?: Record<string, string | string[]>;
};

export function useProtoAppForm<TSchema, TValues extends Record<string, any>>({
	schema,
	defaultValues,
	defaultInit,
	onValidSubmit,
	onSubmitAsync,
	normalizeBeforeValidate,
	mapViolations,
	onValidatorError = 'report',
	disableValidation = false,
}: {
	schema: TSchema;
	defaultValues?: TValues;
	defaultInit?: Partial<TValues>;
	onValidSubmit?: (args: {
		value: TValues;
		formApi: any;
	}) => Promise<void> | void;
	onSubmitAsync?: (args: {
		value: TValues;
		formApi: any;
	}) => Promise<SubmitResult | void>;
	normalizeBeforeValidate?: (value: TValues) => TValues;
	mapViolations?: (violations: any[] | undefined | null) => SubmitResult;
	onValidatorError?: 'ignore' | 'report';
	disableValidation?: boolean;
}) {
	const resolvedDefaults = ((): TValues => {
		if (defaultValues) return defaultValues as TValues;
		if (defaultInit)
			return create(
				schema as any,
				defaultInit as any,
			) as unknown as TValues;
		return create(schema as any) as unknown as TValues;
	})();

	const form = useAppForm({
		defaultValues: resolvedDefaults as any,
		validators: {
			onSubmitAsync: async ({ value, formApi }) => {
				// Debug: trace the submit pipeline
				try {
					// eslint-disable-next-line no-console
					console.log('[useProtoAppForm] onSubmitAsync value', value);
				} catch {}
				if (disableValidation) {
					// Skip proto validation entirely for this form
					if (onSubmitAsync) {
						const ret = await onSubmitAsync({
							value: value as TValues,
							formApi,
						});
						try {
							// eslint-disable-next-line no-console
							console.log(
								'[useProtoAppForm] onSubmitAsync returned',
								ret,
							);
						} catch {}
						return ret;
					}
					return undefined;
				}

				const validator = await getValidator();
				const normalizedValue = normalizeBeforeValidate
					? normalizeBeforeValidate(value as TValues)
					: (value as TValues);
				const payload = create(schema as any, normalizedValue as any);
				console.log('payload', payload);
				try {
					// eslint-disable-next-line no-console
					console.log('[useProtoAppForm] payload created', payload);
				} catch {}
				const res = await validator.validate(schema as any, payload);
				try {
					// eslint-disable-next-line no-console
					if (
						!(
							res?.kind === 'error' &&
							onValidatorError === 'ignore'
						)
					) {
						console.log('[useProtoAppForm] validator result', res);
					}
				} catch {}
				// Start building a result we can merge manual checks into
				let result: SubmitResult | undefined = undefined;
				if (res.kind === 'invalid') {
					// Filter out URL-as-URI violations. Our URL is a slug, not a full URI.
					const rawViolations: any[] = (res as any)?.violations ?? [];
					const filteredViolations = rawViolations.filter(
						(v: any) => {
							const parts = Array.isArray(v?.field)
								? (v.field as any[])
										.map(
											(p: any) =>
												p?.name ??
												p?.jsonName ??
												p?.localName,
										)
										.filter(Boolean)
								: ((
										(v as any)?.fieldPath?.elements ??
										(v as any)?.field?.elements
									)?.map((e: any) => e?.name) ?? []);
							const path =
								Array.isArray(parts) && parts.length
									? parts.join('.')
									: undefined;
							const msg = (v?.message ?? '') as string;
							const ruleId = (v?.ruleId ?? '') as string;
							const isUrlUri =
								path?.toLowerCase() === 'public.url' &&
								(/uri/i.test(ruleId) || /uri/i.test(msg));
							return !isUrlUri;
						},
					);

					if (filteredViolations.length) {
						result = mapViolations
							? mapViolations(filteredViolations)
							: violationsToTanStackErrors(filteredViolations);
					} else {
						result = undefined;
					}
					try {
						// eslint-disable-next-line no-console
						console.log(
							'[useProtoAppForm] mapped submit errors (after filter)',
							result,
						);
					} catch {}
				}
				if (res.kind === 'error') {
					const msg =
						(res as any)?.error?.message ?? 'Validation error';
					try {
						// eslint-disable-next-line no-console
						console.log('[useProtoAppForm] validator error', msg);
					} catch {}
					if (onValidatorError === 'ignore') {
						// Proceed without blocking submission
						return undefined;
					}
					return { form: msg };
				}
				// Manual group validations for content data oneofs (no proto rules)
				try {
					const fields: Record<string, string | string[]> = (
						(result as any)?.fields
							? { ...(result as any).fields }
							: {}
					) as any;
					const cd: any = (value as any)?.Public?.ContentDataOneof;
					const base = 'Public.ContentDataOneof.value.';
					if (cd?.case === 'Video') {
						const rum = (cd?.value?.RumbleVideoId ?? '').trim();
						const yt = (cd?.value?.YoutubeVideoId ?? '').trim();
						if (!rum && !yt) {
							fields[base + 'RumbleVideoId'] =
								'Provide a Rumble or Youtube Id';
							fields[base + 'YoutubeVideoId'] =
								'Provide a Youtube or Rumble Id';
						}
						if (!String(cd?.value?.HtmlBody ?? '').trim()) {
							fields[base + 'HtmlBody'] = 'Body is required';
						}
					} else if (
						cd?.case === 'Written' ||
						cd?.case === 'Audio' ||
						cd?.case === 'Picture'
					) {
						if (!String(cd?.value?.HtmlBody ?? '').trim()) {
							fields[base + 'HtmlBody'] = 'Body is required';
						}
					}
					if (Object.keys(fields).length) {
						result = { ...(result ?? {}), fields } as SubmitResult;
					}
				} catch {}

				if (onSubmitAsync && !result) {
					const ret = await onSubmitAsync({
						value: value as TValues,
						formApi,
					});
					try {
						// eslint-disable-next-line no-console
						console.log(
							'[useProtoAppForm] onSubmitAsync returned',
							ret,
						);
					} catch {}
					return ret;
				}
				return result;
			},
		},
		onSubmit: async (ctx) => {
			await onValidSubmit?.({
				value: ctx.value as TValues,
				formApi: ctx.formApi,
			});
		},
	});

	return form;
}
import { StripePublicSettingsSchema } from '@inverted-tech/fragments/Authorization/Payment/Stripe/index';
import { PaypalPublicSettingsSchema } from '@inverted-tech/fragments/Authorization/Payment/Paypal/index';
import { FortisPublicSettingsSchema } from '@inverted-tech/fragments/Authorization/Payment/Fortis/index';
import { ManualPaymentPublicSettingsSchema } from '@inverted-tech/fragments/Authorization/Payment/Manual/index';
import { CryptoPublicSettingsSchema } from '@inverted-tech/fragments/Authorization/Payment/Crypto/index';

// Subscription Settings Specific Normalization
export function normalizeProviders(value: any) {
	const stripeEnabled = !!value?.Data?.Stripe?.Enabled;
	const paypalEnabled = !!value?.Data?.Paypal?.Enabled;
	const fortisEnabled = !!value?.Data?.Fortis?.Enabled;
	return {
		...value,
		Data: value?.Data && {
			...value.Data,
			Stripe: stripeEnabled
				? create(StripePublicSettingsSchema, value.Data.Stripe ?? {})
				: undefined,
			Paypal: paypalEnabled
				? create(PaypalPublicSettingsSchema, value.Data.Paypal ?? {})
				: undefined,
			Fortis: fortisEnabled
				? create(FortisPublicSettingsSchema, value.Data.Fortis ?? {})
				: undefined,
			Manual: create(
				ManualPaymentPublicSettingsSchema,
				value.Data.Manual ?? {},
			),
			Crypto: create(CryptoPublicSettingsSchema, value.Data.Crypto ?? {}),
		},
	};
}
