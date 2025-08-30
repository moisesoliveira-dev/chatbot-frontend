'use client';

import React, { useRef, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

interface ChartDataPoint {
    label: string;
    value: number;
    color?: string;
}

interface SimpleChartProps {
    title: string;
    data: ChartDataPoint[];
    type: 'line' | 'bar' | 'doughnut';
    height?: number;
    className?: string;
}

export const SimpleChart: React.FC<SimpleChartProps> = ({
    title,
    data,
    type,
    height = 300,
    className,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set up canvas size
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const padding = 40;
        const chartWidth = rect.width - padding * 2;
        const chartHeight = rect.height - padding * 2;

        if (type === 'line') {
            drawLineChart(ctx, data, padding, chartWidth, chartHeight);
        } else if (type === 'bar') {
            drawBarChart(ctx, data, padding, chartWidth, chartHeight);
        } else if (type === 'doughnut') {
            drawDoughnutChart(ctx, data, rect.width / 2, rect.height / 2, Math.min(chartWidth, chartHeight) / 3);
        }
    }, [data, type]);

    const drawLineChart = (
        ctx: CanvasRenderingContext2D,
        data: ChartDataPoint[],
        padding: number,
        width: number,
        height: number
    ) => {
        if (data.length === 0) return;

        const maxValue = Math.max(...data.map(d => d.value));
        const minValue = Math.min(...data.map(d => d.value));
        const range = maxValue - minValue || 1;

        // Draw grid lines
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + width, y);
            ctx.stroke();
        }

        // Draw line
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((point, index) => {
            const x = padding + (width / (data.length - 1)) * index;
            const y = padding + height - ((point.value - minValue) / range) * height;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            // Draw points
            ctx.fillStyle = '#3b82f6';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });

        ctx.stroke();

        // Draw labels
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        data.forEach((point, index) => {
            const x = padding + (width / (data.length - 1)) * index;
            ctx.fillText(point.label, x, padding + height + 20);
        });
    };

    const drawBarChart = (
        ctx: CanvasRenderingContext2D,
        data: ChartDataPoint[],
        padding: number,
        width: number,
        height: number
    ) => {
        if (data.length === 0) return;

        const maxValue = Math.max(...data.map(d => d.value));
        const barWidth = width / data.length * 0.8;
        const barSpacing = width / data.length * 0.2;

        data.forEach((point, index) => {
            const x = padding + index * (width / data.length) + barSpacing / 2;
            const barHeight = (point.value / maxValue) * height;
            const y = padding + height - barHeight;

            ctx.fillStyle = point.color || '#3b82f6';
            ctx.fillRect(x, y, barWidth, barHeight);

            // Draw labels
            ctx.fillStyle = '#6b7280';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(point.label, x + barWidth / 2, padding + height + 20);

            // Draw values
            ctx.fillStyle = '#374151';
            ctx.fillText(point.value.toString(), x + barWidth / 2, y - 5);
        });
    };

    const drawDoughnutChart = (
        ctx: CanvasRenderingContext2D,
        data: ChartDataPoint[],
        centerX: number,
        centerY: number,
        radius: number
    ) => {
        if (data.length === 0) return;

        const total = data.reduce((sum, point) => sum + point.value, 0);
        let currentAngle = -Math.PI / 2; // Start from top

        const colors = [
            '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
            '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'
        ];

        data.forEach((point, index) => {
            const sliceAngle = (point.value / total) * 2 * Math.PI;
            const color = point.color || colors[index % colors.length];

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.arc(centerX, centerY, radius * 0.6, currentAngle + sliceAngle, currentAngle, true);
            ctx.closePath();
            ctx.fill();

            // Draw labels
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius + 20);
            const labelY = centerY + Math.sin(labelAngle) * (radius + 20);

            ctx.fillStyle = '#374151';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(point.label, labelX, labelY);

            currentAngle += sliceAngle;
        });
    };

    return (
        <Card className={className}>
            <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </CardHeader>
            <CardContent>
                <canvas
                    ref={canvasRef}
                    style={{ width: '100%', height: `${height}px` }}
                    className="w-full"
                />
            </CardContent>
        </Card>
    );
};
