import type { CommandPaletteItem } from '@lexkit/editor';

type CommandHelpers = {
	commands: Record<string, any>;
	hasExtension: (name: string) => boolean;
};

function promptForLink() {
	if (typeof window === 'undefined') return null;
	const url = window.prompt('Link URL');
	if (!url) return null;
	const text = window.prompt('Link text (optional)') ?? undefined;
	return { url, text };
}

export function buildCommandPaletteItems({
	commands,
	hasExtension,
}: CommandHelpers): CommandPaletteItem[] {
	const items: CommandPaletteItem[] = [];

	const push = (item: CommandPaletteItem | null) => {
		if (item) items.push(item);
	};

	push({
		id: 'undo',
		label: 'Undo',
		category: 'History',
		shortcut: 'Ctrl+Z',
		action: () => commands.undo?.(),
	});
	push({
		id: 'redo',
		label: 'Redo',
		category: 'History',
		shortcut: 'Ctrl+Shift+Z',
		action: () => commands.redo?.(),
	});

	push({
		id: 'bold',
		label: 'Bold',
		category: 'Formatting',
		shortcut: 'Ctrl+B',
		action: () => commands.toggleBold?.(),
	});
	push({
		id: 'italic',
		label: 'Italic',
		category: 'Formatting',
		shortcut: 'Ctrl+I',
		action: () => commands.toggleItalic?.(),
	});
	push({
		id: 'underline',
		label: 'Underline',
		category: 'Formatting',
		shortcut: 'Ctrl+U',
		action: () => commands.toggleUnderline?.(),
	});
	push({
		id: 'strikethrough',
		label: 'Strikethrough',
		category: 'Formatting',
		action: () => commands.toggleStrikethrough?.(),
	});
	push({
		id: 'indent',
		label: 'Indent',
		category: 'Formatting',
		action: () => commands.indent?.(),
	});
	push({
		id: 'outdent',
		label: 'Outdent',
		category: 'Formatting',
		action: () => commands.outdent?.(),
	});

	if (hasExtension('blockFormat')) {
		push({
			id: 'paragraph',
			label: 'Paragraph',
			category: 'Blocks',
			action: () => commands.toggleParagraph?.(),
		});
		push({
			id: 'heading-1',
			label: 'Heading 1',
			category: 'Blocks',
			action: () => commands.toggleHeading?.('h1'),
		});
		push({
			id: 'heading-2',
			label: 'Heading 2',
			category: 'Blocks',
			action: () => commands.toggleHeading?.('h2'),
		});
		push({
			id: 'heading-3',
			label: 'Heading 3',
			category: 'Blocks',
			action: () => commands.toggleHeading?.('h3'),
		});
		push({
			id: 'quote',
			label: 'Quote',
			category: 'Blocks',
			action: () => commands.toggleBlockFormat?.('quote'),
		});
	}

	if (hasExtension('list')) {
		push({
			id: 'list-bullet',
			label: 'Bulleted List',
			category: 'Lists',
			action: () => commands.toggleUnorderedList?.(),
		});
		push({
			id: 'list-ordered',
			label: 'Numbered List',
			category: 'Lists',
			action: () => commands.toggleOrderedList?.(),
		});
	}

	if (hasExtension('link')) {
		push({
			id: 'link',
			label: 'Insert Link',
			category: 'Insert',
			action: () => {
				const data = promptForLink();
				if (!data) return;
				commands.insertLink?.(data.url, data.text);
			},
		});
		push({
			id: 'unlink',
			label: 'Remove Link',
			category: 'Insert',
			action: () => commands.removeLink?.(),
		});
	}


	if (hasExtension('horizontalRule')) {
		push({
			id: 'horizontal-rule',
			label: 'Horizontal Rule',
			category: 'Insert',
			action: () => commands.insertHorizontalRule?.(),
		});
	}

	return items;
}
