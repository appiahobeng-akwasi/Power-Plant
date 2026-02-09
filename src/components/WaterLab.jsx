import React, { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from "recharts";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "./ui/drawer";

function MiniChart({ label, data, color, unit }) {
  const latest = data.length > 0 ? data[data.length - 1].value : "—";
  const gradientId = `gradient-${label.replace(/\s/g, "")}`;

  return (
    <div
      className="bg-white rounded-[16px] p-4 mb-3"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-[12px] font-[700] text-gray-400 uppercase tracking-[1px]">
          {label}
        </span>
        <span className="text-[16px] font-[700]" style={{ color }}>
          {latest}
          {unit && (
            <span className="text-[11px] font-[500] text-gray-400 ml-1">
              {unit}
            </span>
          )}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={100}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(d) =>
              new Date(d).toLocaleDateString("en", { weekday: "short" })
            }
          />
          <Tooltip
            contentStyle={{
              background: "white",
              border: "none",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              fontFamily: "Barlow",
              fontSize: 12,
            }}
            formatter={(v) => [
              `${v}${unit ? " " + unit : ""}`,
              label,
            ]}
            labelFormatter={(d) =>
              new Date(d).toLocaleDateString("en", {
                month: "short",
                day: "numeric",
              })
            }
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={{ r: 3, fill: "white", stroke: color, strokeWidth: 2 }}
            activeDot={{ r: 5, fill: color, stroke: "white", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function WaterLab({ labData, onLogData }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ph, setPh] = useState(6.2);
  const [ec, setEc] = useState(1.4);
  const [temp, setTemp] = useState(22);

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-2 pb-4">
        <h1 className="text-[20px] font-[600] text-forest">Water Chemistry</h1>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-1.5 bg-forest text-white rounded-full px-4 py-2 text-[13px] font-[600] active:scale-95 transition-transform"
        >
          <Plus size={14} />
          Log Data
        </button>
      </div>

      {/* Charts */}
      <div className="px-5">
        <MiniChart label="pH Level" data={labData.ph} color="#2C5530" unit="" />
        <MiniChart label="EC" data={labData.ec} color="#8FA89B" unit="mS" />
        <MiniChart
          label="Temperature"
          data={labData.temp}
          color="#E57373"
          unit="°C"
        />
      </div>

      {/* Log Readings Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Log Readings</DrawerTitle>
          </DrawerHeader>
          <div className="px-6 pb-4 space-y-5">
            {/* pH Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[13px] font-[600] text-gray-600">pH</span>
                <span className="text-[13px] font-[700] text-forest">
                  {ph.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="9"
                step="0.1"
                value={ph}
                onChange={(e) => setPh(+e.target.value)}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #2C5530 ${((ph - 4) / 5) * 100}%, #e5e7eb ${((ph - 4) / 5) * 100}%)`,
                  accentColor: "#2C5530",
                }}
              />
            </div>
            {/* EC Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[13px] font-[600] text-gray-600">EC (mS)</span>
                <span className="text-[13px] font-[700]" style={{ color: "#8FA89B" }}>
                  {ec.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={ec}
                onChange={(e) => setEc(+e.target.value)}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #8FA89B ${((ec - 0.5) / 2.5) * 100}%, #e5e7eb ${((ec - 0.5) / 2.5) * 100}%)`,
                  accentColor: "#8FA89B",
                }}
              />
            </div>
            {/* Temp Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[13px] font-[600] text-gray-600">
                  Temp (°C)
                </span>
                <span className="text-[13px] font-[700]" style={{ color: "#E57373" }}>
                  {temp.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="35"
                step="0.5"
                value={temp}
                onChange={(e) => setTemp(+e.target.value)}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #E57373 ${((temp - 15) / 20) * 100}%, #e5e7eb ${((temp - 15) / 20) * 100}%)`,
                  accentColor: "#E57373",
                }}
              />
            </div>
          </div>
          <DrawerFooter>
            <button
              onClick={() => {
                onLogData(+ph.toFixed(1), +ec.toFixed(1), +temp.toFixed(1));
                setDrawerOpen(false);
                toast.success("📊 Lab reading saved!");
              }}
              className="w-full py-3 bg-forest text-white rounded-full text-[14px] font-[600] active:scale-[0.98] transition-transform"
            >
              Save Reading
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
