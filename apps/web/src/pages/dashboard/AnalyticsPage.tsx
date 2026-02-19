import { useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Eye, MousePointerClick, TrendingUp, BarChart3 } from 'lucide-react';
import Spinner from '../../components/atoms/Spinner';
import { useProfileStore } from '../../stores/profileStore';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import type { AnalyticsPeriod } from '@linkpage/shared';

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: '7d', label: '7일' },
  { value: '30d', label: '30일' },
  { value: '90d', label: '90일' },
];

export default function AnalyticsPage() {
  const currentProfileId = useProfileStore((s) => s.currentProfileId);
  const fetchProfiles = useProfileStore((s) => s.fetchProfiles);
  const { data, period, loading, fetchAnalytics, setPeriod } = useAnalyticsStore();

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  useEffect(() => {
    if (currentProfileId) {
      fetchAnalytics(currentProfileId);
    }
  }, [currentProfileId, period, fetchAnalytics]);

  if (!currentProfileId || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-gray-500">
        통계 데이터를 불러올 수 없습니다.
      </div>
    );
  }

  const { summary, dailyStats, linkStats } = data;

  const chartData = dailyStats.map((d) => ({
    ...d,
    date: d.date.slice(5), // "MM-DD"
  }));

  const summaryCards = [
    { label: '총 조회수', value: summary.totalViews, icon: Eye, color: 'text-blue-600 bg-blue-50' },
    { label: '총 클릭수', value: summary.totalClicks, icon: MousePointerClick, color: 'text-orange-600 bg-orange-50' },
    { label: '오늘 조회수', value: summary.todayViews, icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
    { label: '오늘 클릭수', value: summary.todayClicks, icon: BarChart3, color: 'text-green-600 bg-green-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">통계</h1>
        <div className="flex gap-1 bg-white rounded-lg p-1 border border-gray-200">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === p.value
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">일별 추이</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="views"
                name="조회수"
                stroke="#7C3AED"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="clicks"
                name="클릭수"
                stroke="#F97316"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Link Stats Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">링크별 클릭수</h2>
        </div>
        {linkStats.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-400">
            아직 링크가 없습니다.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">링크</th>
                <th className="text-right text-xs font-medium text-gray-500 px-6 py-3 w-24">클릭수</th>
              </tr>
            </thead>
            <tbody>
              {linkStats.map((link) => (
                <tr key={link.linkId} className="border-b border-gray-50 last:border-0">
                  <td className="px-6 py-3">
                    <p className="text-sm font-medium text-gray-900">{link.label}</p>
                    <p className="text-xs text-gray-400 truncate max-w-xs">{link.url}</p>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span className="text-sm font-semibold text-gray-900">{link.clicks.toLocaleString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
