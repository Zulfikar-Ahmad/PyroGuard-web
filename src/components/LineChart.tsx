import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

interface LineChartProps {
  tempData: number[];
  humData: number[];
  timeLabels: string[];
}

export const LineChart: React.FC<LineChartProps> = ({ tempData, humData, timeLabels }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const renderChart = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.save();
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;
      const paddingBottom = 25;
      const chartHeight = height - paddingBottom;

      ctx.clearRect(0, 0, width, height);

      const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
      const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';

      // Grid lines & Y Axis Labels
      ctx.lineWidth = 1;
      ctx.strokeStyle = gridColor;
      ctx.fillStyle = textColor;
      ctx.font = '10px Inter, sans-serif';

      for (let i = 0; i <= 4; i++) {
        const y = (chartHeight * i) / 4;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        const val = 90 - i * 20;
        ctx.fillText(`${val}`, 4, y - 4);
      }

      if (tempData.length < 2) {
        ctx.restore();
        return;
      }

      const dx = width / (tempData.length - 1);

      const getPoints = (data: number[], isTemp: boolean) => {
        return data.map((val, idx) => {
          const x = idx * dx;
          let y = isTemp
            ? chartHeight - ((val - 15) / 25) * chartHeight
            : chartHeight - (val / 100) * chartHeight;
          y = Math.max(0, Math.min(chartHeight, y));
          return { x, y };
        });
      };

      const drawSmoothCurve = (points: { x: number; y: number }[]) => {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[i];
          const p1 = points[i + 1];
          const cp1x = p0.x + (p1.x - p0.x) / 2;
          const cp1y = p0.y;
          const cp2x = p0.x + (p1.x - p0.x) / 2;
          const cp2y = p1.y;
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p1.x, p1.y);
        }
      };

      const tempPoints = getPoints(tempData, true);
      const humPoints = getPoints(humData, false);

      // Fill Humidity Area
      ctx.save();
      drawSmoothCurve(humPoints);
      ctx.lineTo(width, chartHeight);
      ctx.lineTo(0, chartHeight);
      ctx.closePath();
      const humGrad = ctx.createLinearGradient(0, 0, 0, chartHeight);
      humGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
      humGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
      ctx.fillStyle = humGrad;
      ctx.fill();
      ctx.restore();

      // Fill Temperature Area
      ctx.save();
      drawSmoothCurve(tempPoints);
      ctx.lineTo(width, chartHeight);
      ctx.lineTo(0, chartHeight);
      ctx.closePath();
      const tempGrad = ctx.createLinearGradient(0, 0, 0, chartHeight);
      tempGrad.addColorStop(0, 'rgba(249, 115, 22, 0.35)');
      tempGrad.addColorStop(1, 'rgba(249, 115, 22, 0.0)');
      ctx.fillStyle = tempGrad;
      ctx.fill();
      ctx.restore();

      // Stroke Humidity Line
      ctx.save();
      drawSmoothCurve(humPoints);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();

      // Stroke Temperature Line
      ctx.save();
      drawSmoothCurve(tempPoints);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();

      // Dots and X Axis Labels with robust Bounding Box collision check
      let lastDrawnRightEdge = -999;
      tempPoints.forEach((pt, idx) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#f97316';
        ctx.fill();

        const humPt = humPoints[idx];
        ctx.beginPath();
        ctx.arc(humPt.x, humPt.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();

        if (timeLabels[idx]) {
          ctx.fillStyle = textColor;
          ctx.font = '9.5px Inter, sans-serif';
          const label = timeLabels[idx];
          const textWidth = ctx.measureText(label).width;

          const isFirstOrLast = idx === 0 || idx === timeLabels.length - 1;
          const textX = pt.x - textWidth / 2;

          // Only draw if it does not overlap the bounding box of the previously drawn label
          if (textX > lastDrawnRightEdge + 12 || isFirstOrLast) {
            const clampedX = Math.max(0, Math.min(width - textWidth, textX));
            ctx.fillText(label, clampedX, chartHeight + 16);
            lastDrawnRightEdge = clampedX + textWidth;
          }
        }
      });

      ctx.restore();
    };

    renderChart();

    const resizeObserver = new ResizeObserver(() => {
      renderChart();
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [tempData, humData, timeLabels, isDarkMode]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
