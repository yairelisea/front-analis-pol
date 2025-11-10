import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, Minus, Activity, Eye, Shield,
  PlusCircle, RefreshCw, AlertCircle, CheckCircle2,
  MessageSquare, Users, Target, FileText, Download,
  ArrowUpRight, Clock, Star, Zap, BarChart3
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { API_BASE } from '../config';

const HeroKPI = ({ title, value, change, icon: Icon, trend, color = 'emerald' }) => {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-yellow-600';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  
  const colorClasses = {
    emerald: 'from-emerald-500 to-emerald-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };
  
  return (
    <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-all border-0">
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-5`} />
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-4 rounded-2xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 ${trendColor}`}>
              <TrendIcon className="h-4 w-4" />
              <span className="text-sm font-bold">{change > 0 ? '+' : ''}{change}%</span>
            </div>
          )}
        </div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <p className="text-4xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
};

const ReportMetric = ({ label, value, status, trend }) => {
  const trendColors = {
    positive: 'bg-green-50 text-green-700 border-green-200',
    neutral: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    negative: 'bg-red-50 text-red-700 border-red-200',
  };
  
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-white hover:shadow-md transition-shadow">
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
      <Badge className={`${trendColors[trend]} border`}>
        {status}
      </Badge>
    </div>
  );
};

