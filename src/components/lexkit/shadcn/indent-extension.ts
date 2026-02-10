'use client';
import { createExtension } from '@lexkit/editor';
import { INDENT_CONTENT_COMMAND, OUTDENT_CONTENT_COMMAND } from 'lexical';

export const indentExtension = createExtension({
	name: 'indent',
	commands: (editor) => ({
		indent: () => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined),
		outdent: () => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined),
	}),
});
