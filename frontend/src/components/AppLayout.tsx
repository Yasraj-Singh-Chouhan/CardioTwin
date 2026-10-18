import { Outlet, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useTheme } from '../context/ThemeContext';

export default function AppLayout() {
  const params = useParams<{ id?: string }>();
  const { isDark } = useTheme();

  return (
    <div
      className={`min-h-screen relative overflow-x-hidden selection:bg-cyan-500 selection:text-white transition-colors duration-500 ${
        isDark ? 'bg-[#080d16] text-[#e2f1ef]' : 'text-[#111e1d]'
      }`}
      style={{
        background: isDark
          ? 'radial-gradient(ellipse at 15% 15%, rgba(0, 242, 254, 0.07) 0%, transparent 45%), radial-gradient(ellipse at 85% 75%, rgba(255, 51, 102, 0.06) 0%, transparent 45%), #080d16'
          : 'linear-gradient(135deg, #E8F7F5 0%, #DBF0F5 50%, #D6EEF7 100%)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Floating Ambient Physiological Aurora Glow Orbs */}
      <div
        className={`fixed -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none blur-[140px] transition-opacity duration-700 ${
          isDark ? 'opacity-30' : 'opacity-40'
        }`}
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(0, 242, 254, 0.35) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(0, 102, 111, 0.25) 0%, transparent 70%)',
        }}
      />
      <div
        className={`fixed top-1/4 -right-40 w-[650px] h-[650px] rounded-full pointer-events-none blur-[150px] transition-opacity duration-700 ${
          isDark ? 'opacity-25' : 'opacity-40'
        }`}
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(255, 51, 102, 0.25) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(207, 229, 251, 0.6) 0%, transparent 70%)',
        }}
      />
      <div
        className={`fixed -bottom-40 left-1/3 w-[550px] h-[550px] rounded-full pointer-events-none blur-[130px] transition-opacity duration-700 ${
          isDark ? 'opacity-20' : 'opacity-30'
        }`}
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(0, 245, 160, 0.20) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(47, 191, 155, 0.2) 0%, transparent 70%)',
        }}
      />

      {/* Main Structural Shell */}
      <Sidebar activePatientId={params.id} />
      <div className="pl-64 flex flex-col min-h-screen relative z-10">
        <TopBar patientId={params.id} />
        <main className="flex-1 w-full pt-18 px-6 pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
