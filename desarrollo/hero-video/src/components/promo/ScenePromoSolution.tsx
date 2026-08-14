import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  Img,
  staticFile,
} from "remotion";
import { PROMO } from "../../promoColors";
import { interFont, monoFont } from "../../promoFonts";
import {
  Users,
  CreditCard,
  Calendar,
  Bell,
  Home,
  UserCheck,
  ClipboardList,
  MessageSquare,
  Settings,
  Search,
  Bot,
  ChevronDown,
  Layers,
  Clock,
  BarChart3,
  Package,
  DollarSign,
  Receipt,
  Wallet,
  Zap,
  Link2,
  FileText,
  AlertTriangle,
  TrendingDown,
  Eye,
  ArrowUpRight,
  Plus,
  Download,
  Mail,
  Phone,
  Filter,
  Check,
  X,
  Info,
  Image,
  CheckCircle,
  XCircle,
} from "lucide-react";

// ─── Data constants ───

const SIDEBAR_ITEMS = [
  { icon: Home, label: "Dashboard", section: null },
  { icon: Layers, label: "Categorias", section: null },
  { icon: UserCheck, label: "Entrenadores", section: null },
  { icon: Users, label: "Jugadores", section: null },
  { icon: FileText, label: "Revision Docs", section: null },
  { icon: Calendar, label: "Calendario", section: null },
  { icon: null, label: "ENTRENAMIENTOS", section: "header" },
  { icon: Clock, label: "Sesiones", section: null },
  { icon: ClipboardList, label: "Asistencia", section: null },
  { icon: BarChart3, label: "Reportes Asist.", section: null },
  { icon: Package, label: "Inventario", section: null },
  { icon: null, label: "FINANZAS", section: "header" },
  { icon: DollarSign, label: "Descuentos", section: null },
  { icon: Receipt, label: "Cobros", section: null },
  { icon: Wallet, label: "Pagos", section: null },
];

const TOP_STATS = [
  { icon: Users, label: "Jugadores", value: 109, color: PROMO.green },
  { icon: UserCheck, label: "Entrenadores", value: 4, color: PROMO.blue },
  { icon: Layers, label: "Categorias", value: 8, color: PROMO.orange },
  { icon: Clock, label: "Sesiones", value: 23, color: PROMO.purple },
];

const FINANCE_CARDS = [
  { label: "Recaudado este mes", value: "$ 9.500.000", sub: "-40.3% vs mes anterior", subColor: PROMO.red, iconColor: PROMO.green },
  { label: "Pendiente por cobrar", value: "$ 17.200.000", sub: "Deudas acumuladas", subColor: PROMO.textMuted, iconColor: PROMO.red },
  { label: "Por verificar", value: "4", sub: "Requieren revision", subColor: PROMO.textMuted, iconColor: PROMO.orange },
  { label: "Mes anterior", value: "$ 15.900.000", sub: "Total recibido", subColor: PROMO.textMuted, iconColor: PROMO.blue },
];

const PAYMENTS = [
  { name: "Samantha Suarez...", desc: "Mensualidad Tipo 2", amount: "$ 140.000", date: "04/03/2026", status: "Por verificar" },
  { name: "Sofia Castaño Alz...", desc: "Mensualidad Tipo 2", amount: "$ 140.000", date: "04/03/2026", status: "Por verificar" },
  { name: "David Vargas Rey...", desc: "Mensualidad Tipo 2", amount: "$ 140.000", date: "04/03/2026", status: "Por verificar" },
];

const DEBTORS = [
  { name: "Maria Fernanda Bran...", debt: "$ 640.000", count: "3 cobros" },
  { name: "Miguel Angel Escobar...", debt: "$ 440.000", count: "3 cobros" },
  { name: "Emiliano Pulgarin Higu...", debt: "$ 360.000", count: "3 cobros" },
];

