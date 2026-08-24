/**
 * Consistent Avatar Helper for Michuu TMS
 * Ensures identical avatar display across Public Navbar, User Dashboard, Profile, and Admin Portal.
 */

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
