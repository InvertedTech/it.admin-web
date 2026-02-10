import { defaultLexKitTheme, mergeThemes, type LexKitTheme } from '@lexkit/editor';

export const shadcnTheme: LexKitTheme = mergeThemes(defaultLexKitTheme, {
	container: 'lexkit-container',
	wrapper: 'lexkit-wrapper',
	toolbar: {
		button: 'lexkit-toolbar-button',
		buttonActive: 'lexkit-toolbar-button-active',
		buttonDisabled: 'lexkit-toolbar-button-disabled',
		group: 'lexkit-toolbar-group',
	},
	floatingToolbar: {
		container: 'lexkit-floating-toolbar',
		button: 'lexkit-toolbar-button',
		buttonActive: 'lexkit-toolbar-button-active',
	},
	contextMenu: {
		container: 'lexkit-context-menu',
		item: 'lexkit-context-item',
		itemDisabled: 'lexkit-context-item-disabled',
	},
	htmlEmbed: {
		container: 'lexkit-html-embed',
		preview: 'lexkit-html-embed-preview',
		editor: 'lexkit-html-embed-editor',
		textarea: 'lexkit-html-embed-textarea',
		toggle: 'lexkit-html-embed-toggle',
		content: 'lexkit-html-embed-content',
	},
});