const PLAYER_CARDS = [
  { name: "Alejandro Alvarez", category: "Sub 14 Masc.", initials: "AA", color: "#3B82F6" },
  { name: "Samantha Suarez", category: "Sub 14 Fem.", initials: "SS", color: "#EC4899" },
  { name: "David Vargas Rey", category: "Sub 15 Masc.", initials: "DV", color: "#8B5CF6" },
  { name: "Sofia Castaño Alz", category: "Mini Mixto", initials: "SC", color: "#F59E0B" },
  { name: "Miguel Escobar", category: "Sub 14 Masc.", initials: "ME", color: "#10B981" },
  { name: "Valentina Rojas", category: "Sub 14 Fem.", initials: "VR", color: "#EF4444" },
  { name: "Santiago Perez G.", category: "Sub 15 Masc.", initials: "SP", color: "#6366F1" },
  { name: "Isabella Torres M.", category: "Mini Mixto", initials: "IT", color: "#14B8A6" },
];

// ─── View-specific active sidebar index ───
const ACTIVE_BY_VIEW: Record<number, string> = {
  0: "Dashboard",
  1: "Jugadores",
  2: "Jugadores",
  3: "Pagos",
};

const URL_BY_VIEW: Record<number, string> = {
  0: "app.widdo.co/home/dashboard",
  1: "app.widdo.co/home/players",
  2: "app.widdo.co/home/players/alejandro-alvarez",
  3: "app.widdo.co/home/payments",
};

// ─── Frame ranges for 14s @ 30fps = 420 frames ───
// View 0: Dashboard     frames 0-120   (4s)
// View 1: Grid Players  frames 100-210 (fade 100-120, full 120-210)
// View 2: Detail Player frames 190-300 (fade 190-210, full 210-300)
// View 3: Modal Payment frames 280-420 (fade 280-300, full 300-420)

