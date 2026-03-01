export interface chartType {
    type: "bar" | "line" | "pie";
    title?: string;
    xField?: string;
    yFields?: string[];

    labelField?: string;
    valueField?: string;
}

/**
 * Unified chart input interface.
 * Combines data and schema into a single object for easy usage.
 */
export interface ChartInput {
    type: "bar" | "line" | "pie";
    title?: string;
    data: Record<string, unknown>[];

    // Bar & Line chart fields
    xField?: string;
    yFields?: string[];

    // Pie chart fields
    labelField?: string;
    valueField?: string;
}