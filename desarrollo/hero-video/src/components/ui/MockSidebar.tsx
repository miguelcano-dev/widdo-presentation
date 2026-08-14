import React from "react";
import { Img, staticFile } from "remotion";
import { fontFamily } from "../../fonts";
import { COLORS } from "../../colors";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  DollarSign,
  HandCoins,
  Trophy,
  GraduationCap,
  Building2,
  Link2,
  type LucideIcon,
} from "lucide-react";

type MenuItem = {
  icon: LucideIcon;
  label: string;
  key: string;
  section?: string;
};

const MENU_ITEMS: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", key: "dashboard" },
  { icon: GraduationCap, label: "Categorias", key: "categories" },
  { icon: Users, label: "Jugadores", key: "players" },
  { icon: Calendar, label: "Calendario", key: "calendar" },
  { icon: Trophy, label: "Torneos", key: "tournaments" },
  { icon: ClipboardList, label: "Asistencia", key: "attendance", section: "ENTRENAMIENTOS" },
  { icon: DollarSign, label: "Cobros", key: "charges", section: "FINANZAS" },
  { icon: HandCoins, label: "Pagos", key: "payments" },
  { icon: Building2, label: "Mi Club", key: "club", section: "CONFIGURACION" },
  { icon: Link2, label: "Inscripcion", key: "enrollment" },
];

type MockSidebarProps = {
  activeKey?: string;
  width?: number;
  accentColor?: string;
};

export const MockSidebar: React.FC<MockSidebarProps> = ({
  activeKey = "dashboard",
  width = 200,
  accentColor = COLORS.primary,
}) => {
  const iconSize = 16;
  const fontSize = 12;

  return (
    <div
      style={{
        width,
        height: "100%",
        background: "#ffffff",
        borderRight: `1px solid ${COLORS.gray200}`,
        display: "flex",
        flexDirection: "column",
        padding: "12px 8px",
        gap: 2,
        fontFamily,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 8px",
          marginBottom: 12,
        }}
      >
        <Img
          src={staticFile("widdo-logo.svg")}
          style={{ width: 26, height: 26 }}
        />
        <div>
          <div
            style={{
              color: COLORS.gray900,
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            Widdo
          </div>
          <div
            style={{
              color: COLORS.gray500,
              fontSize: 8,
              fontWeight: 400,
            }}
          >
            Gestion deportiva
          </div>
        </div>
      </div>

      {/* Menu items */}
      {MENU_ITEMS.map((item) => {
        const isActive = item.key === activeKey;
        const Icon = item.icon;
        return (
          <React.Fragment key={item.key}>
            {item.section && (
              <div
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: COLORS.gray500,
                  padding: "8px 10px 4px",
                  letterSpacing: "0.05em",
                }}
              >
                {item.section}
              </div>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                borderRadius: 6,
                background: isActive ? accentColor : "transparent",
                cursor: "default",
              }}
            >
              <Icon
                size={iconSize}
                color={isActive ? "#fff" : COLORS.gray600}
                strokeWidth={1.8}
              />
              <span
                style={{
                  fontSize,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#fff" : COLORS.gray700,
                }}
              >
                {item.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
