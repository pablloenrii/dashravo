interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const getInitials = (name?: string) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getColorFromName = (name?: string) => {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-teal-500',
  ];

  if (!name) return colors[0];
  const charCode = name.charCodeAt(0);
  return colors[charCode % colors.length];
};

export function Avatar({ src, name, size = 'md', online }: AvatarProps) {
  const sizeClass = sizeClasses[size];
  const bgColor = getColorFromName(name);

  return (
    <div className="relative inline-block">
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeClass} rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-md`}
        />
      ) : (
        <div className={`
          ${sizeClass} rounded-full flex items-center justify-center
          ${bgColor} text-white font-bold
          border-2 border-white dark:border-slate-800 shadow-md
        `}>
          {getInitials(name)}
        </div>
      )}

      {online && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800 shadow-md" />
      )}
    </div>
  );
}
