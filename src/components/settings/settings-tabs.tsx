'use client';
import * as React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

type Item = { value: string; label: string; content: React.ReactNode };

type SettingsTabsProps = {
	items: Item[];
	defaultValue?: string;
	className?: string;
};

export function SettingsTabs({
	items,
	defaultValue,
	className,
}: SettingsTabsProps) {
	const _default = defaultValue ?? items[0]?.value;
	return (
		<Tabs
			defaultValue={_default}
			className={className ?? 'w-full'}
		>
			<TabsList className="flex w-full justify-start overflow-x-auto">
				{items.map((it) => (
					<TabsTrigger
						key={it.value}
						value={it.value}
					>
						{it.label}
					</TabsTrigger>
				))}
			</TabsList>
			{items.map((it) => (
				<TabsContent
					key={it.value}
					value={it.value}
					className="mt-4"
				>
					{it.content}
				</TabsContent>
			))}
		</Tabs>
	);
}
