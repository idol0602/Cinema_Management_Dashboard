import { DynamicBarChart } from "./DynamicBarChart";
import { DynamicLineChart } from "./DynamicLineChart";
import { DynamicPieChart } from "./DynamicPieChart";
import type { chartType } from "../../types/chart.type";

export function ChartRenderer({
  data,
  schema,
}: {
  data: [];
  schema: chartType;
}) {
  switch (schema.type) {
    case "bar":
      return <DynamicBarChart data={data} schema={schema} />;
    case "line":
      return <DynamicLineChart data={data} schema={schema} />;
    case "pie":
      return <DynamicPieChart data={data} schema={schema} />;
    default:
      return null;
  }
}
