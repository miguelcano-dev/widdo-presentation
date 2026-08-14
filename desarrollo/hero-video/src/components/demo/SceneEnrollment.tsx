import React from "react";
import {
  AbsoluteFill,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { fontFamily } from "../../fonts";
import { COLORS } from "../../colors";
import { PhoneFrame } from "../ui/PhoneFrame";
import { MockStepper } from "../ui/MockStepper";
import { MockFormField } from "../ui/MockFormField";
import { Callout } from "../ui/Callout";
import { Link, Check, Camera, Upload } from "lucide-react";

// 8 seconds = 240 frames

const STEPS = ["Jugador", "Acudiente", "Confirmar"];

export const SceneEnrollment: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  const phoneW = isVertical ? 400 : 340;
  const phoneH = isVertical ? 780 : 680;

  const currentStep = frame < 30 ? -1 : frame < 105 ? 0 : frame < 165 ? 1 : frame < 210 ? 2 : 3;

  const introProgress = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const introFade = interpolate(frame, [20, 35], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const phoneDelay = 25;
  const phoneProgress = spring({ frame: Math.max(0, frame - phoneDelay), fps, config: { damping: 12, stiffness: 80 } });

  const step1Slide = interpolate(frame, [100, 110], [0, -100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const step2Enter = interpolate(frame, [100, 110], [100, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const step2Slide = interpolate(frame, [160, 170], [0, -100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const step3Enter = interpolate(frame, [160, 170], [100, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const showSuccess = frame >= 210;
  const successProgress = showSuccess
    ? spring({ frame: frame - 210, fps, config: { damping: 10, stiffness: 100 } })
    : 0;

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bgDark,
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 500, height: 500, borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.primaryGlowLight} 0%, transparent 70%)`,
          filter: "blur(60px)",
        }}
      />

      {/* Intro text */}
      {frame < 40 && (
        <div
          style={{
            position: "absolute",
            top: isVertical ? height * 0.3 : "40%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            opacity: introFade * introProgress,
            transform: `translateY(${(1 - introProgress) * 20}px)`,
          }}
        >
          <Link size={isVertical ? 40 : 32} color={COLORS.primary} />
          <div
            style={{
              fontSize: isVertical ? 34 : 28,
              fontWeight: 700,
              color: COLORS.textWhite,
              textAlign: "center",
            }}
          >
            Tu link de inscripcion publica
          </div>
        </div>
      )}

      {/* Phone */}
      <div
        style={{
          opacity: phoneProgress,
          transform: `scale(${phoneProgress}) translateY(${(1 - phoneProgress) * 30}px)`,
        }}
      >
        <PhoneFrame width={phoneW} height={phoneH}>
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              background: "#fff",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Club header */}
            <div
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "rgba(255,255,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800, color: "#fff",
                }}
              >
                B
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Bogota FC</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)" }}>Inscripcion 2026</div>
              </div>
            </div>

            {/* Stepper */}
            {currentStep >= 0 && currentStep < 3 && (
              <MockStepper steps={STEPS} activeStep={currentStep} />
            )}

            {/* Step content */}
            <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
              {/* Step 1 */}
              {currentStep <= 1 && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    padding: "12px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    transform: `translateX(${step1Slide}%)`,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.gray900 }}>
                    Datos del Jugador
                  </div>
                  <div
                    style={{
                      width: 64, height: 64, borderRadius: "50%",
                      border: `2px dashed ${COLORS.gray300}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      alignSelf: "center",
                    }}
                  >
                    <Camera size={22} color={COLORS.gray500} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <MockFormField label="Nombres" value="Santiago" width="50%" />
                    <MockFormField label="Apellidos" value="Lopez Rivera" width="50%" />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <MockFormField label="Documento" value="1.023.456.789" width="50%" />
                    <MockFormField label="Fecha nac." value="15/03/2013" width="50%" />
                  </div>
                  <MockFormField label="Genero" value="Masculino" />
                  <MockFormField label="Telefono" value="+57 310 234 5678" />
                </div>
              )}

              {/* Step 2 */}
              {currentStep >= 1 && currentStep <= 2 && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    padding: "12px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    transform: `translateX(${currentStep === 1 ? step2Enter : step2Slide}%)`,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.gray900 }}>
                    Datos del Acudiente
                  </div>
                  <MockFormField label="Nombre completo" value="Maria Rivera Gomez" />
                  <MockFormField label="Parentesco" value="Madre" />
                  <MockFormField label="Telefono" value="+57 311 987 6543" />
                  <MockFormField label="Email" value="maria.rivera@email.com" />
                  <MockFormField label="Direccion" value="Cra 15 #23-45, Bogota" />
                  <div
                    style={{
                      border: `1px dashed ${COLORS.gray300}`,
                      borderRadius: 8,
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Upload size={14} color={COLORS.gray500} />
                    <span style={{ fontSize: 11, color: COLORS.gray500 }}>Subir documento de identidad</span>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {currentStep >= 2 && !showSuccess && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    padding: "12px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    transform: `translateX(${step3Enter}%)`,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.gray900 }}>
                    Confirmar Inscripcion
                  </div>
                  <div
                    style={{
                      background: COLORS.surfaceLight,
                      borderRadius: 8,
                      padding: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.gray700 }}>Resumen</div>
                    {[
                      ["Jugador", "Santiago Lopez Rivera"],
                      ["Edad", "12 anos"],
                      ["Acudiente", "Maria Rivera Gomez"],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: COLORS.gray600 }}>
                        <span>{k}:</span>
                        <span style={{ fontWeight: 600, color: COLORS.gray900 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      border: `1px solid ${COLORS.gray200}`,
                      borderRadius: 8,
                      padding: 12,
                      height: 60,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: 11, color: COLORS.gray500 }}>Firma digital aqui</span>
                  </div>
                  <div
                    style={{
                      background: COLORS.primary,
                      borderRadius: 8,
                      padding: "12px 0",
                      textAlign: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    Completar inscripcion
                  </div>
                </div>
              )}

              {/* Success */}
              {showSuccess && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 72, height: 72, borderRadius: "50%",
                      background: `${COLORS.success}18`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transform: `scale(${successProgress})`,
                    }}
                  >
                    <Check size={36} color={COLORS.success} strokeWidth={3} />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.gray900, opacity: successProgress }}>
                    Inscripcion completada!
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.gray500, opacity: successProgress }}>
                    El club revisara tu solicitud
                  </div>
                </div>
              )}
            </div>
          </div>
        </PhoneFrame>
      </div>

      <Sequence from={215} layout="none">
        <Callout
          text="Los padres se inscriben solos"
          position="bottom-center"
          variant="default"
          fontSize={isVertical ? 26 : 22}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
