'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { PlotParams } from 'react-plotly.js';

const Plotly = dynamic(() => import('react-plotly.js'), { 
  ssr: false,
  loading: () => (
    <div className="h-[300px] flex items-center justify-center">
      <span className="text-[var(--theme-text-secondary)] text-sm font-jetbrains-mono">...</span>
    </div>
  ),
});

// Minimal theme matching the site's aesthetic
const themes = {
  light: {
    text: 'rgb(30, 30, 30)',
    textMuted: 'rgb(120, 120, 120)',
    grid: 'rgba(0, 0, 0, 0.08)',
    line: 'rgb(120, 120, 120)',
    marker: 'rgb(30, 30, 30)',
  },
  dark: {
    text: 'rgb(225, 225, 225)',
    textMuted: 'rgb(120, 120, 120)',
    grid: 'rgba(255, 255, 255, 0.08)',
    line: 'rgb(140, 140, 140)',
    marker: 'rgb(225, 225, 225)',
  },
};

const defaultConfig: Partial<Plotly.Config> = {
  displayModeBar: false,
  responsive: true,
  staticPlot: false,
};

interface PlotProps extends Omit<PlotParams, 'layout' | 'config'> {
  layout?: Partial<Plotly.Layout>;
  config?: Partial<Plotly.Config>;
  className?: string;
}

export function Plot({ data, layout, config, className, ...rest }: PlotProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const theme = isDark ? themes.dark : themes.light;

  // Merge axis options - preserve user's type, automargin, etc
  const userXaxis = layout?.xaxis as Record<string, unknown> | undefined;
  const userYaxis = layout?.yaxis as Record<string, unknown> | undefined;

  const themedLayout: Partial<Plotly.Layout> = {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: {
      family: 'JetBrains Mono, monospace',
      color: theme.textMuted,
      size: 10,
    },
    margin: { t: layout?.title ? 40 : 20, r: 15, b: 35, l: 45, ...layout?.margin },
    xaxis: {
      showgrid: userXaxis?.showgrid !== false,
      gridcolor: theme.grid,
      showline: false,
      zeroline: false,
      tickfont: { size: 10, color: theme.textMuted },
      title: { text: userXaxis?.title as string, font: { size: 10, color: theme.textMuted }, standoff: 10 },
      type: userXaxis?.type as 'linear' | 'log' | 'date' | 'category' | undefined,
      constrain: userXaxis?.constrain as 'range' | 'domain' | undefined,
    },
    yaxis: {
      showgrid: userYaxis?.showgrid !== false,
      gridcolor: theme.grid,
      showline: false,
      zeroline: false,
      tickfont: { size: 10, color: theme.textMuted },
      title: { text: userYaxis?.title as string, font: { size: 10, color: theme.textMuted }, standoff: 5 },
      type: userYaxis?.type as 'linear' | 'log' | 'date' | 'category' | undefined,
      scaleanchor: userYaxis?.scaleanchor as 'x' | undefined,
      constrain: userYaxis?.constrain as 'range' | 'domain' | undefined,
    },
    legend: {
      font: { size: 12, color: theme.textMuted },
      bgcolor: 'transparent',
    },
    hoverlabel: {
      bgcolor: isDark ? 'rgb(30, 30, 30)' : 'rgb(250, 250, 250)',
      bordercolor: 'transparent',
      font: { family: 'JetBrains Mono, monospace', size: 11, color: theme.text },
    },
    showlegend: layout?.showlegend,
    height: layout?.height,
    width: layout?.width,
    title: layout?.title ? {
      text: typeof layout.title === 'string' ? layout.title : (layout.title as {text?: string})?.text,
      font: { size: 13, color: theme.text, family: 'JetBrains Mono, monospace' },
      x: typeof layout.title === 'object' && 'x' in layout.title ? layout.title.x : 0.5,
      xanchor: 'center',
    } : undefined,
  };

  // Apply minimal styling to traces
  const themedData = data.map((trace) => {
    if (trace.type === 'scatter' || trace.type === 'scattergl' || !trace.type) {
      const t = trace as Plotly.ScatterData;
      return {
        ...trace,
        line: { 
          color: theme.line, 
          width: 1.5,
          ...t.line,
        },
        marker: { 
          color: theme.marker, 
          size: 5,
          line: { width: 0 },
          ...t.marker,
        },
      };
    }
    
    // Heatmaps: subtle grayscale with transparency
    if (trace.type === 'heatmap') {
      return {
        colorscale: isDark 
          ? [[0, 'rgba(45,45,45,0.5)'], [1, 'rgba(120,120,120,0.8)']]
          : [[0, 'rgba(235,235,235,0.5)'], [1, 'rgba(120,120,120,0.8)']],
        textfont: { 
          color: isDark ? 'rgb(220,220,220)' : 'rgb(40,40,40)',
          size: 11,
        },
        ...trace,
      };
    }
    
    return trace;
  });

  return (
    <div className={`my-8 ${className ?? ''}`}>
      <Plotly
        key={isDark ? 'dark' : 'light'}
        data={themedData as Plotly.Data[]}
        layout={themedLayout}
        config={{ ...defaultConfig, ...config }}
        style={{ width: '100%', height: layout?.height ?? 280 }}
        {...rest}
      />
    </div>
  );
}
