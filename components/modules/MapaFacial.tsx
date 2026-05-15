"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Circle,
  ArrowRight,
  Minus,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { useState, useRef } from "react";

interface FacialPoint {
  id: number;
  x: number;
  y: number;
  quantity: number;
  region: string;
}

interface MapaFacialProps {
  onClose: () => void;
}

export function MapaFacial({ onClose }: MapaFacialProps) {
  const [tool, setTool] = useState<"point" | "arrow" | "line" | "add">("point");
  const [points, setPoints] = useState<FacialPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [showQuantityForm, setShowQuantityForm] = useState(false);
  const [quantity, setQuantity] = useState("0");
  const [showUnits, setShowUnits] = useState(false);
  const canvasRef = useRef<SVGSVGElement>(null);

  const predefinedPoints = [
    { id: 1, x: 180, y: 60, region: "Testa" },
    { id: 2, x: 180, y: 90, region: "Glabela" },
    { id: 3, x: 150, y: 120, region: "Olho E" },
    { id: 4, x: 210, y: 120, region: "Olho D" },
    { id: 5, x: 130, y: 150, region: "Bochecha E" },
    { id: 6, x: 230, y: 150, region: "Bochecha D" },
    { id: 7, x: 180, y: 170, region: "Nariz" },
    { id: 8, x: 170, y: 200, region: "Lábio Superior" },
    { id: 9, x: 190, y: 200, region: "Lábio Inferior" },
    { id: 10, x: 180, y: 240, region: "Mandíbula" },
  ];

  const handlePointClick = (pointData: (typeof predefinedPoints)[0]) => {
    const existingPoint = points.find((p) => p.region === pointData.region);
    if (existingPoint) {
      setSelectedPoint(existingPoint.id);
      setQuantity(existingPoint.quantity.toString());
    } else {
      const newPoint: FacialPoint = {
        id: Math.max(...points.map((p) => p.id), 0) + 1,
        x: pointData.x,
        y: pointData.y,
        quantity: 0,
        region: pointData.region,
      };
      setPoints([...points, newPoint]);
      setSelectedPoint(newPoint.id);
      setQuantity("0");
    }
    setShowQuantityForm(true);
  };

  const handleConfirmQuantity = () => {
    const numQuantity = parseInt(quantity) || 0;
    if (selectedPoint) {
      setPoints(
        points.map((p) =>
          p.id === selectedPoint ? { ...p, quantity: numQuantity } : p
        )
      );
    }
    setShowQuantityForm(false);
    setSelectedPoint(null);
    setQuantity("0");
  };

  const handleCancelQuantity = () => {
    setShowQuantityForm(false);
    setSelectedPoint(null);
    setQuantity("0");
  };

  const handleDeletePoint = (id: number) => {
    setPoints(points.filter((p) => p.id !== id));
  };

  const handleUndo = () => {
    if (points.length > 0) {
      setPoints(points.slice(0, -1));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="font-display text-4xl font-normal"
          style={{ color: "var(--color-text)", letterSpacing: "0.1em" }}
        >
          Mapa Facial Interativo
        </h1>
      </div>

      <div className="flex gap-6">
        {/* Toolbar */}
        <div
          className="flex flex-col gap-2 p-4 rounded"
          style={{ backgroundColor: "var(--color-bg-card)" }}
        >
          <button
            onClick={() => setTool("point")}
            className="p-3 rounded transition-all"
            title="Ponto"
            style={{
              backgroundColor:
                tool === "point" ? "var(--color-gold)" : "transparent",
              color:
                tool === "point" ? "var(--color-text)" : "var(--color-text-muted)",
            }}
          >
            <Circle size={20} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setTool("arrow")}
            className="p-3 rounded transition-all"
            title="Seta"
            style={{
              backgroundColor:
                tool === "arrow" ? "var(--color-gold)" : "transparent",
              color:
                tool === "arrow" ? "var(--color-text)" : "var(--color-text-muted)",
            }}
          >
            <ArrowRight size={20} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setTool("line")}
            className="p-3 rounded transition-all"
            title="Linha"
            style={{
              backgroundColor:
                tool === "line" ? "var(--color-gold)" : "transparent",
              color:
                tool === "line" ? "var(--color-text)" : "var(--color-text-muted)",
            }}
          >
            <Minus size={20} strokeWidth={1.5} />
          </button>
          <hr style={{ borderColor: "var(--color-divider)" }} />
          <button
            onClick={() => setTool("add")}
            className="p-3 rounded transition-all"
            title="Adicionar"
            style={{
              backgroundColor:
                tool === "add" ? "var(--color-gold)" : "transparent",
              color:
                tool === "add" ? "var(--color-text)" : "var(--color-text-muted)",
            }}
          >
            <Plus size={20} strokeWidth={1.5} />
          </button>
          <button
            onClick={handleUndo}
            className="p-3 rounded transition-all hover:opacity-70"
            title="Desfazer"
            style={{ color: "var(--color-text-muted)" }}
          >
            <RotateCcw size={20} strokeWidth={1.5} />
          </button>
          <button
            onClick={onClose}
            className="p-3 rounded transition-all hover:opacity-70"
            title="Fechar"
            style={{ color: "var(--color-text-muted)" }}
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Canvas Area */}
        <Card className="aria-card flex-1">
          <CardContent className="pt-6">
            <div className="relative flex justify-center bg-gradient-to-b from-gray-50 to-gray-100 rounded p-8">
              {/* SVG Canvas */}
              <svg
                ref={canvasRef}
                width="400"
                height="500"
                style={{ cursor: "crosshair" }}
                className="bg-white rounded shadow"
              >
                {/* Face outline (simplified) */}
                <defs>
                  <radialGradient id="faceGradient" cx="50%" cy="30%">
                    <stop offset="0%" stopColor="#f5e6d3" />
                    <stop offset="100%" stopColor="#e8d4b8" />
                  </radialGradient>
                </defs>

                {/* Head oval */}
                <ellipse cx="200" cy="180" rx="90" ry="130" fill="url(#faceGradient)" stroke="#c9a96e" strokeWidth="2" />

                {/* Hair */}
                <path
                  d="M 110 100 Q 110 20 200 20 Q 290 20 290 100"
                  fill="#8B6F47"
                  stroke="none"
                />

                {/* Eyes */}
                <circle cx="160" cy="130" r="12" fill="white" stroke="#8B6F47" strokeWidth="1" />
                <circle cx="240" cy="130" r="12" fill="white" stroke="#8B6F47" strokeWidth="1" />
                <circle cx="162" cy="132" r="6" fill="#4A3728" />
                <circle cx="242" cy="132" r="6" fill="#4A3728" />

                {/* Nose */}
                <line x1="200" y1="130" x2="200" y2="170" stroke="#8B6F47" strokeWidth="2" />
                <circle cx="190" cy="175" r="4" fill="#8B6F47" />
                <circle cx="210" cy="175" r="4" fill="#8B6F47" />

                {/* Mouth */}
                <path
                  d="M 170 210 Q 200 225 230 210"
                  stroke="#c9a96e"
                  strokeWidth="2"
                  fill="none"
                />

                {/* Chin */}
                <path
                  d="M 150 280 Q 200 310 250 280"
                  stroke="#8B6F47"
                  strokeWidth="1"
                  fill="none"
                />

                {/* Predefined points (invisible, for click detection) */}
                {predefinedPoints.map((point) => {
                  const point_obj = points.find((p) => p.region === point.region);
                  const hasPoint = !!point_obj;

                  return (
                    <g key={point.id}>
                      {/* Click area */}
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="20"
                        fill="transparent"
                        onClick={() => handlePointClick(point)}
                        style={{ cursor: "pointer" }}
                      />

                      {/* Visible point if added */}
                      {hasPoint && (
                        <>
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="8"
                            fill="var(--color-gold)"
                            stroke="white"
                            strokeWidth="2"
                          />
                          {showUnits && point_obj && (
                            <text
                              x={point.x}
                              y={point.y + 20}
                              textAnchor="middle"
                              fontSize="12"
                              fill="#C9A96E"
                              fontWeight="bold"
                            >
                              {point_obj.quantity}
                            </text>
                          )}
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Quantity Form Popover */}
              {showQuantityForm && selectedPoint !== null && (
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded shadow-lg p-4 z-50 min-w-60"
                  style={{
                    border: "2px solid var(--color-gold)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <label
                        className="font-body text-xs mb-2 block"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {points.find((p) => p.id === selectedPoint)?.region || "Região"}
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setQuantity(Math.max(0, parseInt(quantity) - 1).toString())
                          }
                          className="p-1 hover:opacity-70"
                        >
                          <Minus size={16} style={{ color: "var(--color-text-muted)" }} strokeWidth={1.5} />
                        </button>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          className="border-0 bg-gray-50 font-body text-sm text-center flex-1"
                          style={{ color: "var(--color-text)" }}
                        />
                        <button
                          onClick={() =>
                            setQuantity((parseInt(quantity) + 1).toString())
                          }
                          className="p-1 hover:opacity-70"
                        >
                          <Plus size={16} style={{ color: "var(--color-text-muted)" }} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 font-body text-xs font-normal"
                        onClick={handleCancelQuantity}
                      >
                        ✕
                      </Button>
                      <Button
                        className="flex-1 font-body text-xs font-normal"
                        style={{
                          backgroundColor: "var(--color-gold)",
                          color: "var(--color-text)",
                        }}
                        onClick={handleConfirmQuantity}
                      >
                        ✓
                      </Button>
                    </div>

                    {(points.find((p) => p.id === selectedPoint)?.quantity ?? 0) > 0 && (
                      <button
                        onClick={() =>
                          handleDeletePoint(selectedPoint)
                        }
                        className="w-full py-1 px-2 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100 font-body font-normal"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Points List */}
            {points.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded">
                <h4
                  className="font-body text-sm font-medium mb-3"
                  style={{ color: "var(--color-text)" }}
                >
                  Pontos Adicionados
                </h4>
                <div className="space-y-2">
                  {points.map((point) => (
                    <div
                      key={point.id}
                      className="flex items-center justify-between py-2 px-3 bg-white rounded border-l-4"
                      style={{ borderColor: "var(--color-gold)" }}
                    >
                      <div className="flex-1">
                        <p
                          className="font-body text-sm"
                          style={{ color: "var(--color-text)" }}
                        >
                          {point.region}
                        </p>
                        <p
                          className="font-body text-xs"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          Quantidade: {point.quantity} UN
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeletePoint(point.id)}
                        className="p-1 hover:opacity-70"
                      >
                        <X
                          size={16}
                          style={{ color: "#D32F2F" }}
                          strokeWidth={1.5}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="flex items-center gap-4">
          <label
            className="flex items-center gap-2 cursor-pointer"
            style={{ color: "var(--color-text-muted)" }}
          >
            <input
              type="checkbox"
              checked={showUnits}
              onChange={(e) => setShowUnits(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="font-body text-sm">MOSTRAR UNIDADES</span>
          </label>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="font-body text-sm font-normal"
            onClick={onClose}
          >
            Fechar
          </Button>
          <Button
            className="font-body text-sm font-normal"
            style={{
              backgroundColor: "var(--color-gold)",
              color: "var(--color-text)",
            }}
            onClick={() => alert(`${points.length} protocolo(s) adicionado(s)`)}
          >
            Aplicar Protocolos
          </Button>
        </div>
      </div>
    </div>
  );
}
