import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { chartType } from "../../types/chart.type";

const COLORS = [
  "#f97316", // orange-500 - primary
  "#fb923c", // orange-400
  "#fdba74", // orange-300
  "#ea580c", // orange-600
  "#c2410c", // orange-700
  "#ffedd5", // orange-100
];

export function DynamicBarChart({
  data,
  schema,
}: {
  data: [];
  schema: chartType;
}) {
  if (!schema?.xField || !schema?.yFields?.length) return null;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey={schema.xField}
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

        {schema.yFields.map((field, index) => (
          <Bar
            key={field}
            dataKey={field}
            fill={COLORS[index % COLORS.length]}
            radius={[8, 8, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
