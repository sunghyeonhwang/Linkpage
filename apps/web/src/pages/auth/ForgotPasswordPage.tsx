import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import FormField from '../../components/molecules/FormField';
import { authApi } from '../../services/authApi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success('비밀번호 재설정 이메일을 발송했습니다');
    } catch {
      toast.error('요청 처리 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">이메일을 확인해주세요</h2>
        <p className="text-sm text-gray-500 mb-6">
          <strong>{email}</strong>로 비밀번호 재설정 링크를 발송했습니다.
        </p>
        <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">비밀번호 재설정</h2>
      <p className="text-sm text-gray-500 mb-6">가입한 이메일을 입력해주세요</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="이메일" required>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            autoComplete="email"
          />
        </FormField>

        <Button type="submit" fullWidth loading={loading}>
          재설정 이메일 보내기
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          로그인으로 돌아가기
        </Link>
      </p>
    </div>
  );
}
