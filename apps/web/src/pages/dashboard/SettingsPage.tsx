import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { Copy, Download } from 'lucide-react';
import Button from '../../components/atoms/Button';
import Spinner from '../../components/atoms/Spinner';
import { useProfileStore } from '../../stores/profileStore';
import { useAuthStore } from '../../stores/authStore';

export default function SettingsPage() {
  const { currentProfile, fetchProfiles, loading } = useProfileStore();
  const { user } = useAuthStore();
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (currentProfile) {
      setShareUrl(`${window.location.origin}/p/${currentProfile.slug}`);
    }
  }, [currentProfile]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('URL이 복사되었습니다');
  };

  const handleDownloadQR = () => {
    const svg = document.querySelector('#qr-code svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      const a = document.createElement('a');
      a.download = `linkpage-qr-${currentProfile?.slug}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Account Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">계정 정보</h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500">이메일</p>
            <p className="text-sm text-gray-900">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">이메일 인증</p>
            <p className="text-sm">
              {user?.emailVerified ? (
                <span className="text-green-600">인증됨</span>
              ) : (
                <span className="text-amber-600">미인증</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Share & QR */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">공유</h3>

        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 truncate">
            {shareUrl}
          </div>
          <Button size="sm" variant="outline" onClick={handleCopyUrl}>
            <Copy className="w-3.5 h-3.5 mr-1.5" />복사
          </Button>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-sm text-gray-600 mb-3">QR 코드</p>
          <div id="qr-code" className="bg-white p-4 rounded-xl border border-gray-200">
            <QRCodeSVG value={shareUrl} size={160} level="M" />
          </div>
          <Button size="sm" variant="secondary" className="mt-3" onClick={handleDownloadQR}>
            <Download className="w-3.5 h-3.5 mr-1.5" />다운로드
          </Button>
        </div>
      </div>
    </div>
  );
}
