import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Spinner from '../../components/atoms/Spinner';
import { authApi } from '../../services/authApi';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    authApi
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center py-8">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-gray-500">이메일 인증 중...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">인증 실패</h2>
        <p className="text-sm text-gray-500 mb-6">
          유효하지 않거나 이미 사용된 인증 링크입니다.
        </p>
        <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-gray-900 mb-2">이메일 인증 완료</h2>
      <p className="text-sm text-gray-500 mb-6">이메일이 성공적으로 인증되었습니다.</p>
      <Link to="/dashboard" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
        대시보드로 이동
      </Link>
    </div>
  );
}
