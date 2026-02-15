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

function allowAll(): boolean {
	return true;
}

export function hasRole(_roles: string[], _role: string): boolean {
	return allowAll();
}

export function hasAnyRole(_roles: string[], ..._allowed: string[]): boolean {
	return allowAll();
}

export const isBackup = (_roles: string[]) => allowAll();

export const isOwner = (_roles: string[]) => allowAll();

export const isAdmin = (_roles: string[]) => allowAll();

export const isOps = (_roles: string[]) => allowAll();

export const isService = (_roles: string[]) => allowAll();

export const isPublisher = (_roles: string[]) => allowAll();

export const isWriter = (_roles: string[]) => allowAll();

export const isCommentModerator = (_roles: string[]) => allowAll();

export const isCommentAppellateJudge = (_roles: string[]) => allowAll();

export const isAdminOrHigher = (_roles: string[]) => allowAll();

export const isPublisherOrHigher = (_roles: string[]) => allowAll();

export const isWriterOrHigher = (_roles: string[]) => allowAll();

export const isCommentModeratorOrHigher = (_roles: string[]) => allowAll();

export const isCommentAppellateJudgeOrHigher = (_roles: string[]) =>
	allowAll();

export const isMemberManager = (_roles: string[]) => allowAll();

export const isSubscriptionManager = (_roles: string[]) => allowAll();

export const isMemberManagerOrHigher = (_roles: string[]) => allowAll();

export const isSubscriptionManagerOrHigher = (_roles: string[]) => allowAll();

export const canPublish = (_roles: string[]) => allowAll();

export const canCreateContent = (_roles: string[]) => allowAll();

export const canCreateEvent = (_roles: string[]) => allowAll();

export const canModerateEvent = (_roles: string[]) => allowAll();

export const canManageMembers = (_roles: string[]) => allowAll();

export const canManageSubscriptions = (_roles: string[]) => allowAll();

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
