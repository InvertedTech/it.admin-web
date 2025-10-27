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
	CmsBodyField,
	HtmlBodyField,
	RichBodyField,
	RichBodyFieldMenubar,
	YoutubeLinkField,
	RumbleLinkField,
} from '@/components/forms/fields';
import {
	CreateButton,
	ResetButton,
	SaveChangesBar,
} from '@/components/forms/app-buttons';

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
		CmsBodyField,
		HtmlBodyField,
		RichBodyField,
		RichBodyFieldMenubar,
		YoutubeLinkField,
		RumbleLinkField,
	},
	formComponents: {
		SubmitErrors,
		CreateButton,
		ResetButton,
		SaveChangesBar,
	},
});
