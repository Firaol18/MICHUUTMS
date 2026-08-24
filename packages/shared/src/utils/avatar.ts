/**
 * Consistent Avatar Helper for Michuu TMS
 * Ensures identical avatar display across Public Navbar, User Dashboard, Profile, and Admin Portal.
 */

const CURATED_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
];

export function getUserAvatarUrl(user?: { name?: string; email?: string; avatarUrl?: string } | null): string {
  if (user?.avatarUrl && user.avatarUrl.trim().length > 0) {
    return user.avatarUrl;
  }

  const nameOrEmail = user?.name || user?.email || 'Traveler';
  const cleanName = encodeURIComponent(nameOrEmail);

  // Return a crisp, high-res branded UI avatar with user initials
  return `https://ui-avatars.com/api/?name=${cleanName}&background=2563eb&color=ffffff&bold=true&size=128`;
}

export function getTravelerAvatar(user?: { name?: string; email?: string; avatarUrl?: string } | null): string {
  return getUserAvatarUrl(user);
}
