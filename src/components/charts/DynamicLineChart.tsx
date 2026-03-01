import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { ChartInput } from "../../types/chart.type";

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export function DynamicLineChart({ input }: { input: ChartInput }) {
  const { data, xField, yFields } = input;

  if (!xField || !yFields?.length || !data?.length) return null;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey={xField}
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
        />
        <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px" }} />

        {yFields.map((field, index) => (
          <Line
            key={field}
            dataKey={field}
            type="monotone"
            strokeWidth={3}
            stroke={COLORS[index % COLORS.length]}
            dot={{ r: 5 }}
            activeDot={{ r: 7 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
