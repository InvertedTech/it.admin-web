'use client';
import * as React from 'react';
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from '@/components/ui/card';
import { FieldGroup } from '@/components/ui/field';

type SettingsSectionProps = {
	title: string;
	description?: string;
	children: React.ReactNode;
};

export function SettingsSection({
	title,
	description,
	children,
}: SettingsSectionProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{description ? <CardDescription>{description}</CardDescription> : null}
			</CardHeader>
			<CardContent>
				<FieldGroup>{children}</FieldGroup>
			</CardContent>
		</Card>
	);
}
