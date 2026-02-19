import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import FormField from '../../components/molecules/FormField';
import { authApi } from '../../services/authApi';
import { useAuthStore } from '../../stores/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!email) return setErrors({ email: '이메일을 입력해주세요' });
    if (!password) return setErrors({ password: '비밀번호를 입력해주세요' });

    setLoading(true);
    try {
      const { data } = await authApi.login(email, password);
      if (data.data) {
        setAuth(data.data.token, {
          id: data.data.user.id,
          email: data.data.user.email,
          emailVerified: data.data.user.email_verified,
        });
        toast.success('로그인되었습니다');
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || '로그인에 실패했습니다';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">로그인</h2>
      <p className="text-sm text-gray-500 mb-6">LinkPage 계정으로 로그인하세요</p>

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
            autoComplete="current-password"
          />
        </FormField>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            비밀번호를 잊으셨나요?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={loading}>
          로그인
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        계정이 없으신가요?{' '}
        <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
          회원가입
        </Link>
      </p>
    </div>
  );
}
