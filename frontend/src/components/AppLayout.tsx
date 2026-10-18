import { Outlet, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppLayout() {
  const params = useParams<{ id?: string }>();

  return (
    <div
      className="min-h-screen relative overflow-x-hidden selection:bg-[#00666f] selection:text-white"
      style={{
        background: 'linear-gradient(135deg, #E8F7F5 0%, #DBF0F5 50%, #D6EEF7 100%)',
        color: '#111e1d',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Floating Ambient Physiological Aurora Glow Orbs */}
      <div
        className="fixed -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none opacity-40 blur-[130px]"
        style={{ background: 'radial-gradient(circle, rgba(0, 102, 111, 0.25) 0%, transparent 70%)' }}
      />
      <div
        className="fixed top-1/4 -right-40 w-[650px] h-[650px] rounded-full pointer-events-none opacity-40 blur-[140px]"
        style={{ background: 'radial-gradient(circle, rgba(207, 229, 251, 0.6) 0%, transparent 70%)' }}
      />
      <div
        className="fixed -bottom-40 left-1/3 w-[550px] h-[550px] rounded-full pointer-events-none opacity-30 blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(47, 191, 155, 0.2) 0%, transparent 70%)' }}
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
