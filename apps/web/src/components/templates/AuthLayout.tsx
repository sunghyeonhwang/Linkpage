import { Outlet } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <RouterLink to="/" className="flex items-center justify-center mb-8">
          <h1 className="text-2xl font-bold text-primary-600">LinkPage</h1>
        </RouterLink>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