function getViewOpacity(frame: number, view: number): number {
  switch (view) {
    case 0:
      return interpolate(frame, [0, 5, 100, 120], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    case 1:
      return interpolate(frame, [100, 120, 190, 210], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    case 2:
      return interpolate(frame, [190, 210, 280, 300], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    case 3:
      return interpolate(frame, [280, 300, 410, 420], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    default:
      return 0;
  }
}

function getCurrentView(frame: number): number {
  if (frame < 110) return 0;
  if (frame < 200) return 1;
  if (frame < 290) return 2;
  return 3;
}

// ─── Sub-components ───

const DashboardView: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const bannerEntry = spring({ frame, fps, delay: 10, config: { damping: 200, stiffness: 80 } });

  return (
    <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Hero banner */}
      <div style={{
        background: "linear-gradient(135deg, #1F2937 0%, #111827 100%)",
        borderRadius: 12, padding: "20px 24px", position: "relative", overflow: "hidden",
        opacity: bannerEntry, transform: `translateY(${Math.round((1 - bannerEntry) * 12)}px)`,
      }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, background: "radial-gradient(circle, rgba(0,200,83,0.15) 0%, transparent 70%)", filter: "blur(20px)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <Zap size={10} color="#00C853" />
          <span style={{ fontFamily: interFont, fontSize: 10, fontWeight: 600, color: "#00C853", background: "rgba(0,200,83,0.15)", borderRadius: 4, padding: "2px 8px" }}>Panel de Control</span>
        </div>
        <div style={{ fontFamily: interFont, fontSize: 20, fontWeight: 800, color: "#FFFFFF", marginBottom: 4 }}>Corporacion Deportiva Familia Aba</div>
        <div style={{ fontFamily: interFont, fontSize: 11, color: "#9CA3AF" }}>Bienvenido de vuelta, Erika</div>
        <div style={{ position: "absolute", top: 20, right: 24, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 16px", textAlign: "center" }}>
          <div style={{ fontFamily: interFont, fontSize: 10, color: "#9CA3AF", marginBottom: 4 }}>Estado del club</div>
          <div style={{ fontFamily: interFont, fontSize: 13, fontWeight: 700, color: "#00C853" }}>Activo</div>
        </div>
      </div>

      {/* Top stat cards */}
      <div style={{ display: "flex", gap: 12 }}>
        {TOP_STATS.map((stat, i) => {
          const delay = 18 + i * 3;
          const cardEntry = spring({ frame, fps, delay, config: { damping: 200, stiffness: 100 } });
          const countValue = Math.round(interpolate(Math.max(0, frame - (delay + 8)), [0, 30], [0, stat.value], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) }));
          const Icon = stat.icon;
          return (
            <div key={i} style={{ flex: 1, background: "#FFFFFF", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, border: "1px solid #E5E7EB", opacity: cardEntry, transform: `translateY(${Math.round((1 - cardEntry) * 10)}px)` }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${stat.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={16} color={stat.color} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontFamily: interFont, fontSize: 10, color: "#9CA3AF" }}>{stat.label}</div>
                <div style={{ fontFamily: interFont, fontSize: 20, fontWeight: 800, color: "#1F2937" }}>{countValue}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial cards */}
      <div style={{ display: "flex", gap: 12 }}>
        {FINANCE_CARDS.map((card, i) => {
          const delay = 28 + i * 3;
          const cardEntry = spring({ frame, fps, delay, config: { damping: 200, stiffness: 100 } });
          return (
            <div key={i} style={{ flex: 1, background: "#FFFFFF", borderRadius: 10, padding: "14px 16px", border: "1px solid #E5E7EB", opacity: cardEntry, transform: `translateY(${Math.round((1 - cardEntry) * 10)}px)` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontFamily: interFont, fontSize: 10, color: "#9CA3AF" }}>{card.label}</span>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${card.iconColor}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DollarSign size={14} color={card.iconColor} />
                </div>
              </div>
              <div style={{ fontFamily: interFont, fontSize: 18, fontWeight: 800, color: "#1F2937", marginBottom: 4 }}>{card.value}</div>
              <div style={{ fontFamily: interFont, fontSize: 9, color: card.subColor }}>{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Payments + Debtors */}
      <div style={{ display: "flex", gap: 12 }}>
        {/* Ultimos Pagos */}
        <div style={{ flex: 1, background: "#FFFFFF", borderRadius: 10, padding: "14px 16px", border: "1px solid #E5E7EB" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ArrowUpRight size={14} color="#00C853" />
              <div>
                <div style={{ fontFamily: interFont, fontSize: 13, fontWeight: 700, color: "#1F2937" }}>Ultimos Pagos</div>
                <div style={{ fontFamily: interFont, fontSize: 9, color: "#9CA3AF" }}>8 aprobados · 4 por verificar</div>
              </div>
            </div>
            <span style={{ fontFamily: interFont, fontSize: 10, fontWeight: 600, color: "#00C853" }}>Ver todos</span>
          </div>
          {PAYMENTS.map((p, j) => (
            <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: "1px solid #F3F4F6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Receipt size={12} color="#EF4444" />
                </div>
                <div>
                  <div style={{ fontFamily: interFont, fontSize: 11, fontWeight: 600, color: "#1F2937" }}>{p.name}</div>
                  <div style={{ fontFamily: interFont, fontSize: 9, color: "#9CA3AF" }}>{p.desc}</div>
                  <div style={{ fontFamily: interFont, fontSize: 8, fontWeight: 600, color: "#F59E0B" }}>{p.status}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: monoFont, fontSize: 12, fontWeight: 700, color: "#1F2937" }}>{p.amount}</div>
                <div style={{ fontFamily: interFont, fontSize: 8, color: "#9CA3AF" }}>{p.date}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Deudores */}
        <div style={{ flex: 1, background: "#FFFFFF", borderRadius: 10, padding: "14px 16px", border: "1px solid #E5E7EB" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={14} color="#F59E0B" />
              <div>
                <div style={{ fontFamily: interFont, fontSize: 13, fontWeight: 700, color: "#1F2937" }}>Jugadores con Deudas</div>
                <div style={{ fontFamily: interFont, fontSize: 9, color: "#9CA3AF" }}>10 con pagos pendientes</div>
              </div>
            </div>
            <span style={{ fontFamily: interFont, fontSize: 10, fontWeight: 600, color: "#00C853" }}>Gestionar</span>
          </div>
          {DEBTORS.map((d, j) => (
            <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: "1px solid #F3F4F6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: interFont, fontSize: 10, fontWeight: 700, color: "#D97706" }}>
                  {3 - j + 1}
                </div>
                <div>
                  <div style={{ fontFamily: interFont, fontSize: 11, fontWeight: 600, color: "#1F2937" }}>{d.name}</div>
                  <div style={{ fontFamily: interFont, fontSize: 9, color: "#9CA3AF" }}>Deuda reciente</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: monoFont, fontSize: 12, fontWeight: 700, color: "#EF4444" }}>{d.debt}</div>
                <div style={{ fontFamily: interFont, fontSize: 8, color: "#9CA3AF" }}>{d.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PlayersGridView: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Local frame starting from when this view fades in (frame ~120)
  const localFrame = Math.max(0, frame - 110);

  return (
    <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontFamily: interFont, fontSize: 11, color: "#9CA3AF" }}>Dashboard</span>
        <span style={{ fontFamily: interFont, fontSize: 11, color: "#9CA3AF" }}>/</span>
        <span style={{ fontFamily: interFont, fontSize: 11, fontWeight: 600, color: "#1F2937" }}>Jugadores</span>
      </div>

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: interFont, fontSize: 22, fontWeight: 800, color: "#1F2937" }}>
          Gestion de Jugadores
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#00C853", borderRadius: 8, padding: "8px 14px" }}>
            <Plus size={14} color="#FFFFFF" strokeWidth={2.5} />
            <span style={{ fontFamily: interFont, fontSize: 12, fontWeight: 600, color: "#FFFFFF" }}>Crear Jugador</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 14px" }}>
            <Mail size={14} color="#6B7280" />
            <span style={{ fontFamily: interFont, fontSize: 12, fontWeight: 500, color: "#374151" }}>Invitar Padre</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 14px" }}>
            <Download size={14} color="#6B7280" />
            <span style={{ fontFamily: interFont, fontSize: 12, fontWeight: 500, color: "#374151" }}>Exportar</span>
          </div>
        </div>
      </div>

      {/* Search + filter bar */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 12px" }}>
          <Search size={14} color="#9CA3AF" />
          <span style={{ fontFamily: interFont, fontSize: 12, color: "#9CA3AF" }}>Buscar jugador...</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 12px" }}>
          <Filter size={14} color="#6B7280" />
          <span style={{ fontFamily: interFont, fontSize: 12, color: "#374151" }}>Todas</span>
          <ChevronDown size={12} color="#9CA3AF" />
        </div>
        <span style={{ fontFamily: monoFont, fontSize: 11, color: "#9CA3AF" }}>109 jugadores</span>
      </div>

      {/* Player cards grid — 4 columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
        {PLAYER_CARDS.map((player, i) => {
          const cardDelay = 6 + i * 2;
          const cardEntry = spring({ frame: localFrame, fps, delay: cardDelay, config: { damping: 200, stiffness: 120 } });
          return (
            <div
              key={i}
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                opacity: cardEntry,
                transform: `translateY(${Math.round((1 - cardEntry) * 12)}px)`,
              }}
            >
              {/* Avatar circle */}
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: `${player.color}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: interFont, fontSize: 16, fontWeight: 700, color: player.color,
              }}>
                {player.initials}
              </div>
              <div style={{ fontFamily: interFont, fontSize: 12, fontWeight: 700, color: "#1F2937", textAlign: "center" }}>{player.name}</div>
              <div style={{ fontFamily: interFont, fontSize: 9, color: "#9CA3AF" }}>{player.category}</div>
              {/* Status badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#ECFDF5", borderRadius: 6, padding: "3px 8px" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00C853" }} />
                <span style={{ fontFamily: interFont, fontSize: 9, fontWeight: 600, color: "#059669" }}>Activo</span>
              </div>
              {/* Profile completeness */}
              <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: "#E5E7EB", overflow: "hidden" }}>
                  <div style={{ width: "100%", height: "100%", borderRadius: 2, background: "#00C853" }} />
                </div>
                <span style={{ fontFamily: monoFont, fontSize: 8, color: "#9CA3AF" }}>100%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PlayerDetailView: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = Math.max(0, frame - 200);

  const TABS = [
    { label: "Personal", active: true, icon: null, check: false, info: false },
    { label: "Contacto", active: false, icon: null, check: true, info: false },
    { label: "Deportivo", active: false, icon: null, check: false, info: false },
    { label: "Medico", active: false, icon: null, check: false, info: true },
    { label: "Docs", active: false, icon: null, check: false, info: false },
  ];

  const FIELDS_ROW1 = [
    { label: "Tipo Documento", value: "Tarjeta de Identidad" },
    { label: "Numero Documento", value: "1234567890" },
    { label: "Fecha Nacimiento", value: "15/06/2012" },
  ];
  const FIELDS_ROW2 = [
    { label: "Nombres", value: "Alejandro" },
    { label: "Apellidos", value: "Alvarez Restrepo" },
    { label: "Genero", value: "Masculino" },
  ];
  const FIELDS_ROW3 = [
    { label: "Lugar de Nacimiento", value: "Medellin" },
    { label: "Categorias", value: "Sub 14 Masculino" },
    { label: "Descuentos", value: "Ninguno" },
  ];
  const FIELDS_ROW4 = [
    { label: "Ciudad", value: "Medellin" },
    { label: "Direccion", value: "Cra 45 #67-89" },
    { label: "Barrio", value: "El Poblado" },
  ];

  const formEntry = spring({ frame: localFrame, fps, delay: 4, config: { damping: 200, stiffness: 80 } });

  return (
    <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontFamily: interFont, fontSize: 11, color: "#9CA3AF" }}>Dashboard</span>
        <span style={{ fontFamily: interFont, fontSize: 11, color: "#9CA3AF" }}>/</span>
        <span style={{ fontFamily: interFont, fontSize: 11, color: "#9CA3AF" }}>Jugadores</span>
        <span style={{ fontFamily: interFont, fontSize: 11, color: "#9CA3AF" }}>/</span>
        <span style={{ fontFamily: interFont, fontSize: 11, fontWeight: 600, color: "#1F2937" }}>Alejandro Alvarez</span>
      </div>

      {/* Player header with photo */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 12, background: "#3B82F620",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "2px solid #3B82F6",
        }}>
          <span style={{ fontFamily: interFont, fontSize: 22, fontWeight: 700, color: "#3B82F6" }}>AA</span>
        </div>
        <div>
          <div style={{ fontFamily: interFont, fontSize: 20, fontWeight: 800, color: "#1F2937" }}>Alejandro Alvarez Restrepo</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#ECFDF5", borderRadius: 6, padding: "3px 8px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00C853" }} />
              <span style={{ fontFamily: interFont, fontSize: 10, fontWeight: 600, color: "#059669" }}>Activo</span>
            </div>
            <span style={{ fontFamily: interFont, fontSize: 11, color: "#9CA3AF" }}>Sub 14 Masculino</span>
            <span style={{ fontFamily: interFont, fontSize: 11, color: "#9CA3AF" }}>TI: 1234567890</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #E5E7EB" }}>
        {TABS.map((tab, i) => (
          <div key={i} style={{
            padding: "10px 20px",
            fontFamily: interFont, fontSize: 13, fontWeight: tab.active ? 700 : 500,
            color: tab.active ? "#00C853" : "#6B7280",
            borderBottom: tab.active ? "2px solid #00C853" : "2px solid transparent",
            marginBottom: -2,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            {tab.label}
            {tab.check && <Check size={12} color="#00C853" strokeWidth={3} />}
            {tab.info && <Info size={12} color="#F59E0B" />}
          </div>
        ))}
      </div>

      {/* Section title */}
      <div style={{ fontFamily: interFont, fontSize: 16, fontWeight: 700, color: "#1F2937" }}>Informacion Personal</div>

      {/* Form grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: formEntry, transform: `translateY(${Math.round((1 - formEntry) * 8)}px)` }}>
        {[FIELDS_ROW1, FIELDS_ROW2, FIELDS_ROW3, FIELDS_ROW4].map((row, ri) => (
          <div key={ri} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {row.map((field, fi) => (
              <div key={fi}>
                <div style={{ fontFamily: interFont, fontSize: 10, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>{field.label}</div>
                <div style={{
                  background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8,
                  padding: "10px 12px", fontFamily: interFont, fontSize: 12, color: "#1F2937",
                }}>
                  {field.value}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const PaymentModalView: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = Math.max(0, frame - 290);
  const overlayEntry = spring({ frame: localFrame, fps, delay: 0, config: { damping: 200, stiffness: 100 } });
  const modalEntry = spring({ frame: localFrame, fps, delay: 4, config: { damping: 200, stiffness: 80 } });
  const detailsEntry = spring({ frame: localFrame, fps, delay: 10, config: { damping: 200, stiffness: 100 } });

  return (
    <AbsoluteFill>
      {/* Dark overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: `rgba(0,0,0,${0.5 * overlayEntry})`,
        zIndex: 50,
      }} />

      {/* Modal */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: `translate(-50%, -50%) scale(${0.9 + 0.1 * modalEntry})`,
        opacity: modalEntry,
        width: 560,
        background: "#FFFFFF",
        borderRadius: 16,
        boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
        zIndex: 51,
        overflow: "hidden",
      }}>
        {/* Modal header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: interFont, fontSize: 18, fontWeight: 800, color: "#1F2937" }}>Verificar Pago</div>
            <div style={{ fontFamily: interFont, fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>Revisa los datos y comprobante del pago</div>
          </div>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={14} color="#6B7280" />
          </div>
        </div>

        {/* Modal body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14, opacity: detailsEntry }}>
          {/* Player info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontFamily: interFont, fontSize: 10, color: "#9CA3AF", marginBottom: 2 }}>Jugador</div>
              <div style={{ fontFamily: interFont, fontSize: 13, fontWeight: 600, color: "#1F2937" }}>Samantha Suarez Martinez</div>
            </div>
            <div>
              <div style={{ fontFamily: interFont, fontSize: 10, color: "#9CA3AF", marginBottom: 2 }}>Documento</div>
              <div style={{ fontFamily: interFont, fontSize: 13, fontWeight: 600, color: "#1F2937" }}>TI 1098765432</div>
            </div>
            <div>
              <div style={{ fontFamily: interFont, fontSize: 10, color: "#9CA3AF", marginBottom: 2 }}>Acudiente</div>
              <div style={{ fontFamily: interFont, fontSize: 13, fontWeight: 600, color: "#1F2937" }}>Laura Martinez</div>
            </div>
            <div>
              <div style={{ fontFamily: interFont, fontSize: 10, color: "#9CA3AF", marginBottom: 2 }}>Telefono</div>
              <div style={{ fontFamily: interFont, fontSize: 13, fontWeight: 600, color: "#1F2937" }}>+57 300 123 4567</div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid #E5E7EB" }} />

          {/* Payment details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontFamily: interFont, fontSize: 10, color: "#9CA3AF", marginBottom: 2 }}>Concepto</div>
              <div style={{ fontFamily: interFont, fontSize: 13, fontWeight: 600, color: "#1F2937" }}>Mensualidad Tipo 2 #1148</div>
            </div>
            <div>
              <div style={{ fontFamily: interFont, fontSize: 10, color: "#9CA3AF", marginBottom: 2 }}>Metodo</div>
              <div style={{ fontFamily: interFont, fontSize: 13, fontWeight: 600, color: "#1F2937" }}>Bancolombia</div>
            </div>
            <div>
              <div style={{ fontFamily: interFont, fontSize: 10, color: "#9CA3AF", marginBottom: 2 }}>Fecha</div>
              <div style={{ fontFamily: interFont, fontSize: 13, fontWeight: 600, color: "#1F2937" }}>04/03/2026</div>
            </div>
            <div>
              <div style={{ fontFamily: interFont, fontSize: 10, color: "#9CA3AF", marginBottom: 2 }}>Monto</div>
              <div style={{ fontFamily: monoFont, fontSize: 18, fontWeight: 700, color: "#1F2937" }}>$ 140.000</div>
            </div>
          </div>

          {/* Badges */}
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ background: "#FEF3C7", borderRadius: 6, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={10} color="#D97706" />
              <span style={{ fontFamily: interFont, fontSize: 10, fontWeight: 600, color: "#D97706" }}>Por Verificar</span>
            </div>
            <div style={{ background: "#DBEAFE", borderRadius: 6, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4 }}>
              <DollarSign size={10} color="#2563EB" />
              <span style={{ fontFamily: interFont, fontSize: 10, fontWeight: 600, color: "#2563EB" }}>Pago Total</span>
            </div>
          </div>

          {/* Comprobante section */}
          <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: "14px" }}>
            <div style={{ fontFamily: interFont, fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 8 }}>Comprobante adjunto</div>
            <div style={{
              width: "100%", height: 80, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}>
              <div style={{ width: 60, height: 60, borderRadius: 6, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                <CheckCircle size={20} color="#00C853" />
                <span style={{ fontFamily: interFont, fontSize: 7, color: "#059669", marginTop: 2 }}>Exitosa</span>
              </div>
              <div>
                <div style={{ fontFamily: interFont, fontSize: 11, fontWeight: 600, color: "#1F2937" }}>Transferencia Bancolombia</div>
                <div style={{ fontFamily: monoFont, fontSize: 10, color: "#9CA3AF" }}>Ref: 20260304-0847</div>
                <div style={{ fontFamily: interFont, fontSize: 10, color: "#9CA3AF" }}>04/03/2026 08:47 AM</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal footer — action buttons */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #E5E7EB", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#FFFFFF", border: "1px solid #EF4444", borderRadius: 8, padding: "10px 18px" }}>
            <XCircle size={14} color="#EF4444" />
            <span style={{ fontFamily: interFont, fontSize: 12, fontWeight: 600, color: "#EF4444" }}>Rechazar</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#00C853", borderRadius: 8, padding: "10px 18px" }}>
            <CheckCircle size={14} color="#FFFFFF" />
            <span style={{ fontFamily: interFont, fontSize: 12, fontWeight: 600, color: "#FFFFFF" }}>Aprobar Pago</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Main Component ───

export const ScenePromoSolution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleEntry = spring({ frame, fps, config: { damping: 200, stiffness: 80 } });
  const browserEntry = spring({ frame, fps, delay: 8, config: { damping: 200, stiffness: 60 } });
  const glowOpacity = interpolate(frame, [0, fps * 7, fps * 14], [0.08, 0.16, 0.08], { extrapolateRight: "clamp" });

  const currentView = getCurrentView(frame);
  const activeLabel = ACTIVE_BY_VIEW[currentView] ?? "Dashboard";
  const currentUrl = URL_BY_VIEW[currentView] ?? URL_BY_VIEW[0];

  // Title text changes by view
  const TITLES: Record<number, { badge: string; text: string; highlight: string }> = {
    0: { badge: "LA SOLUCION", text: "Control total desde", highlight: "un solo lugar" },
    1: { badge: "JUGADORES", text: "Gestiona todos tus", highlight: "jugadores" },
    2: { badge: "DETALLE", text: "Perfil completo del", highlight: "jugador" },
    3: { badge: "PAGOS", text: "Verifica pagos en", highlight: "segundos" },
  };
  const title = TITLES[currentView] ?? TITLES[0];

  return (
    <AbsoluteFill style={{ background: PROMO.bg }}>
      {/* Green glow */}
      <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)", width: 1400, height: 900, background: `radial-gradient(ellipse, rgba(0, 200, 83, ${glowOpacity}) 0%, transparent 70%)`, filter: "blur(120px)" }} />

      {/* Title — changes per view */}
      <div
        style={{
          position: "absolute",
          top: 36,
          left: "50%",
          transform: `translateX(-50%) translateY(${Math.round((1 - titleEntry) * 16)}px)`,
          opacity: titleEntry,
          display: "flex",
          alignItems: "center",
          gap: 20,
          fontFamily: interFont,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: PROMO.greenGlow, border: `1px solid ${PROMO.greenBorder}`, borderRadius: 9999, padding: "8px 22px" }}>
          <span style={{ fontFamily: monoFont, fontSize: 13, fontWeight: 600, color: PROMO.green, letterSpacing: "0.08em" }}>
            {title.badge}
          </span>
        </div>
        <div style={{ fontSize: 36, fontWeight: 900, color: PROMO.text, letterSpacing: "-0.02em" }}>
          {title.text}{" "}
          <span style={{ color: PROMO.green }}>{title.highlight}</span>
        </div>
      </div>

      {/* Browser frame */}
      <div
        style={{
          position: "absolute",
          top: 110,
          left: 40,
          right: 40,
          bottom: 30,
          opacity: browserEntry,
          transform: `translateY(${Math.round((1 - browserEntry) * 30)}px)`,
          background: "#FAFAFA",
          border: `1px solid ${PROMO.border}`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Browser chrome */}
        <div
          style={{
            height: 40,
            background: PROMO.bgElevated,
            borderBottom: `1px solid ${PROMO.border}`,
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F57" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FEBC2E" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28C840" }} />
          </div>
          <div style={{ flex: 1, marginLeft: 16, height: 26, background: PROMO.bg, borderRadius: 8, border: `1px solid ${PROMO.border}`, display: "flex", alignItems: "center", padding: "0 12px", gap: 8 }}>
            <Search size={11} color={PROMO.textMuted} />
            <span style={{ fontFamily: monoFont, fontSize: 11, color: PROMO.textMuted }}>{currentUrl}</span>
          </div>
        </div>

        {/* App body */}
        <div style={{ display: "flex", height: "calc(100% - 40px)", position: "relative" }}>
          {/* Sidebar */}
          <div
            style={{
              width: 200,
              background: "#FFFFFF",
              borderRight: "1px solid #E5E7EB",
              padding: "14px 10px",
              display: "flex",
              flexDirection: "column",
              gap: 1,
              overflow: "hidden",
            }}
          >
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", marginBottom: 10 }}>
              <Img src={staticFile("widdo-logo.svg")} style={{ width: 24, height: 24 }} />
              <div>
                <div style={{ fontFamily: interFont, fontSize: 14, fontWeight: 800, color: "#1F2937" }}>Widdo</div>
                <div style={{ fontFamily: interFont, fontSize: 9, color: "#9CA3AF" }}>Gestion deportiva</div>
              </div>
            </div>

            {SIDEBAR_ITEMS.map((item, i) => {
              if (item.section === "header") {
                return (
                  <div key={i} style={{ fontFamily: interFont, fontSize: 9, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.08em", padding: "12px 10px 4px" }}>
                    {item.label}
                  </div>
                );
              }
              const isActive = item.label === activeLabel;
              const Icon = item.icon!;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 10px",
                    borderRadius: 8,
                    background: isActive ? "#00C853" : "transparent",
                  }}
                >
                  <Icon size={14} color={isActive ? "#FFFFFF" : "#6B7280"} strokeWidth={2} />
                  <span style={{ fontFamily: interFont, fontSize: 12, fontWeight: isActive ? 600 : 400, color: isActive ? "#FFFFFF" : "#374151" }}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Main content area */}
          <div style={{ flex: 1, background: "#F3F4F6", overflow: "hidden", position: "relative" }}>
            {/* Top header bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 24px", background: "#FFFFFF", borderBottom: "1px solid #E5E7EB" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Users size={14} color="#6B7280" />
                </div>
                <div>
                  <div style={{ fontFamily: interFont, fontSize: 13, fontWeight: 700, color: "#1F2937" }}>Corporacion Deportiva Familia Aba</div>
                  <div style={{ fontFamily: interFont, fontSize: 10, color: "#9CA3AF" }}>Propietario del Club</div>
                </div>
                <ChevronDown size={14} color="#9CA3AF" />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: interFont, fontSize: 12, color: "#6B7280" }}>Erika Ramirez</span>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#00C853" }} />
                <Bell size={14} color="#9CA3AF" />
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#00C853", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: interFont, fontSize: 11, fontWeight: 700, color: "#FFFFFF" }}>ER</div>
              </div>
            </div>

            {/* Scrollable content — views stacked with opacity transitions */}
            <div style={{ position: "relative", height: "calc(100% - 48px)", overflow: "hidden" }}>
              {/* View 0: Dashboard */}
              <div style={{ position: "absolute", inset: 0, opacity: getViewOpacity(frame, 0), overflow: "hidden" }}>
                <DashboardView frame={frame} fps={fps} />
              </div>

              {/* View 1: Players Grid */}
              <div style={{ position: "absolute", inset: 0, opacity: getViewOpacity(frame, 1), overflow: "hidden" }}>
                <PlayersGridView frame={frame} fps={fps} />
              </div>

              {/* View 2: Player Detail */}
              <div style={{ position: "absolute", inset: 0, opacity: getViewOpacity(frame, 2), overflow: "hidden" }}>
                <PlayerDetailView frame={frame} fps={fps} />
              </div>
            </div>

            {/* FABs */}
            <div style={{ position: "absolute", bottom: 16, right: 16, display: "flex", flexDirection: "column", gap: 10, zIndex: 40 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #00C853 0%, #00E676 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,200,83,0.4)" }}>
                <Bot size={20} color="#FFFFFF" strokeWidth={2} />
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(37,211,102,0.4)" }}>
                <MessageSquare size={20} color="#FFFFFF" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* View 3: Payment Modal — overlays everything */}
          <div style={{ position: "absolute", inset: 0, opacity: getViewOpacity(frame, 3), pointerEvents: "none", zIndex: 45 }}>
            <PaymentModalView frame={frame} fps={fps} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
