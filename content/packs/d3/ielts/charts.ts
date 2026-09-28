/**
 * Data for the IELTS Writing Task 1 figures. scripts/content/d3/make-graphics.ts draws the
 * SVG files from these definitions, so the figure and the prompt always match. The figures
 * use illustrative practice data (countries A–C, "a city"), not real statistics.
 */
export type LineChart = { kind: "line"; name: string; title: string; unit: string; xLabels: string[]; series: Array<{ label: string; values: number[] }>; yMax: number };
export type BarChart = { kind: "bar"; name: string; title: string; unit: string; categories: string[]; series: Array<{ label: string; values: number[] }>; yMax: number };
export type TableChart = { kind: "table"; name: string; title: string; columns: string[]; rows: string[][]; note?: string };
export type Chart = LineChart | BarChart | TableChart;

export const broadbandChart: LineChart = {
  kind: "line", name: "task1-broadband-households", title: "Households with a broadband connection (%)", unit: "%", yMax: 100,
  xLabels: ["2004", "2008", "2012", "2016", "2020", "2024"],
  series: [
    { label: "Country A", values: [12, 35, 58, 74, 86, 92] },
    { label: "Country B", values: [5, 14, 30, 52, 70, 81] },
    { label: "Country C", values: [25, 40, 48, 55, 61, 66] }
  ]
};

export const leisureChart: BarChart = {
  kind: "bar", name: "task1-leisure-hours", title: "Average hours per week spent on leisure activities, by age group", unit: "hours", yMax: 18,
  categories: ["Watching TV", "Social media", "Sport and exercise", "Reading"],
  series: [
    { label: "16–24", values: [8, 14, 5, 2] },
    { label: "25–44", values: [10, 8, 4, 3] },
    { label: "45 and over", values: [16, 3, 3, 6] }
  ]
};

export const visitorsTable: TableChart = {
  kind: "table", name: "task1-city-attractions", title: "Visitors to four attractions in a city (thousands)",
  columns: ["Attraction", "2014", "2024"],
  rows: [["Science museum", "420", "510"], ["Art gallery", "380", "300"], ["Aquarium", "250", "460"], ["Castle", "610", "640"]],
  note: "Illustrative practice data"
};

export const ieltsCharts: Chart[] = [broadbandChart, leisureChart, visitorsTable];
export const chartImage = (chart: Chart, alt: string) => ({ src: `/demo-media/images/ielts/${chart.name}.svg`, alt, credit: "Figure: English 4 Free original, illustrative practice data, CC0 1.0" });
