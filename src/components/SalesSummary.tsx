import { FaCheckCircle, FaHourglassHalf, FaPercentage, FaDollarSign } from 'react-icons/fa';

interface SalesSummaryProps {
  summary: {
    approvedCount: number;
    pendingCount: number;
    conversionRate: number;
    totalRevenue: number;
  } | null;
}

const cardStyles = [
  'border-purple-700',
  'border-yellow-500',
  'border-blue-600',
  'border-green-600',
];
const iconBg = [
  'bg-purple-700/15 text-purple-500',
  'bg-yellow-500/15 text-yellow-500',
  'bg-blue-600/15 text-blue-500',
  'bg-green-600/15 text-green-500',
];

const SummaryCard = ({ icon, label, value, subtext, borderClass, iconClass }) => (
  <div
    className={`relative bg-[#020204] border ${borderClass} rounded-2xl px-7 py-6 flex items-center shadow-md min-h-[120px]`}
    style={{ boxShadow: '0 12px 40px 0 #000b, 0 2px 8px 0 #0006, 0 0px 0px 1.5px #23243a' }}
  >
    <div className="flex-1">
      <p className="text-sm text-gray-400 font-medium mb-1">{label}</p>
      <p className="text-3xl font-extrabold text-white leading-tight">{value}</p>
      <p className="text-xs text-gray-500 mt-1 font-medium">{subtext}</p>
    </div>
    <div className={`w-12 h-12 flex items-center justify-center rounded-full ${iconClass} ml-4 shadow-inner`}>
      {icon}
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-[#020204] border border-gray-800 rounded-2xl px-7 py-6 flex-1 animate-pulse min-h-[120px] flex items-center" style={{ boxShadow: '0 12px 40px 0 #000b, 0 2px 8px 0 #0006, 0 0px 0px 1.5px #23243a' }}>
    <div className="flex-1">
      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-8 bg-gray-700 rounded w-1/2 mt-2"></div>
      <div className="h-3 bg-gray-700 rounded w-1/4 mt-2"></div>
    </div>
    <div className="h-12 w-12 bg-gray-800 rounded-full ml-4"></div>
  </div>
)

export default function SalesSummary({ summary }: SalesSummaryProps) {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  const { approvedCount, pendingCount, conversionRate, totalRevenue } = summary;

  const summaryItems = [
    {
      icon: <FaCheckCircle size={28} />,
      label: 'Vendas aprovadas',
      value: approvedCount,
      subtext: 'Total de vendas aprovadas',
      borderClass: cardStyles[0],
      iconClass: iconBg[0],
    },
    {
      icon: <FaHourglassHalf size={28} />,
      label: 'Vendas pendentes',
      value: pendingCount,
      subtext: 'Aguardando confirmação',
      borderClass: cardStyles[1],
      iconClass: iconBg[1],
    },
    {
      icon: <FaPercentage size={28} />,
      label: 'Taxa de conversão',
      value: `${conversionRate.toFixed(2)}%`,
      subtext: 'Aprovadas + Total',
      borderClass: cardStyles[2],
      iconClass: iconBg[2],
    },
    {
      icon: <FaDollarSign size={28} />,
      label: 'Valor total',
      value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      subtext: 'Receita bruta',
      borderClass: cardStyles[3],
      iconClass: iconBg[3],
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {summaryItems.map((item, idx) => (
        <SummaryCard
          key={idx}
          icon={item.icon}
          label={item.label}
          value={item.value}
          subtext={item.subtext}
          borderClass={item.borderClass}
          iconClass={item.iconClass}
        />
      ))}
    </div>
  );
} 