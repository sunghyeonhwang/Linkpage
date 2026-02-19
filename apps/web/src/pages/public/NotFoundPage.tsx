import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <p className="text-lg text-gray-600 mb-6">페이지를 찾을 수 없습니다</p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
