export type Role =
    | 'owner'
    | 'admin'
    | 'backup'
    | 'ops'
    | 'service'
    | 'con_publisher'
    | 'con_writer'
    | 'com_mod'
    | 'com_appellate'
    | 'bot_verification'
    | 'evt_creator'
    | 'evt_moderator'
    | 'member_manager'
    | 'sub_manager';

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
    'evt_creator',
    'evt_moderator',
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

export const RoleMeta: Record<Role, { label: string; category: RoleCategory }> = {
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
    evt_creator: { label: 'Event Creator', category: 'Event' },
    evt_moderator: { label: 'Event Moderator', category: 'Event' },
    member_manager: { label: 'Member Manager', category: 'Members' },
    sub_manager: { label: 'Subscription Manager', category: 'Subscriptions' },
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
