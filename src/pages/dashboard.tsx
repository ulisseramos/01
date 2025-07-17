import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import DashboardSummary from '../components/DashboardSummary';
import { useAuth } from '../context/AuthContext';
import { FaEye } from 'react-icons/fa';
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import EditarCheckoutModal from '../components/EditarCheckoutModal';

function FaturamentoProgressBar({ valor, meta }) {
  const progresso = Math.max(0, Math.min(1, valor / meta));
  return (
    <div style={{ width: '5cm' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ color: '#a78bfa', fontSize: 13, fontWeight: 500 }}>Faturamento</span>
        <span style={{ color: '#d1d5db', fontSize: 13 }}>{`R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / R$ ${meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</span>
      </div>
      <div style={{
        width: '100%',
        height: 8,
        background: '#18181b',
        borderRadius: 8,
        border: '1.5px solid #1A0938',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          width: `${progresso * 100}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #a78bfa 0%, #7c3aed 100%)',
          borderRadius: 8,
          transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </div>
  );
}

// Componente customizado para tick vertical
const VerticalTick = (props) => {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={10} textAnchor="end" fill="#E5E5E5" fontSize={13} transform="rotate(-45)">
        {payload.value}
      </text>
    </g>
  );
};

// Tick customizado para o YAxis
const YAxisTickCustomizado = (props) => {
  const { x, y, payload } = props;
  return (
    <text
      x={x - 40} // 4cm para a esquerda (aprox. 40px)
      y={y}
      textAnchor="end"
      alignmentBaseline="middle"
      fontSize={11}
      fill="#fff"
      fontWeight={500}
      fontFamily="Inter, Segoe UI, Arial, sans-serif"
    >
      {`R$ ${Number(payload.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
    </text>
  );
};

// Tooltip customizado para o gráfico
const CustomTooltip = ({ active, payload, label }: { active?: any, payload?: any, label?: any }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const aprovadas = data.aprovado || 0;
  const pendentes = data.pendente || 0;
  const faturamento = data.faturamento || 0;
  const valorPendentes = data.valorPendentes || 0;
  return (
    <div style={{
      background: 'linear-gradient(135deg, #18181b 60%, #2a2040 100%)',
      border: '1.5px solid #a78bfa',
      boxShadow: '0 8px 32px 0 #000a, 0 0 8px 2px #a78bfa44',
      borderRadius: 12,
      padding: '10px 14px',
      color: '#fff',
      fontSize: 13,
      minWidth: 120,
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
      fontWeight: 500,
      letterSpacing: 0.1,
      lineHeight: 1.5,
      position: 'relative',
    }}>
      <div style={{ fontWeight: 700, color: '#a78bfa', marginBottom: 6, fontSize: 13, letterSpacing: 0.2 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
        <span style={{
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#22c55e',
          marginRight: 7,
        }} />
        <span style={{ color: '#fff', fontWeight: 600 }}>Aprovadas:</span>
        <span style={{ marginLeft: 6, color: '#b7ffcf', fontWeight: 700 }}>{aprovadas}</span>
      </div>
      <div style={{ marginLeft: 15, color: '#b7ffcf', fontWeight: 400, fontSize: 12, marginBottom: 4 }}>
        Valor: R$ {faturamento ? Number(faturamento).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
        <span style={{
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#00CFFF',
          marginRight: 7,
        }} />
        <span style={{ color: '#fff', fontWeight: 600 }}>Pendentes:</span>
        <span style={{ marginLeft: 6, color: '#b6eaff', fontWeight: 700 }}>{pendentes}</span>
      </div>
      <div style={{ marginLeft: 15, color: '#b6eaff', fontWeight: 400, fontSize: 12 }}>
        Valor: R$ {valorPendentes ? Number(valorPendentes).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user, loading: userLoading } = useAuth();
  const [salesData, setSalesData] = useState(null);
  const [error, setError] = useState(null);
  const [salesByPeriod, setSalesByPeriod] = useState([]);
  const [salesByHour, setSalesByHour] = useState([]);
  const [period, setPeriod] = useState('max');
  const [showValues, setShowValues] = useState(true);
  const [approvedRevenue, setApprovedRevenue] = useState(0);
  const [filterLine, setFilterLine] = useState('all');
  const [approvedRevenueAllTime, setApprovedRevenueAllTime] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isLightTheme, setIsLightTheme] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [checkoutId, setCheckoutId] = useState(null);

  const handleEdit = (id) => {
    setCheckoutId(id);
    setModalOpen(true);
  };

  useEffect(() => {
    setIsLightTheme(document.documentElement.classList.contains('light'));
    const observer = new MutationObserver(() => {
      setIsLightTheme(document.documentElement.classList.contains('light'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!userLoading && !user) return;
    if (user) {
      const fetchSalesData = async () => {
        try {
          const { data, error } = await supabase
            .from('checkout_logs')
            .select('status, created_at, price')
            .eq('user_id', user.id);
          if (error) throw error;
          let approvedRevenue = 0;
          let filteredData = data || [];
          const now = new Date();
          let startDate = new Date();
          let endDate = new Date();
          let isHourView = false;
          if (period === 'today') {
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now);
            filteredData = data.filter(sale => {
              const saleDate = new Date(sale.created_at);
              return saleDate >= startDate && saleDate <= endDate;
            });
            isHourView = true;
          } else if (period === 'yesterday') {
            startDate.setDate(now.getDate() - 1);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setHours(23, 59, 59, 999);
            filteredData = data.filter(sale => {
              const saleDate = new Date(sale.created_at);
              return saleDate >= startDate && saleDate <= endDate;
            });
            isHourView = true;
          } else if (period === '7d' || period === '14d' || period === '30d') {
            if (period === '7d') startDate.setDate(now.getDate() - 6);
            else if (period === '14d') startDate.setDate(now.getDate() - 13);
            else if (period === '30d') startDate.setDate(now.getDate() - 29);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now);
            filteredData = data.filter(sale => {
              const saleDate = new Date(sale.created_at);
              return saleDate >= startDate && saleDate <= endDate;
            });
          } else if (period === 'this_month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            filteredData = data.filter(sale => {
              const saleDate = new Date(sale.created_at);
              return saleDate >= startDate && saleDate <= endDate;
            });
          } else if (period === 'last_month') {
            const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
            const month = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
            startDate = new Date(year, month, 1);
            endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
            filteredData = data.filter(sale => {
              const saleDate = new Date(sale.created_at);
              return saleDate >= startDate && saleDate <= endDate;
            });
          } else if (period === 'max' || period === 'custom') {
            // Mostra tudo, agrupado por dia
            if (filteredData.length > 0) {
              const allDates = filteredData.map(sale => new Date(sale.created_at));
              startDate = new Date(Math.min(...allDates.map(d => d.getTime())));
              endDate = new Date(Math.max(...allDates.map(d => d.getTime())));
              startDate.setHours(0, 0, 0, 0);
              endDate.setHours(23, 59, 59, 999);
            }
          }

          // Calcula métricas filtradas
          const totalRevenue = filteredData.reduce((acc, sale) => acc + (Number(sale.price) || 0), 0);
          const approvedSales = filteredData.filter(sale => sale.status === 'aprovado').length;
          const pendingSales = filteredData.filter(sale => sale.status === 'pendente').length;
          const totalSales = filteredData.length;
          approvedRevenue = filteredData.filter(sale => sale.status === 'aprovado')
            .reduce((acc, sale) => acc + (Number(sale.price) || 0), 0);

          setSalesData({
            totalRevenue,
            approvedSales,
            pendingSales,
            totalSales,
          });
          setApprovedRevenue(approvedRevenue);

          // Gráfico: agrupamento por hora ou por dia
          if (isHourView) {
            const hourlyStats = {};
            for (let h = 0; h < 24; h++) { hourlyStats[h] = { aprovado: 0, pendente: 0, faturamento: 0, valorPendentes: 0 }; }
            filteredData.forEach((sale) => {
              const saleDate = new Date(sale.created_at);
              const hour = saleDate.getHours();
              if (sale.status === 'aprovado') {
                hourlyStats[hour].aprovado++;
                hourlyStats[hour].faturamento += Number(sale.price) || 0;
              }
              if (sale.status === 'pendente') {
                hourlyStats[hour].pendente++;
                hourlyStats[hour].valorPendentes += Number(sale.price) || 0;
              }
            });
            const hourlyResult = Array.from({ length: 24 }, (_, h) => ({
              hour: h,
              ...hourlyStats[h],
            }));
            setSalesByHour(hourlyResult);
            setSalesByPeriod([]);
          } else {
            // Agrupamento por dia
            const dailyStats = {};
            filteredData.forEach((sale) => {
              const saleDate = new Date(sale.created_at);
              const dateStr = saleDate.toLocaleDateString('pt-BR');
              if (!dailyStats[dateStr]) dailyStats[dateStr] = { aprovado: 0, pendente: 0, faturamento: 0, valorPendentes: 0 };
              if (sale.status === 'aprovado') {
                dailyStats[dateStr].aprovado++;
                dailyStats[dateStr].faturamento += Number(sale.price) || 0;
              }
              if (sale.status === 'pendente') {
                dailyStats[dateStr].pendente++;
                dailyStats[dateStr].valorPendentes += Number(sale.price) || 0;
              }
            });
            // Preencher todos os dias do intervalo, mesmo sem vendas
            const days = [];
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
              days.push(new Date(d));
            }
            const dailyResult = days.map((d) => {
              const dateStr = d.toLocaleDateString('pt-BR');
              return {
                date: dateStr,
                aprovado: dailyStats[dateStr]?.aprovado || 0,
                pendente: dailyStats[dateStr]?.pendente || 0,
                faturamento: dailyStats[dateStr]?.faturamento || 0,
                valorPendentes: dailyStats[dateStr]?.valorPendentes || 0,
              };
            });
            setSalesByPeriod(dailyResult);
            setSalesByHour([]);
          }
        } catch (e) {
          setSalesData({ totalRevenue: 0, approvedSales: 0, pendingSales: 0, totalSales: 0 });
          setApprovedRevenue(0);
          setSalesByPeriod([]);
          setSalesByHour([]);
        }
      };
      fetchSalesData();
    }
  }, [user, userLoading, user?.id, period]);

  // Buscar o valor total de vendas aprovadas (todas as datas)
  useEffect(() => {
    if (!userLoading && user) {
      const fetchAllTimeApproved = async () => {
        const { data, error } = await supabase
          .from('checkout_logs')
          .select('price, status')
          .eq('user_id', user.id);
        if (!error && data) {
          const total = data.filter(sale => sale.status === 'aprovado')
            .reduce((acc, sale) => acc + (Number(sale.price) || 0), 0);
          setApprovedRevenueAllTime(total);
        }
      };
      fetchAllTimeApproved();
    }
  }, [user, userLoading]);

  useEffect(() => {
    if (typeof window !== 'undefined' && mainRef.current) {
      const html = document.documentElement;
      if (html.classList.contains('light')) {
        mainRef.current.style.background = '#fff';
      } else {
        mainRef.current.style.background = '#020204';
      }
    }
    const observer = new MutationObserver(() => {
      if (mainRef.current) {
        const html = document.documentElement;
        if (html.classList.contains('light')) {
          mainRef.current.style.background = '#fff';
        } else {
          mainRef.current.style.background = '#020204';
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && chartContainerRef.current) {
      const html = document.documentElement;
      if (html.classList.contains('light')) {
        chartContainerRef.current.style.background = '#fff';
        chartContainerRef.current.style.border = '1.5px solid #E4CFF6';
        chartContainerRef.current.style.boxShadow = 'none';
      } else {
        chartContainerRef.current.style.background = '#020204';
        chartContainerRef.current.style.border = '1px solid #1A0938';
        chartContainerRef.current.style.boxShadow = '0 12px 40px 0 #000b, 0 2px 8px 0 #0006, 0 0px 0px 1.5px #23243a';
      }
    }
    const observer = new MutationObserver(() => {
      if (chartContainerRef.current) {
        const html = document.documentElement;
        if (html.classList.contains('light')) {
          chartContainerRef.current.style.background = '#fff';
          chartContainerRef.current.style.border = '1.5px solid #E4CFF6';
          chartContainerRef.current.style.boxShadow = 'none';
        } else {
          chartContainerRef.current.style.background = '#020204';
          chartContainerRef.current.style.border = '1px solid #1A0938';
          chartContainerRef.current.style.boxShadow = '0 12px 40px 0 #000b, 0 2px 8px 0 #0006, 0 0px 0px 1.5px #23243a';
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (userLoading || !user) return <div>Carregando...</div>;
  if (error) return <p style={{ color: '#EF4444' }}>{error}</p>;
  const isHourView = period === 'today' || period === 'yesterday';

  const chartData = {
    labels: isHourView
      ? salesByHour.map(d => `${String(d.hour).padStart(2, '0')}:00`)
      : salesByPeriod.map(d => {
        const dateParts = d.date.split('/');
        return `${dateParts[0]} de ${new Date(dateParts[2], dateParts[1] - 1, dateParts[0]).toLocaleString('pt-BR', { month: 'short' })}`;
      }),
    datasets: [
      {
        label: 'Vendas Aprovadas',
        data: isHourView ? salesByHour.map(d => d.aprovado) : salesByPeriod.map(d => d.aprovado),
        borderColor: '#7910CE',
        backgroundColor: 'rgba(121, 16, 206, 0.15)',
        borderWidth: 4,
        tension: 0.5,
        fill: true,
        pointRadius: 6,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#7910CE',
        pointBorderWidth: 3,
        pointHoverRadius: 9,
      },
      {
        label: 'Vendas Pendentes',
        data: isHourView ? salesByHour.map(d => d.pendente) : salesByPeriod.map(d => d.pendente),
        borderColor: '#00CFFF',
        backgroundColor: 'rgba(0, 207, 255, 0.12)',
        borderWidth: 4,
        tension: 0.5,
        fill: true,
        pointRadius: 6,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#00CFFF',
        pointBorderWidth: 3,
        pointHoverRadius: 9,
      },
    ],
  };

  return (
    <div ref={mainRef} className="dashboard-main" style={{
      width: '100%',
      boxSizing: 'border-box',
      overflowX: 'auto',
      paddingTop: '2rem',
      minHeight: 'calc(100vh + 5cm)',
      background: '#020204',
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '0 2rem',
      }}>
        {/* Remove qualquer sombra do gráfico e seus filhos */}
        <style>{`
          [data-graph-container],
          [data-graph-container] * {
            box-shadow: none !important;
          }
        `}</style>
        <DashboardSummary 
          salesData={salesData} 
          showValues={showValues} 
          approvedRevenue={approvedRevenue} // valor filtrado para o card
          approvedRevenueAllTime={approvedRevenueAllTime} // valor total para a barra
          period={period}
          onPeriodChange={setPeriod}
        >
          <button
            onClick={() => setShowValues(v => !v)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#000000',
              border: '1.5px solid #1A0938',
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
              borderRadius: 6,
              padding: '0.7rem 1.6rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
              transition: 'all 0.18s',
              width: 220,
            }}
          >
            <FaEye style={{ color: '#a78bfa', fontSize: 18 }} />
            {showValues ? 'Ocultar valores' : 'Mostrar valores'}
          </button>
        </DashboardSummary>
        <div
          ref={chartContainerRef}
          data-graph-container
          style={{
            marginTop: '2rem',
            background: '#020204',
            border: '1px solid #0E0825',
            borderRadius: '0.75rem',
            boxShadow: 'none',
            filter: 'none',
            outline: 'none',
            padding: '1.5rem',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div style={{
            fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
            color: '#fff',
            fontSize: '1.4rem',
            fontWeight: 700,
            letterSpacing: '0.01em',
            textAlign: 'left',
            paddingLeft: '0.5rem',
            marginTop: '-0.5rem',
            marginBottom: '0.5rem',
          }}>
            Visão Geral
          </div>
          <div style={{
            width: '100%',
            height: 2,
            background: '#0E0825',
            opacity: 1,
            borderRadius: 2,
            marginBottom: '1.2rem',
          }} />
          <div style={{ width: '100%', height: 360 }}>
            <ResponsiveContainer width="100%" height={360} style={{ background: isLightTheme ? '#fff' : '#020204', borderRadius: '0.75rem', transition: 'background 0.2s' }}>
              <AreaChart
                data={isHourView ? salesByHour : salesByPeriod}
                margin={{ left: 64, right: 48, bottom: 48 }}
              >
                <CartesianGrid vertical={false} stroke="#222" strokeWidth={0.3} />
                <XAxis
                  dataKey={isHourView ? 'hour' : 'date'}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={16}
                  tickFormatter={value => isHourView ? `${String(value).padStart(2, '0')}:00` : (typeof value === 'string' ? value.slice(0, 5) : value)}
                  interval={0}
                  minTickGap={16}
                  tick={isHourView ? { fontSize: 13, fill: '#E5E5E5', textAnchor: 'end' } : <VerticalTick />}
                />
                <YAxis
                  tick={YAxisTickCustomizado}
                  axisLine={false}
                  tickLine={false}
                  width={54}
                />
                <Tooltip content={CustomTooltip} cursor={{ fill: '#a78bfa22' }} />
                <defs>
                  <linearGradient id="fillAprovado" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7910CE" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#7910CE" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillPendente" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00CFFF" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#00CFFF" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="faturamento"
                  type="natural"
                  fill="url(#fillAprovado)"
                  fillOpacity={0.4}
                  stroke="#7910CE"
                  stackId="a"
                  strokeLinecap="round"
                />
                <Area
                  dataKey="valorPendentes"
                  type="natural"
                  fill="url(#fillPendente)"
                  fillOpacity={0.4}
                  stroke="#00CFFF"
                  stackId="a"
                  strokeLinecap="round"
                  style={{ display: filterLine === 'aprovado' ? 'none' : undefined }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        {modalOpen && (
          <EditarCheckoutModal
            id={checkoutId}
            open={modalOpen}
            onClose={() => setModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage; 