"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

const monthlyData = [
  { month: "Oca", gelir: 150000, gider: 80000 },
  { month: "Şub", gelir: 180000, gider: 95000 },
  { month: "Mar", gelir: 220000, gider: 110000 },
  { month: "Nis", gelir: 200000, gider: 105000 },
  { month: "May", gelir: 250000, gider: 120000 },
  { month: "Haz", gelir: 280000, gider: 130000 },
]

const siteData = [
  { name: "İstanbul", value: 45 },
  { name: "Ankara", value: 30 },
  { name: "İzmir", value: 15 },
  { name: "Kocaeli", value: 10 },
]

export default function DashboardCharts() {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Revenue/Expense Chart */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h3 className="text-lg font-semibold text-white mb-4">Aylık Gelir/Gider</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
              }}
              itemStyle={{ color: "#e2e8f0" }}
            />
            <Bar dataKey="gelir" fill="#3b82f6" name="Gelir" />
            <Bar dataKey="gider" fill="#ef4444" name="Gider" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Personnel Distribution Chart */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h3 className="text-lg font-semibold text-white mb-4">Şantiye Personel Dağılımı</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={siteData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {siteData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
              }}
              itemStyle={{ color: "#e2e8f0" }}
            />
            <Legend
              wrapperStyle={{ color: "#e2e8f0" }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
