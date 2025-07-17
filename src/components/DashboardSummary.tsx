import { FaWallet, FaHourglassHalf, FaShoppingCart, FaReceipt, FaTasks, FaRegCalendarAlt } from 'react-icons/fa';
import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Select, SelectItem } from "./ui/select";

interface DashboardSummaryProps {
  salesData: {
    totalRevenue: number;
    approvedSales: number;
    pendingSales: number;
    totalSales: number;
  } | null;
  showValues?: boolean;
  children?: React.ReactNode;
  approvedRevenue?: number;
  period: string;
  onPeriodChange: (period: string) => void;
}

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const SummaryCard = ({ icon, label, value }: SummaryCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (typeof window !== 'undefined' && cardRef.current) {
      const html = document.documentElement;
      if (html.classList.contains('light')) {
        cardRef.current.style.backgroundColor = '#fff';
        cardRef.current.style.border = '1px solid #e0e7ef';
        cardRef.current.style.color = '#181818';
      } else {
        cardRef.current.style.backgroundColor = '#020204';
        cardRef.current.style.border = '1px solid #1A0938';
        cardRef.current.style.color = '#fff';
      }
    }
    const observer = new MutationObserver(() => {
      if (cardRef.current) {
        const html = document.documentElement;
        if (html.classList.contains('light')) {
          cardRef.current.style.backgroundColor = '#fff';
          cardRef.current.style.border = '1px solid #e0e7ef';
          cardRef.current.style.color = '#181818';
        } else {
          cardRef.current.style.backgroundColor = '#020204';
          cardRef.current.style.border = '1px solid #1A0938';
          cardRef.current.style.color = '#fff';
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={cardRef}
      className="dashboard-summary-card"
      style={{
        backgroundColor: '#020204',
        border: '1px solid #1A0938',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        flex: 1,
        minWidth: 200,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        boxSizing: 'border-box',
        height: '100%',
        // boxShadow removido para tirar a sombra
      }}
    >
      <div className="card-icon" style={{
        width: 40,
        height: 40,
        background: 'rgba(167, 139, 250, 0.08)',
        border: '1.5px solid #1A0938',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
        boxSizing: 'border-box',
      }}>{icon}</div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', height: '100%' }}>
        <div className="card-title" style={{ color: '#d1d5db', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
          {label}
        </div>
        <div className="card-value" style={{ color: (label === 'Total de Vendas Aprovadas') ? '#22c55e' : 'white', fontSize: '1.875rem', fontWeight: 'bold' }}>
          {value}
        </div>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
    <div style={{
        backgroundColor: '#020204',
        border: '1px solid #1A0938',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        flex: '1 1 340px',
        minWidth: 260,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        boxSizing: 'border-box',
    }}>
        <div style={{ width: '40px', height: '40px', backgroundColor: '#1F2937', borderRadius: '50%' }}></div>
        <div style={{ flex: 1 }}>
            <div style={{ height: '20px', backgroundColor: '#1F2937', borderRadius: '0.25rem', width: '75%', marginBottom: '0.5rem' }}></div>
            <div style={{ height: '30px', backgroundColor: '#1F2937', borderRadius: '0.25rem', width: '50%' }}></div>
        </div>
    </div>
)

// Remover DatePicker e DateRangeSelector
// Novo componente de dropdown de período
const PeriodDropdown = ({ value, onChange }) => (
  <Select value={value} onValueChange={onChange} placeholder="Selecione o período">
    <SelectItem value="max">Máximo</SelectItem>
    <SelectItem value="today">Hoje</SelectItem>
    <SelectItem value="yesterday">Ontem</SelectItem>
    <SelectItem value="7d">Últimos 7 dias</SelectItem>
    <SelectItem value="this_month">Esse mês</SelectItem>
    <SelectItem value="last_month">Mês passado</SelectItem>
    <SelectItem value="custom">Personalizado</SelectItem>
  </Select>
);

export default function DashboardSummary({ salesData, showValues = true, children, approvedRevenue, approvedRevenueAllTime, period, onPeriodChange }: DashboardSummaryProps & { approvedRevenueAllTime?: number }) {
  // Estado para o intervalo de datas
  // const [dateRange, setDateRange] = useState([new Date(new Date().setDate(new Date().getDate() - 16)), new Date()]);
  // const [startDate, endDate] = dateRange;

  if (!salesData) {
    return (
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: '1.5rem',
        }}>
          {/* <DateRangeSelector startDate={startDate} endDate={endDate} onChange={(dates) => {
            if (Array.isArray(dates) && dates[0] && dates[1]) setDateRange(dates as [Date, Date]);
          }} /> */}
          {children}
          <PeriodDropdown value={period} onChange={onPeriodChange} />
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          width: '100%',
          justifyContent: 'flex-start',
          marginBottom: '2rem',
          alignItems: 'stretch',
        }}>
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  const summaryItems = [
    {
      icon: <FaTasks size={26} />,
      label: 'Total de Vendas Aprovadas',
      value: showValues && approvedRevenue !== undefined ? `R$ ${approvedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••',
      isApproved: true,
    },
    {
      icon: <FaWallet size={26} />, 
      label: 'Faturamento', 
      value: showValues ? `R$ ${salesData.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••',
    },
    {
      icon: <FaShoppingCart size={26} />, 
      label: 'Checkouts Iniciados (IC)', 
      value: showValues ? salesData.totalSales : '••••',
    },
    {
      icon: <FaReceipt size={26} />,
      label: 'Total de Vendas Pendentes',
      value: showValues ? salesData.pendingSales : '••••',
    }
  ];

  return (
    <div>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: '1.5rem',
        width: '100%',
      }}>
        {children}
        <PeriodDropdown value={period} onChange={onPeriodChange} />
        {approvedRevenueAllTime !== undefined && (
          <div style={{ width: '7cm', marginLeft: '17cm' }}>
            <FaturamentoProgressBar valor={approvedRevenueAllTime} meta={1000} />
          </div>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: window.innerWidth <= 600 ? 'wrap' : 'nowrap',
          gap: '1.5rem',
          width: '100%',
          justifyContent: 'flex-start',
          marginBottom: '2rem',
          alignItems: 'stretch',
        }}
      >
        {summaryItems.map((item, idx) => (
          <SummaryCard
            key={idx}
            icon={item.icon}
            label={item.label}
            value={item.isApproved ? <span style={{ color: '#22c55e' }}>{item.value}</span> : item.value}
          />
        ))}
      </div>
    </div>
  );
}

// Barra de progresso de faturamento
function FaturamentoProgressBar({ valor, meta }: { valor: number; meta: number }) {
  const progresso = Math.max(0, Math.min(1, valor / meta));
  return (
    <div style={{ marginTop: '1rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ color: '#a78bfa', fontSize: 13, fontWeight: 500 }}>Faturamento</span>
        <span style={{ color: '#d1d5db', fontSize: 13 }}>{`R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / R$ ${meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</span>
      </div>
      <div style={{
        width: '100%',
        height: 12,
        background: '#18181b',
        borderRadius: 8,
        border: '1.5px solid #1A0938',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          width: `${progresso * 100}%`,
          height: '100%',
          background: '#7E2AFF',
          borderRadius: 8,
          transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </div>
  );
} 