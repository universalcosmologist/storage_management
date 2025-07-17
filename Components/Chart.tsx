"use client";

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { calculatePercentage, convertFileSize } from "@/lib/utils";

const chartConfig = {
  size: {
    label: "Size",
  },
  used: {
    label: "Used",
    color: "hsl(var(--brand))", // Updated to use brand color from Tailwind
  },
} satisfies ChartConfig;

export const Chart = ({ used = 0 }: { used: number }) => {
  const percentage = isNaN(calculatePercentage(used))
    ? 0
    : Number(calculatePercentage(used));

  const chartData = [
    {
      storage: "used",
      used: used,
      fill: '#FFF', // <-- Use brand color here
    },
  ];

  return (
    <Card className="chart">
      <CardContent className="flex-1 p-0">
        <ChartContainer config={chartConfig} className="chart-container">
          {percentage > 0 ? (
            <RadialBarChart
              data={chartData}
              startAngle={90}
              endAngle={percentage + 90}
              innerRadius={80}
              outerRadius={110}
            >
              <PolarGrid
                gridType="circle"
                radialLines={false}
                stroke="none"
                className="polar-grid"
                polarRadius={[86, 74]}
              />
              <RadialBar
                dataKey="used"
                background
                cornerRadius={10}
              />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="chart-total-percentage"
                          >
                            {percentage.toString().replace(/^0+/, "")}%
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-white/70"
                          >
                            Space used
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </PolarRadiusAxis>
            </RadialBarChart>
          ) : (
            // Optional fallback UI when usage is 0%
            <div className="flex items-center justify-center h-[220px]">
              <p className="text-sm text-muted-foreground">No usage yet</p>
            </div>
          )}
        </ChartContainer>
      </CardContent>
      <CardHeader className="chart-details">
        <CardTitle className="chart-title">Available Storage</CardTitle>
        <CardDescription className="chart-description">
          {used ? convertFileSize(used) : "0B"} / 2GB
        </CardDescription>
      </CardHeader>
    </Card>
  );
};
