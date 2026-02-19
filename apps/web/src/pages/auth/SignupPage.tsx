import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import FormField from '../../components/molecules/FormField';
import { authApi } from '../../services/authApi';
import { useAuthStore } from '../../stores/authStore';

export default function SignupPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!email) errs.email = '이메일을 입력해주세요';
    if (!password) errs.password = '비밀번호를 입력해주세요';
    else if (password.length < 8) errs.password = '비밀번호는 8자 이상이어야 합니다';
    if (password !== confirmPassword) errs.confirmPassword = '비밀번호가 일치하지 않습니다';

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.signup(email, password);
      if (data.data) {
        setAuth(data.data.token, {
          id: data.data.user.id,
          email: data.data.user.email,
          emailVerified: data.data.user.email_verified,
        });
        toast.success('회원가입이 완료되었습니다');
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || '회원가입에 실패했습니다';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">회원가입</h2>
      <p className="text-sm text-gray-500 mb-6">LinkPage 계정을 만들어보세요</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="이메일" error={errors.email} required>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            error={!!errors.email}
            autoComplete="email"
          />
        </FormField>

        <FormField label="비밀번호" error={errors.password} required>
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
          회원가입
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          로그인
        </Link>
      </p>
    </div>
  );
}
