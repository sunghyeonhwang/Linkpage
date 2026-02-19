import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import FormField from '../../components/molecules/FormField';
import { authApi } from '../../services/authApi';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (password.length < 8) errs.password = '비밀번호는 8자 이상이어야 합니다';
    if (password !== confirmPassword) errs.confirmPassword = '비밀번호가 일치하지 않습니다';
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      toast.success('비밀번호가 재설정되었습니다');
    } catch {
      toast.error('유효하지 않거나 만료된 링크입니다');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">유효하지 않은 링크</h2>
        <p className="text-sm text-gray-500 mb-6">비밀번호 재설정 링크가 올바르지 않습니다.</p>
        <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
          다시 요청하기
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">비밀번호 재설정 완료</h2>
        <p className="text-sm text-gray-500 mb-6">새 비밀번호로 로그인해주세요.</p>
        <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          로그인하기
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">새 비밀번호 설정</h2>
      <p className="text-sm text-gray-500 mb-6">새로운 비밀번호를 입력해주세요</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="새 비밀번호" error={errors.password} required>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8자 이상"
            error={!!errors.password}
            autoComplete="new-password"
          />
        </FormField>

        <FormField label="비밀번호 확인" error={errors.confirmPassword} required>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호를 다시 입력해주세요"
            error={!!errors.confirmPassword}
            autoComplete="new-password"
          />
        </FormField>

        <Button type="submit" fullWidth loading={loading}>
          비밀번호 재설정
        </Button>
      </form>
    </div>
  );
}
