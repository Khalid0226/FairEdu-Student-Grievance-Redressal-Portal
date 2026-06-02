import { ThemeProvider } from '@/hooks/useTheme';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata = {
  title: 'Anti-Ragging Platform',
  description: 'Multi-module platform for anti-ragging management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* FIX: 
        1. bg-white dark:bg-zinc-950 (Saare pages ka default background)
        2. text-slate-900 dark:text-slate-50 (Saare pages ka default text color)
        3. transition-colors (Smooth switching ke liye)
      */}
      <body className="antialiased bg-white dark:bg-zinc-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            {/* Div wrapper isliye taaki agar koi page full height na ho, 
              toh bhi background poora dark dikhe 
            */}
            <div className="min-h-screen flex flex-col">
              {children}
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}