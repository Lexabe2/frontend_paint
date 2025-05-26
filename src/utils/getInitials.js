export function getInitials(fullName) {
  if (!fullName) return '';
  const names = fullName.trim().split(' ');
  const firstInitial = names[0]?.[0]?.toUpperCase() || '';
  const secondInitial = names[1]?.[0]?.toUpperCase() || '';
  return firstInitial + secondInitial;
}