const CampaignCard = ({ campaign, onClick }) => {
  const sentimentColor = campaign.sentiment > 0.5 ? 'text-green-600' : 
                         campaign.sentiment > 0 ? 'text-yellow-600' : 'text-red-600';
  const sentimentBg = campaign.sentiment > 0.5 ? 'bg-green-50' : 
                      campaign.sentiment > 0 ? 'bg-yellow-50' : 'bg-red-50';
  const TrendIcon = campaign.trend === 'up' ? TrendingUp : campaign.trend === 'down' ? TrendingDown : Minus;
  
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-brand-green" onClick={onClick}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h4 className="font-semibold text-base mb-2">{campaign.name}</h4>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Activa
              </Badge>
              <Badge variant="outline" className="text-xs">
                {campaign.mentions.toLocaleString()} menciones
              </Badge>
            </div>
          </div>
          <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className={`p-3 rounded-lg ${sentimentBg}`}>
            <p className="text-xs text-muted-foreground mb-1">Sentimiento</p>
            <p className={`text-xl font-bold ${sentimentColor}`}>
              {(campaign.sentiment * 100).toFixed(0)}%
            </p>
          </div>
          <div className="p-3 rounded-lg bg-blue-50">
            <p className="text-xs text-muted-foreground mb-1">Menciones</p>
            <p className="text-xl font-bold text-blue-600">
              {campaign.mentions.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-purple-50">
            <p className="text-xs text-muted-foreground mb-1">Tendencia</p>
            <div className="flex items-center gap-1">
              <TrendIcon className={`h-4 w-4 ${campaign.growth > 0 ? 'text-green-600' : campaign.growth < 0 ? 'text-red-600' : 'text-yellow-600'}`} />
              <p className="text-lg font-bold text-purple-600">{campaign.growth > 0 ? '+' : ''}{campaign.growth}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ActorCard = ({ actor }) => {
  const sentimentColors = {
    positive: 'bg-green-50 text-green-700 border-green-200',
    neutral: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    negative: 'bg-red-50 text-red-700 border-red-200',
  };
  
  const impactoIcons = {
    alto: '🔥',
    medio: '⚡',
    bajo: '💫',
  };
  
  return (
    <div className="p-4 rounded-lg border bg-white hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm">{actor.actor}</h4>
            <span className="text-lg">{impactoIcons[actor.impacto]}</span>
          </div>
          <p className="text-xs text-muted-foreground">{actor.rol}</p>
        </div>
        <Badge className={`${sentimentColors[actor.sentiment]} border text-xs`}>
          {actor.sentiment === 'positive' ? 'Positivo' : actor.sentiment === 'negative' ? 'Negativo' : 'Neutral'}
        </Badge>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          <span>{actor.menciones} menciones</span>
        </div>
        <div className="flex items-center gap-1">
          <BarChart3 className="h-3 w-3" />
          <span>Impacto {actor.impacto}</span>
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ activity }) => {
  const icons = {
    alert: <AlertCircle className="h-5 w-5 text-red-500" />,
    success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    info: <Star className="h-5 w-5 text-blue-500" />,
  };
  const bgColors = {
    high: 'bg-red-50 border-red-200',
    normal: 'bg-green-50 border-green-200',
    low: 'bg-blue-50 border-blue-200',
  };
  
  return (
    <div className={`p-4 rounded-lg border ${bgColors[activity.priority]} hover:shadow-md transition-shadow`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icons[activity.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground mb-1">{activity.message}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              hace {activity.time}
            </div>
            <Separator orientation="vertical" className="h-3" />
            <span>{activity.source}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const WeeklyReport = ({
  politicianName: actorName,
  politicianOffice: actorOffice,
  urls,
  reportData,
  onNewAnalysis
}) => {
  console.log('🎬 WeeklyReport component rendered');
  console.log('📦 Props received:', { actorName, actorOffice, urls, hasReportData: !!reportData });
  console.log('📊 ReportData structure:', reportData);

  const [dashboardData, setDashboardData] = useState(reportData || null);
  const [loading, setLoading] = useState(!reportData);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('🔍 WeeklyReport useEffect triggered');
    console.log('📦 Current state:', {
      hasReportData: !!reportData,
      actorName,
      urlsLength: urls?.length,
      dashboardData
    });

    // Si ya tenemos reportData de las props, no hacer fetch
    if (reportData) {
      console.log('✅ Using reportData from props');
      setDashboardData(reportData);
      setLoading(false);
      return;
    }

    // Si no tenemos nombre de actor, no podemos hacer fetch
    if (!actorName) {
      console.log('❌ No actorName provided');
      setLoading(false);
      setError("No se ha proporcionado un nombre de actor.");
      return;
    }

    // Si no tenemos URLs, no podemos llamar a /smart-report
    if (!urls || urls.length === 0) {
      console.log('❌ No URLs provided');
      setLoading(false);
      setError("No se han proporcionado URLs para el análisis. Por favor, genera un nuevo análisis.");
      return;
    }

    const fetchReport = async () => {
      console.log('📡 Fetching smart-report');
      setLoading(true);
      try {
        const payload = {
          politician: {
            name: actorName,
            office: actorOffice || undefined
          },
          urls: urls
        };
        console.log('📤 Payload:', payload);

        const response = await fetch(`${API_BASE}/smart-report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        console.log('📥 Response status:', response.status, response.statusText);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `Error en la petición: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Data received from /smart-report:', data);
        setDashboardData(data);
      } catch (err) {
        console.error('❌ Error in fetchReport:', err);
        setError(err.message);
      } finally {
        console.log('🏁 Fetch completed');
        setLoading(false);
      }
    };

    fetchReport();
  }, [actorName, actorOffice, urls, reportData]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleNavigate = (path) => {
    console.log('Navegando a:', path);
  };

  if (loading) {
    console.log('⏳ Showing loading state');
    return (
      <div className="max-w-[1800px] mx-auto space-y-8">
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 w-full" />)}
        </div>
      </div>
    );
  }

  if (error) {
    console.log('❌ Showing error state:', error);
    return <div>Error: {error}</div>;
  }

  if (!dashboardData) {
    console.log('⚠️ No dashboardData available');
    return <div>No hay datos disponibles.</div>;
  }

  console.log('🎨 Rendering dashboard with data:', dashboardData);
  console.log('📋 Dashboard data keys:', Object.keys(dashboardData));

  return (
    <div className="max-w-[1800px] mx-auto space-y-8">
      
      {/* Header Executive */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
          
          <CardContent className="p-8 relative">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <Activity className="h-10 w-10" />
                  <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-sm px-3 py-1">
                    Análisis de Percepción Digital
                  </Badge>
                  <Badge variant="outline" className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-sm px-3 py-1">
                    <Zap className="h-3 w-3 mr-1" />
                    Actualizado en vivo
                  </Badge>
                </div>
                <h1 className="text-5xl font-bold mb-3">{dashboardData.actor}</h1>
                <p className="text-slate-300 text-lg">{dashboardData.periodo}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={onNewAnalysis}>
                  Nuevo Análisis
                </Button>
                <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={handleRefresh} disabled={refreshing}>
                  <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
                <Button size="lg" className="bg-brand-green hover:bg-emerald-600 text-white shadow-lg" onClick={() => handleNavigate('/user/campaigns/new')}>
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Nueva Campaña
                </Button>
              </div>
            </div>
            
            {/* Diagnóstico Estratégico */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30">
                  <Shield className="h-6 w-6 text-emerald-300" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-3 text-white">Diagnóstico Estratégico</h3>
                  <p className="text-base text-slate-200 leading-relaxed">{dashboardData.diagnostico}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* KPIs Hero - 4 columnas */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-4 gap-6">
          <HeroKPI
            title="Total Menciones"
            value={dashboardData.totalMenciones.toLocaleString()}
            change={dashboardData.mencionesChange}
            trend="up"
            icon={MessageSquare}
            color="emerald"
          />
          <HeroKPI
            title="Sentimiento Promedio"
            value={`${dashboardData.sentimientoPromedio}%`}
            change={dashboardData.sentimientoChange}
            trend="up"
            icon={TrendingUp}
            color="blue"
          />
          <HeroKPI
            title="Campañas Activas"
            value={dashboardData.campanasActivas}
            icon={Target}
            color="purple"
          />
          <HeroKPI
            title="Alcance Estimado"
            value={`${(dashboardData.alcanceEstimado / 1000).toFixed(0)}K`}
            change={dashboardData.alcanceChange}
            trend="up"
            icon={Users}
            color="orange"
          />
        </div>
      </motion.div>

      {/* Métricas del Reporte + Distribuciones */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="grid grid-cols-12 gap-6">
          
          {/* Métricas del Reporte Ejecutivo - 4 cols */}
          <Card className="col-span-4 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-green" />
                Métricas del Reporte
              </CardTitle>
              <CardDescription>Indicadores clave de percepción</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ReportMetric
                label="Visibilidad Pública"
                value={dashboardData.visibilidadPublica.value}
                status={dashboardData.visibilidadPublica.status}
                trend={dashboardData.visibilidadPublica.trend}
              />
              <ReportMetric
                label="Interacciones Digitales"
                value={dashboardData.interaccionesDigitales.value}
                status={dashboardData.interaccionesDigitales.status}
                trend={dashboardData.interaccionesDigitales.trend}
              />
              <ReportMetric
                label="Menciones en Medios"
                value={dashboardData.mencionesEnMedios.value}
                status={dashboardData.mencionesEnMedios.status}
                trend={dashboardData.mencionesEnMedios.trend}
              />
              <ReportMetric
                label="Riesgo Reputacional"
                value={dashboardData.riesgoReputacional.value}
                status={dashboardData.riesgoReputacional.status}
                trend={dashboardData.riesgoReputacional.trend}
              />
            </CardContent>
          </Card>

          {/* Gráfica de Tendencia Semanal - 5 cols */}
          <Card className="col-span-5 shadow-lg">
            <CardHeader>
              <CardTitle>Tendencia Semanal</CardTitle>
              <CardDescription>Volumen de menciones por día</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={dashboardData.weeklyTrend}>
                  <defs>
                    <linearGradient id="colorMentions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1ACC8D" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#1ACC8D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="day" stroke="#888" fontSize={12} tickLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      padding: '12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="mentions" 
                    stroke="#1ACC8D" 
                    strokeWidth={3}
                    fill="url(#colorMentions)" 
                    name="Menciones"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribuciones - 3 cols */}
          <Card className="col-span-3 shadow-lg">
            <CardHeader>
              <CardTitle className="text-base">Distribuciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sentimiento */}
              <div>
                <p className="text-sm font-medium mb-3">Sentimiento</p>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie 
                      data={dashboardData.sentimentDistribution} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={40} 
                      outerRadius={60} 
                      paddingAngle={5} 
                      dataKey="value"
                    >
                      {dashboardData.sentimentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-3">
                  {dashboardData.sentimentDistribution.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-semibold">{item.value}% ({item.count})</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Narrativa */}
              <div>
                <p className="text-sm font-medium mb-3">Foco de Narrativa</p>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie 
                      data={dashboardData.narrativaDistribution} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={40} 
                      outerRadius={60} 
                      paddingAngle={5} 
                      dataKey="value"
                    >
                      {dashboardData.narrativaDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Campañas Activas */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-brand-green" />
                  Campañas Activas
                </CardTitle>
                <CardDescription>Rendimiento de tus campañas de monitoreo</CardDescription>
              </div>
              <Button variant="ghost" onClick={() => handleNavigate('/user/campaigns')}>
                Ver todas
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              {dashboardData.campaigns.map((campaign) => (
                <CampaignCard 
                  key={campaign.id} 
                  campaign={campaign} 
                  onClick={() => handleNavigate(`/user/campaigns/${campaign.id}`)} 
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* FODA + Actores Clave + Actividad */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="grid grid-cols-12 gap-6">
          
          {/* FODA - 4 cols */}
          <Card className="col-span-4 shadow-lg">
            <CardHeader>
              <CardTitle>Análisis FODA</CardTitle>
              <CardDescription>Resumen estratégico</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">✓</span>
                  <h4 className="font-semibold text-sm text-green-800">Fortalezas</h4>
                </div>
                <ul className="space-y-1">
                  {dashboardData.foda.fortalezas.slice(0, 2).map((item, idx) => (
                    <li key={idx} className="text-xs text-green-700">• {item}</li>
                  ))}
                </ul>
                {dashboardData.foda.fortalezas.length > 2 && (
                  <p className="text-xs text-green-600 mt-2">+{dashboardData.foda.fortalezas.length - 2} más</p>
                )}
              </div>

              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">!</span>
                  <h4 className="font-semibold text-sm text-yellow-800">Debilidades</h4>
                </div>
                <ul className="space-y-1">
                  {dashboardData.foda.debilidades.map((item, idx) => (
                    <li key={idx} className="text-xs text-yellow-700">• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">►</span>
                  <h4 className="font-semibold text-sm text-blue-800">Oportunidades</h4>
                </div>
                <ul className="space-y-1">
                  {dashboardData.foda.oportunidades.map((item, idx) => (
                    <li key={idx} className="text-xs text-blue-700">• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">⚠</span>
                  <h4 className="font-semibold text-sm text-red-800">Amenazas</h4>
                </div>
                <ul className="space-y-1">
                  {dashboardData.foda.amenazas.slice(0, 2).map((item, idx) => (
                    <li key={idx} className="text-xs text-red-700">• {item}</li>
                  ))}
                </ul>
                {dashboardData.foda.amenazas.length > 2 && (
                  <p className="text-xs text-red-600 mt-2">+{dashboardData.foda.amenazas.length - 2} más</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actores Clave - 4 cols */}
          <Card className="col-span-4 shadow-lg">
            <CardHeader>
              <CardTitle>Actores y Medios Clave</CardTitle>
              <CardDescription>Influencia en la narrativa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboardData.actoresClave.map((actor, idx) => (
                <ActorCard key={idx} actor={actor} />
              ))}
            </CardContent>
          </Card>

          {/* Actividad Reciente - 4 cols */}
          <Card className="col-span-4 shadow-lg">
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimas actualizaciones del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboardData.recentActivity.map((activity, idx) => (
                <ActivityItem key={idx} activity={activity} />
              ))}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Keywords y Acciones */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Palabras Clave Detectadas</CardTitle>
                <CardDescription>Términos más relevantes del período analizado</CardDescription>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Descargar Reporte PDF
                </Button>
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Ver Reporte Completo
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {dashboardData.keywords.map((kw, idx) => {
                const sentimentColors = {
                  positive: 'hover:bg-green-500 hover:border-green-600',
                  neutral: 'hover:bg-yellow-500 hover:border-yellow-600',
                  negative: 'hover:bg-red-500 hover:border-red-600',
                };
                return (
                  <motion.div
                    key={kw.word}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Badge 
                      variant="outline" 
                      className={`text-base px-4 py-2 cursor-pointer transition-all ${sentimentColors[kw.sentiment]} hover:text-white`}
                    >
                      #{kw.word}
                      <span className="ml-2 text-xs opacity-70">({kw.frequency})</span>
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

    </div>
  );
};

export default WeeklyReport;
