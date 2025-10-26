'use client';

import { createFormHook } from '@tanstack/react-form';
import { fieldContext, formContext } from '@/hooks/form-context';
import {
	TextField,
	TextAreaField,
	SwitchField,
	BooleanField,
	SubmitErrors,
	PasswordField,
	SubscriptionTierField,
	ImagePickerField,
	ChannelSelectField,
	MultiSelectField,
	ChannelMultiSelectField,
	CategoryMultiSelectField,
	DateTimeField,
	TierListField,
	MoneyCentsField,
	ColorField,
} from '@/components/forms/app-fields';
import { CreateButton, ResetButton } from '@/components/forms/app-buttons';

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		TextField,
		TextAreaField,
		SwitchField,
		BooleanField,
		PasswordField,
		SubscriptionTierField,
		ImagePickerField,
		ChannelSelectField,
		MultiSelectField,
		ChannelMultiSelectField,
		CategoryMultiSelectField,
		DateTimeField,
		TierListField,
		MoneyCentsField,
		ColorField,
	},
	formComponents: {
		SubmitErrors,
		CreateButton,
		ResetButton,
	},
});
