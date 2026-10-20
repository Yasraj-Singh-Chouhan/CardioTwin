import { Outlet, useParams, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppLayout() {
  const params = useParams<{ id?: string }>();
  const location = useLocation();

  // On the primary Digital Twin page (/patients/:id), hide topbar for full-bleed minimal experience
  const isPrimaryTwinPage = Boolean(
    params.id && location.pathname === `/patients/${params.id}`
  );

  return (
    <div
      className="min-h-screen relative overflow-x-hidden text-[#0f172a] selection:bg-[#1d5bf0] selection:text-white"
      style={{
        backgroundColor: '#edf2f8',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Exact Slim Left Minimal Sidebar Rail */}
      <Sidebar activePatientId={params.id} />

      {/* Main Structural Shell */}
      <div className="pl-[74px] flex flex-col min-h-screen relative z-10">
        {!isPrimaryTwinPage && <TopBar patientId={params.id} />}
        <main
          className={`flex-1 w-full ${
            isPrimaryTwinPage ? 'p-0' : 'p-6 lg:p-8 max-w-[1560px] mx-auto'
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
