const ROLE_OWNER = 'owner';
const ROLE_ADMIN = 'admin';
const ROLE_BACKUP = 'backup';
const ROLE_OPS = 'ops';
const ROLE_SERVICE = 'service';
const ROLE_CONTENT_PUBLISHER = 'con_publisher';
const ROLE_CONTENT_WRITER = 'con_writer';
const ROLE_COMMENT_MODERATOR = 'com_mod';
const ROLE_COMMENT_APPELLATE_JUDGE = 'com_appellate';
const ROLE_BOT_VERIFICATION = 'bot_verification';
const ROLE_EVENT_CREATOR = 'evt_creator';
const ROLE_EVENT_MODERATOR = 'evt_moderator';
const ROLE_MEMBER_MANAGER = 'member_manager';
const ROLE_SUBSCRIPTION_MANAGER = 'sub_manager';

export function hasRole(roles: string[], role: string): boolean {
	return roles.includes(role);
}

export function hasAnyRole(roles: string[], ...allowed: string[]): boolean {
	for (const r of allowed) {
		if (roles.includes(r)) return true;
	}
	return false;
}

export const isBackup = (roles: string[]) => hasRole(roles, ROLE_BACKUP);

export const isOwner = (roles: string[]) => hasRole(roles, ROLE_OWNER);

export const isAdmin = (roles: string[]) => hasRole(roles, ROLE_ADMIN);

export const isOps = (roles: string[]) => hasRole(roles, ROLE_OPS);

export const isService = (roles: string[]) => hasRole(roles, ROLE_SERVICE);

export const isPublisher = (roles: string[]) =>
	hasRole(roles, ROLE_CONTENT_PUBLISHER);

export const isWriter = (roles: string[]) =>
	hasRole(roles, ROLE_CONTENT_WRITER);

export const isCommentModerator = (roles: string[]) =>
	hasRole(roles, ROLE_COMMENT_MODERATOR);

export const isCommentAppellateJudge = (roles: string[]) =>
	hasRole(roles, ROLE_COMMENT_APPELLATE_JUDGE);

export const isAdminOrHigher = (roles: string[]) =>
	isAdmin(roles) || isOwner(roles);

export const isPublisherOrHigher = (roles: string[]) =>
	isPublisher(roles) || isAdminOrHigher(roles);

export const isWriterOrHigher = (roles: string[]) =>
	isWriter(roles) || isPublisherOrHigher(roles);

export const isCommentModeratorOrHigher = (roles: string[]) =>
	isCommentModerator(roles) || isPublisherOrHigher(roles);

export const isCommentAppellateJudgeOrHigher = (roles: string[]) =>
	isCommentAppellateJudge(roles) || isAdminOrHigher(roles);

export const isMemberManager = (roles: string[]) =>
	hasRole(roles, ROLE_MEMBER_MANAGER);

export const isSubscriptionManager = (roles: string[]) =>
	hasRole(roles, ROLE_SUBSCRIPTION_MANAGER);

export const isMemberManagerOrHigher = (roles: string[]) =>
	isMemberManager(roles) || isAdminOrHigher(roles);

export const isSubscriptionManagerOrHigher = (roles: string[]) =>
	isSubscriptionManager(roles) || isAdminOrHigher(roles);

export const canPublish = (roles: string[]) => isPublisherOrHigher(roles);

export const canCreateContent = (roles: string[]) => isWriterOrHigher(roles);

export const canCreateEvent = (roles: string[]) =>
	hasAnyRole(roles, ROLE_EVENT_CREATOR, ROLE_ADMIN, ROLE_OWNER);

export const canModerateEvent = (roles: string[]) =>
	hasAnyRole(
		roles,
		ROLE_EVENT_CREATOR,
		ROLE_EVENT_MODERATOR,
		ROLE_ADMIN,
		ROLE_OWNER,
	);

export const canManageMembers = (roles: string[]) =>
	isMemberManagerOrHigher(roles);

export const canManageSubscriptions = (roles: string[]) =>
	isSubscriptionManagerOrHigher(roles);

export default {
	hasRole,
	hasAnyRole,
	isBackup,
	isOwner,
	isAdmin,
	isOps,
	isService,
	isPublisher,
	isWriter,
	isCommentModerator,
	isCommentAppellateJudge,
	isAdminOrHigher,
	isPublisherOrHigher,
	isWriterOrHigher,
	isCommentModeratorOrHigher,
	isCommentAppellateJudgeOrHigher,
	isMemberManager,
	isSubscriptionManager,
	isMemberManagerOrHigher,
	isSubscriptionManagerOrHigher,
	canPublish,
	canCreateContent,
	canCreateEvent,
	canModerateEvent,
	canManageMembers,
	canManageSubscriptions,
};
