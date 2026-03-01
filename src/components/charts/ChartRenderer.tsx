import { DynamicBarChart } from "./DynamicBarChart";
import { DynamicLineChart } from "./DynamicLineChart";
import { DynamicPieChart } from "./DynamicPieChart";
import type { ChartInput } from "../../types/chart.type";

export function ChartRenderer({ input }: { input: ChartInput }) {
  switch (input.type) {
    case "bar":
      return <DynamicBarChart input={input} />;
    case "line":
      return <DynamicLineChart input={input} />;
    case "pie":
      return <DynamicPieChart input={input} />;
    default:
      return null;
  }
}
