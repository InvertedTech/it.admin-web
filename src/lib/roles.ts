export type Role =
	| 'owner' // Can do anything on the system
	| 'admin' // Can do anything on the system except view/change sensitive payment settings or perform backups - only admins and owners can grant roles
	| 'backup' // Can access backup and restores
	| 'ops' // Can disable/enable services/website
	| 'service' // Used for services to talk to outher services
	| 'con_publisher' // Can write or publish a piece of content
	| 'con_writer' // Can write a piece of content, but cannot publish it
	| 'com_mod' // Can moderate comments
	| 'com_appellate' // not implemented yet - Can manage comment moderation appeals
	| 'bot_verification' // Allows bots limited access to certain elevated functions
	| 'evt_manager' // Can create/edit/delete events
	| 'evt_tkt_manager' // Can assist users with issues with event ticket reservation issues
	| 'member_manager' // Can assis user with membership issues: can names, email, perform password resets, and TOTP resets, etc... - Cannot manage any owners or admins
	| 'sub_manager'; // Can assis user with subscription issues: edit sub data, manually link subs, stop subs, change subs tiers, etc...

export const Roles: Role[] = [
	'owner',
	'admin',
	'backup',
	'ops',
	'service',
	'con_publisher',
	'con_writer',
	'com_mod',
	'com_appellate',
	'bot_verification',
	'evt_manager',
	'evt_tkt_manager',
	'member_manager',
	'sub_manager',
];

// Human-friendly labeling and categories for display
export type RoleCategory =
	| 'Administration'
	| 'Content'
	| 'Comments'
	| 'Event'
	| 'Bots'
	| 'Members'
	| 'Subscriptions';

export const RoleMeta: Record<Role, { label: string; category: RoleCategory }> =
	{
		owner: { label: 'Owner', category: 'Administration' },
		admin: { label: 'Admin', category: 'Administration' },
		backup: { label: 'Backup', category: 'Administration' },
		ops: { label: 'Ops', category: 'Administration' },
		service: { label: 'Service', category: 'Administration' },
		con_publisher: { label: 'Content Publisher', category: 'Content' },
		con_writer: { label: 'Content Writer', category: 'Content' },
		com_mod: { label: 'Comments Moderator', category: 'Comments' },
		com_appellate: { label: 'Comments Appellate', category: 'Comments' },
		bot_verification: { label: 'Bot Verification', category: 'Bots' },
		evt_manager: { label: 'Event Manager', category: 'Event' },
		evt_tkt_manager: { label: 'Event Ticket Manager', category: 'Event' },
		member_manager: { label: 'Member Manager', category: 'Members' },
		sub_manager: {
			label: 'Subscription Manager',
			category: 'Subscriptions',
		},
	};

export const RoleCategories: RoleCategory[] = [
	'Administration',
	'Content',
	'Comments',
	'Event',
	'Bots',
	'Members',
	'Subscriptions',
];
