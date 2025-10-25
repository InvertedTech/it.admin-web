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
} from '@/components/forms/app-fields';
import { CreateButton } from '@/components/forms/buttons/create-button';

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
  },
	formComponents: {
		SubmitErrors,
		CreateButton,
	},
});
