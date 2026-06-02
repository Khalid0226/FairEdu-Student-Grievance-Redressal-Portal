'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const actions = [
  {
    title: 'Report Incident',
    description: 'Submit new report',
    href: '/student/reports/new',
    icon: '📝',
    color: 'bg-orange-500',
    mobileIcon: '➕'
  },
  {
    title: 'My Reports',
    description: 'Track submissions',
    href: '/student/reports',
    icon: '📋',
    color: 'bg-zinc-900 dark:bg-zinc-100',
    mobileIcon: '📄'
  },
  {
    title: 'Messages',
    description: 'View responses',
    href: '/student/messages',
    icon: '💬',
    color: 'bg-zinc-900 dark:bg-zinc-100',
    mobileIcon: '💬'
  },
  {
    title: 'Emergency',
    description: 'SOS & Resources',
    href: '/student/emergency', // Manual check: http://localhost:3000/student/emergency
    icon: '🚨',
    color: 'bg-red-600',
    mobileIcon: '🆘'
  },
];

export default function QuickActions() {
  const router = useRouter();

  // Next.js Link kabhi kabhi cache karta hai, 
  // Isliye hum force navigation function use kar sakte hain agar issue aaye
  const handleNavigation = (e, href) => {
    e.preventDefault();
    router.push(href);
    router.refresh(); // Ye page data ko refresh karega taaki 404 cache na ho
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2.5rem] p-6 md:p-8 shadow-sm transition-all duration-300 mb-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white">
            Quick Actions
          </h2>
          <div className="h-1 w-12 bg-orange-500 mt-1 rounded-full"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {actions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            onClick={(e) => handleNavigation(e, action.href)}
            className="flex flex-col items-center text-center p-5 md:p-6 rounded-[2rem] border-2 border-transparent bg-zinc-50 dark:bg-zinc-800/40 hover:bg-white dark:hover:bg-zinc-800 hover:border-orange-500 dark:hover:border-orange-500 transition-all duration-500 group shadow-sm hover:shadow-2xl hover:shadow-orange-500/10"
          >
            <div className={`p-4 md:p-5 rounded-2xl ${action.color} mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-lg`}>
              <span className="text-xl md:text-3xl text-white dark:text-zinc-900 hidden md:block">
                {action.icon}
              </span>
              <span className="text-xl md:text-3xl text-white dark:text-zinc-900 md:hidden">
                {action.mobileIcon}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-[11px] md:text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors duration-200">
                {action.title}
              </h3>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}