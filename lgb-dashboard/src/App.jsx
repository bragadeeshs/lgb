import { useMemo, useState } from "react";

const mockRows = [
  { date: "2025-12-23", plant: "Plant A", machine: "M01", shift: "Shift 1", process: "Machining", oee: 74, downtime: 28, energy: 120, throughput: 9800, scrap: 2.1 },
  { date: "2025-12-30", plant: "Plant A", machine: "M02", shift: "Shift 2", process: "Grinding", oee: 76, downtime: 26, energy: 118, throughput: 10300, scrap: 1.8 },
  { date: "2026-01-06", plant: "Plant A", machine: "M03", shift: "Shift 3", process: "Heat Treatment", oee: 73, downtime: 30, energy: 121, throughput: 11200, scrap: 2.6 },
  { date: "2026-01-13", plant: "Plant B", machine: "M04", shift: "Shift 1", process: "Machining", oee: 76, downtime: 24, energy: 125, throughput: 11800, scrap: 2.0 },
  { date: "2026-01-20", plant: "Plant B", machine: "M05", shift: "Shift 2", process: "Inspection", oee: 79, downtime: 21, energy: 132, throughput: 12050, scrap: 0.7 },
  { date: "2026-01-27", plant: "Plant A", machine: "M06", shift: "Shift 3", process: "Grinding", oee: 77, downtime: 23, energy: 136, throughput: 12400, scrap: 1.2 },
  { date: "2026-02-03", plant: "Plant A", machine: "M07", shift: "Shift 1", process: "Machining", oee: 78, downtime: 20, energy: 138, throughput: 12600, scrap: 1.9 },
  { date: "2026-02-06", plant: "Plant B", machine: "M01", shift: "Shift 2", process: "Heat Treatment", oee: 80, downtime: 18, energy: 142, throughput: 12950, scrap: 2.4 },
];

const alertThresholds = {
  oee: 75,
  downtimeMinutes: 30,
  energyKwh: 140,
  scrapPercent: 2.5,
};

function buildForecast(series, horizon = 6, window = 3) {
  if (!series.length) return [];
  const forecast = [];
  let prev = [...series];
  for (let i = 0; i < horizon; i += 1) {
    const start = Math.max(0, prev.length - window);
    const slice = prev.slice(start);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    const next = Math.round(avg * 10) / 10;
    forecast.push(next);
    prev = [...prev, next];
  }
  return forecast;
}

const toolLife = [
  { label: "TL-01", value: "78%" },
  { label: "TL-02", value: "54%" },
  { label: "TL-03", value: "62%" },
  { label: "TL-04", value: "91%" },
];

function LineChart({ data, xLabels, xLabel = "Date", yLabel = "Value", valueFormatter }) {
  const width = 320;
  const height = 160;
  const padding = 32;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const [hoverIndex, setHoverIndex] = useState(null);

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * chartWidth;
    const y = padding + (1 - (v - min) / range) * chartHeight;
    return [x, y];
  });

  const path = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`)
    .join(" ");

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => {
    const value = min + (range * i) / ticks;
    const y = padding + (1 - i / ticks) * chartHeight;
    return { value: value.toFixed(0), y };
  });

  const xTicks = xLabels.length
    ? [xLabels[0], xLabels[Math.floor(xLabels.length / 2)], xLabels[xLabels.length - 1]]
    : [];

  const formatValue = valueFormatter || ((value) => value);

  function handleMove(event) {
    if (!data.length) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const ratio = Math.min(Math.max((x - padding) / chartWidth, 0), 1);
    const idx = Math.round(ratio * (data.length - 1));
    setHoverIndex(idx);
  }

  return (
    <div className="chart-wrap">
      <svg
        className="linechart"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <line className="axis" x1={padding} y1={padding} x2={padding} y2={height - padding} />
        <line className="axis" x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} />

        {yTicks.map((tick, idx) => (
          <g key={idx}>
            <line className="grid" x1={padding} y1={tick.y} x2={width - padding} y2={tick.y} />
            <text className="tick" x={6} y={tick.y + 4}>{tick.value}</text>
          </g>
        ))}

        <path className="line" d={path} />
        {points.map(([x, y], idx) => (
          <circle className={`dot ${hoverIndex === idx ? "active" : ""}`} key={idx} cx={x} cy={y} r={2.6} />
        ))}

        {hoverIndex !== null ? (
          <>
            <line
              className="hover-line"
              x1={points[hoverIndex][0]}
              y1={padding}
              x2={points[hoverIndex][0]}
              y2={height - padding}
            />
          </>
        ) : null}

        <text className="axis-label" x={width / 2} y={height - 6} textAnchor="middle">{xLabel}</text>
        <text className="axis-label" x={10} y={12}>{yLabel}</text>

        {xTicks.map((label, idx) => (
          <text
            key={idx}
            className="tick"
            x={padding + (idx / Math.max(xTicks.length - 1, 1)) * chartWidth}
            y={height - padding + 14}
            textAnchor={idx === 0 ? "start" : idx === xTicks.length - 1 ? "end" : "middle"}
          >
            {label}
          </text>
        ))}
      </svg>
      {hoverIndex !== null ? (
        <div
          className="tooltip"
          style={{
            left: `${(points[hoverIndex][0] / width) * 100}%`,
            top: `${(points[hoverIndex][1] / height) * 100}%`,
          }}
        >
          <strong>{xLabels[hoverIndex] || xLabel}</strong>
          <span>{formatValue(data[hoverIndex])}</span>
        </div>
      ) : null}
    </div>
  );
}

function Card({ title, children, sub }) {
  return (
    <div className="card" tabIndex={0}>
      <div className="card-head">
        <h3>{title}</h3>
        {sub ? <span className="card-sub">{sub}</span> : null}
      </div>
      {children}
    </div>
  );
}

function BarRow({ items, valueSuffix = "%" }) {
  return (
    <div className="bar-list">
      {items.map((item) => (
        <div className="bar-row" key={item.label}>
          <div className="bar-meta">
            <span>{item.label}</span>
            <span>{item.value}{valueSuffix}</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${Math.min(item.value, 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const dateBounds = useMemo(() => {
    const dates = mockRows.map((row) => row.date).sort();
    return {
      min: dates[0],
      max: dates[dates.length - 1],
    };
  }, []);

  const [filters, setFilters] = useState({
    plant: "All",
    machine: "All",
    shift: "All",
    process: "All",
    start: dateBounds.min,
    end: dateBounds.max,
  });

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function resetFilters() {
    setFilters({
      plant: "All",
      machine: "All",
      shift: "All",
      process: "All",
      start: dateBounds.min,
      end: dateBounds.max,
    });
  }

  const options = useMemo(() => {
    const filterBy = (rows, key, value) =>
      value === "All" ? rows : rows.filter((row) => row[key] === value);

    const baseFor = (key) => {
      let rows = [...mockRows];
      if (key !== "plant") rows = filterBy(rows, "plant", filters.plant);
      if (key !== "machine") rows = filterBy(rows, "machine", filters.machine);
      if (key !== "shift") rows = filterBy(rows, "shift", filters.shift);
      if (key !== "process") rows = filterBy(rows, "process", filters.process);
      if (filters.start) rows = rows.filter((row) => row.date >= filters.start);
      if (filters.end) rows = rows.filter((row) => row.date <= filters.end);
      return rows;
    };

    const collect = (key) =>
      Array.from(new Set(baseFor(key).map((row) => row[key]))).sort();

    return {
      plant: collect("plant"),
      machine: collect("machine"),
      shift: collect("shift"),
      process: collect("process"),
    };
  }, [filters]);

  const filteredRows = useMemo(() => {
    return mockRows.filter((row) => {
      if (filters.plant !== "All" && row.plant !== filters.plant) return false;
      if (filters.machine !== "All" && row.machine !== filters.machine) return false;
      if (filters.shift !== "All" && row.shift !== filters.shift) return false;
      if (filters.process !== "All" && row.process !== filters.process) return false;
      if (filters.start && row.date < filters.start) return false;
      if (filters.end && row.date > filters.end) return false;
      return true;
    });
  }, [filters]);

  const series = useMemo(() => {
    const sorted = [...filteredRows].sort((a, b) => a.date.localeCompare(b.date));
    return {
      dates: sorted.map((row) => row.date),
      oee: sorted.map((row) => row.oee),
      downtime: sorted.map((row) => row.downtime),
      energy: sorted.map((row) => row.energy),
      throughput: sorted.map((row) => row.throughput),
      scrap: sorted.map((row) => row.scrap),
    };
  }, [filteredRows]);

  const forecastsBuilt = useMemo(() => {
    return {
      oee: buildForecast(series.oee, 6),
      downtime: buildForecast(series.downtime, 6),
      energy: buildForecast(series.energy, 6),
      throughput: buildForecast(series.throughput, 6),
      scrap: buildForecast(series.scrap, 6),
    };
  }, [series]);

  const oeeForecastSeries = useMemo(() => {
    return [...series.oee, ...forecastsBuilt.oee];
  }, [series.oee, forecastsBuilt.oee]);

  const forecastLabels = useMemo(() => {
    return [
      ...series.dates,
      ...forecastsBuilt.oee.map((_, idx) => `F+${idx + 1}`),
    ];
  }, [series.dates, forecastsBuilt.oee]);

  const forecastSeries = useMemo(() => {
    return {
      oee: [...series.oee, ...forecastsBuilt.oee],
      downtime: [...series.downtime, ...forecastsBuilt.downtime],
      throughput: [...series.throughput, ...forecastsBuilt.throughput],
      energy: [...series.energy, ...forecastsBuilt.energy],
      scrap: [...series.scrap, ...forecastsBuilt.scrap],
      heat: [...series.downtime, ...forecastsBuilt.downtime],
    };
  }, [series, forecastsBuilt]);

  const kpis = useMemo(() => {
    const parseDate = (value) => new Date(`${value}T00:00:00`);
    const endDate = parseDate(filters.end || dateBounds.max);
    const startDate = parseDate(filters.start || dateBounds.min);
    const rangeDays = Math.floor((endDate - startDate) / (24 * 60 * 60 * 1000)) + 1;
    const windowDays = rangeDays < 7 ? 1 : 7;

    const currentStart = new Date(endDate);
    currentStart.setDate(currentStart.getDate() - (windowDays - 1));
    if (currentStart < startDate) currentStart.setTime(startDate.getTime());

    const prevEnd = new Date(currentStart);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - (windowDays - 1));

    const inRange = (row, start, end) => {
      const date = parseDate(row.date);
      return date >= start && date <= end;
    };

    const currentRows = filteredRows.filter((row) => inRange(row, currentStart, endDate));
    const prevRows = filteredRows.filter((row) => inRange(row, prevStart, prevEnd));

    const metricsFor = (rows) => {
      const total = rows.length || 1;
      const sum = (key) => rows.reduce((acc, row) => acc + (row[key] || 0), 0);
      const avg = (key) => sum(key) / total;
      const totalThroughput = sum("throughput");
      const totalEnergy = sum("energy");
      const energyPerPart = totalThroughput ? totalEnergy / totalThroughput : 0;
      const scrapRate = avg("scrap");
      return {
        oee: avg("oee"),
        availability: avg("oee") + 6,
        performance: avg("oee") + 12,
        quality: 100 - scrapRate,
        throughput: totalThroughput,
        scrapRate,
        energy: totalEnergy,
        avgDowntime: avg("downtime"),
        totalThroughput,
        energyPerPart,
        highestScrapProcess: (() => {
          const byProcess = rows.reduce((acc, row) => {
            const entry = acc[row.process] || { total: 0, count: 0 };
            entry.total += row.scrap;
            entry.count += 1;
            acc[row.process] = entry;
            return acc;
          }, {});
          const top = Object.entries(byProcess)
            .map(([process, values]) => ({
              process,
              rate: values.total / Math.max(values.count, 1),
            }))
            .sort((a, b) => b.rate - a.rate)[0];
          return top || { process: "N/A", rate: 0 };
        })(),
      };
    };

    const current = metricsFor(currentRows);
    const previous = metricsFor(prevRows);

    const delta = (curr, prev) => {
      if (!prev || prev === 0) return "N/A";
      const pct = ((curr - prev) / prev) * 100;
      const sign = pct >= 0 ? "+" : "";
      return `${sign}${pct.toFixed(1)}%`;
    };

    return [
      { label: "OEE", value: `${current.oee.toFixed(1)}%`, delta: delta(current.oee, previous.oee) },
      { label: "Availability", value: `${current.availability.toFixed(1)}%`, delta: delta(current.availability, previous.availability) },
      { label: "Performance", value: `${current.performance.toFixed(1)}%`, delta: delta(current.performance, previous.performance) },
      { label: "Quality", value: `${current.quality.toFixed(1)}%`, delta: delta(current.quality, previous.quality) },
      { label: "Throughput", value: `${(current.throughput / 1000).toFixed(1)}k`, delta: delta(current.throughput, previous.throughput) },
      { label: "Scrap Rate", value: `${current.scrapRate.toFixed(1)}%`, delta: delta(current.scrapRate, previous.scrapRate) },
      { label: "Energy (kWh)", value: `${current.energy.toFixed(0)}k`, delta: delta(current.energy, previous.energy) },
      { label: "Avg Downtime", value: `${current.avgDowntime.toFixed(1)} min`, delta: delta(current.avgDowntime, previous.avgDowntime) },
      { label: "Total Throughput", value: `${current.totalThroughput.toFixed(0)} units`, delta: delta(current.totalThroughput, previous.totalThroughput) },
      { label: "Energy per Part", value: `${current.energyPerPart.toFixed(4)} kWh/part`, delta: delta(current.energyPerPart, previous.energyPerPart) },
      {
        label: "Highest Scrap Process",
        value: `${current.highestScrapProcess.process} (${current.highestScrapProcess.rate.toFixed(2)}%)`,
        delta: delta(current.highestScrapProcess.rate, previous.highestScrapProcess.rate),
      },
    ];
  }, [filteredRows, filters, dateBounds]);

  const utilization = useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const entry = map.get(row.machine) || { total: 0, count: 0 };
      entry.total += row.oee;
      entry.count += 1;
      map.set(row.machine, entry);
    });
    return Array.from(map.entries())
      .map(([label, { total, count }]) => ({ label, value: Math.round(total / count) }))
      .sort((a, b) => b.value - a.value);
  }, [filteredRows]);

  const downtimeTop = useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      map.set(row.machine, (map.get(row.machine) || 0) + row.downtime);
    });
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value: Number(value.toFixed(1)) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, [filteredRows]);

  const scrapByProcess = useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const entry = map.get(row.process) || { total: 0, count: 0 };
      entry.total += row.scrap;
      entry.count += 1;
      map.set(row.process, entry);
    });
    return Array.from(map.entries())
      .map(([label, { total, count }]) => ({ label, value: Number((total / count).toFixed(1)) }))
      .sort((a, b) => b.value - a.value);
  }, [filteredRows]);

  const workOrders = useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      map.set(row.machine, (map.get(row.machine) || 0) + row.throughput);
    });
    return Array.from(map.entries())
      .map(([label, value], idx) => ({
        label: `WO-${10200 + idx}`,
        value: Math.round(value / 100),
      }))
      .slice(0, 5);
  }, [filteredRows]);

  const heatTreat = useMemo(() => {
    return filteredRows
      .filter((row) => row.process === "Heat Treatment")
      .map((row, idx) => ({ label: `HT-${218 + idx}`, value: Number((row.downtime / 3).toFixed(1)) }))
      .slice(0, 4);
  }, [filteredRows]);

  const alerts = useMemo(() => {
    if (!filteredRows.length) {
      return ["No alerts for the current filters."];
    }
    const sorted = [...filteredRows].sort((a, b) => a.date.localeCompare(b.date));
    const lastRow = sorted[sorted.length - 1];
    const lastThree = sorted.slice(-3);
    const avgOee =
      lastThree.reduce((sum, row) => sum + (row.oee || 0), 0) / Math.max(lastThree.length, 1);

    const nextAlerts = [];
    if (avgOee < alertThresholds.oee) {
      nextAlerts.push(
        `OEE below ${alertThresholds.oee}% threshold (last 3 shifts avg ${avgOee.toFixed(1)}%)`
      );
    }
    if (lastRow.downtime > alertThresholds.downtimeMinutes) {
      nextAlerts.push(
        `Unplanned downtime spike on ${lastRow.machine} (${lastRow.downtime} min > ${alertThresholds.downtimeMinutes})`
      );
    }
    if (lastRow.energy > alertThresholds.energyKwh) {
      nextAlerts.push(
        `Energy spike on ${lastRow.machine} (${lastRow.energy} kWh > ${alertThresholds.energyKwh})`
      );
    }
    if (lastRow.scrap > alertThresholds.scrapPercent) {
      nextAlerts.push(
        `Scrap rate increase in ${lastRow.process} (${lastRow.scrap}% > ${alertThresholds.scrapPercent}%)`
      );
    }
    return nextAlerts.length ? nextAlerts : ["No alerts for the current filters."];
  }, [filteredRows]);

  const lastUpdated = series.dates[series.dates.length - 1] || dateBounds.max;

  return (
    <div className="app">
      <header className="header">
        <div>
          <div className="logo">LGB</div>
          <div className="title-block">
            <h1>Operations Dashboard</h1>
            <p>Operational metrics for faster decisions.</p>
          </div>
        </div>
        <div className="header-meta">
          <div className="chip subtle">Updated {lastUpdated}</div>
        </div>
      </header>

      <section className="filters" aria-label="Filters">
        <div className="filter">
          <label>Plant</label>
          <select value={filters.plant} onChange={(e) => updateFilter("plant", e.target.value)}>
            <option>All</option>
            {options.plant.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
        <div className="filter">
          <label>Machine</label>
          <select value={filters.machine} onChange={(e) => updateFilter("machine", e.target.value)}>
            <option>All</option>
            {options.machine.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
        <div className="filter">
          <label>Shift</label>
          <select value={filters.shift} onChange={(e) => updateFilter("shift", e.target.value)}>
            <option>All</option>
            {options.shift.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
        <div className="filter">
          <label>Process</label>
          <select value={filters.process} onChange={(e) => updateFilter("process", e.target.value)}>
            <option>All</option>
            {options.process.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
        <div className="filter">
          <label>Start</label>
          <input
            type="date"
            min={dateBounds.min}
            max={filters.end}
            value={filters.start || dateBounds.min}
            onChange={(e) => updateFilter("start", e.target.value)}
          />
        </div>
        <div className="filter">
          <label>End</label>
          <input
            type="date"
            min={filters.start}
            max={dateBounds.max}
            value={filters.end || dateBounds.max}
            onChange={(e) => updateFilter("end", e.target.value)}
          />
        </div>
        <div className="filter filter-action">
          <label>&nbsp;</label>
          <button type="button" className="reset-btn" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      </section>


      <section className="kpi-grid" aria-label="KPI overview">
        {kpis.map((kpi) => (
          <div className="kpi" key={kpi.label} tabIndex={0}>
            <span className="kpi-label">{kpi.label}</span>
            <span className="kpi-value">{kpi.value}</span>
            <span
              className={`kpi-delta ${
                kpi.delta.startsWith("-") ? "down" : kpi.delta === "N/A" ? "subtle" : "up"
              }`}
            >
              {kpi.delta}
            </span>
          </div>
        ))}
      </section>

      <section className="grid" aria-label="Trends">
        <Card title="OEE Trend" sub="Daily OEE Report">
          <LineChart
            data={series.oee}
            xLabels={series.dates}
            xLabel="Date"
            yLabel="OEE %"
            valueFormatter={(value) => `${value}%`}
          />
          <div className="legend">Filtered range</div>
        </Card>
        <Card title="Unplanned Downtime Trend" sub="Downtime Events">
          <LineChart
            data={series.downtime}
            xLabels={series.dates}
            xLabel="Date"
            yLabel="Minutes"
            valueFormatter={(value) => `${value} min`}
          />
          <div className="legend">Minutes per day</div>
        </Card>
        <Card title="Energy Consumption Trend" sub="Power Metering">
          <LineChart
            data={series.energy}
            xLabels={series.dates}
            xLabel="Date"
            yLabel="kWh"
            valueFormatter={(value) => `${value} kWh`}
          />
          <div className="legend">kWh per day</div>
        </Card>
      </section>

      <section className="grid" aria-label="Operations">
        <Card title="Machine Utilization" sub="Machine Status">
          <BarRow items={utilization} />
        </Card>
        <Card title="Top Downtime Machines" sub="Downtime Events">
          <BarRow items={downtimeTop} valueSuffix="h" />
        </Card>
        <Card title="Scrap by Process" sub="Shift OEE Quality">
          <BarRow items={scrapByProcess} valueSuffix="%" />
        </Card>
      </section>

      <section className="grid" aria-label="Production">
        <Card title="Work Orders" sub="Work Order Log">
          <BarRow items={workOrders} valueSuffix="" />
        </Card>
        <Card title="Heat Treatment Batches" sub="Heat Treatment Cycle Log">
          <BarRow items={heatTreat} valueSuffix="h" />
        </Card>
        <Card title="Tool Life / Status" sub="Tool Inventory">
          <div className="tool-list">
            {toolLife.map((tool) => (
              <div className="tool" key={tool.label}>
                <span>{tool.label}</span>
                <span>{tool.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid forecast-grid" aria-label="Forecast Widgets">
        <Card title="OEE Forecast" sub="Moving average">
          <LineChart
            data={forecastSeries.oee}
            xLabels={forecastLabels}
            xLabel="Date"
            yLabel="OEE %"
            valueFormatter={(value) => `${value}%`}
          />
        </Card>
        <Card title="Downtime Forecast" sub="PMS_unplanneddowntime">
          <LineChart
            data={forecastSeries.downtime}
            xLabels={forecastLabels}
            xLabel="Date"
            yLabel="Minutes"
            valueFormatter={(value) => `${value} min`}
          />
        </Card>
        <Card title="Throughput Forecast" sub="work_order_entry">
          <LineChart
            data={forecastSeries.throughput}
            xLabels={forecastLabels}
            xLabel="Date"
            yLabel="Units"
            valueFormatter={(value) => `${value}`}
          />
        </Card>
        <Card title="Energy Forecast" sub="energy_consumption">
          <LineChart
            data={forecastSeries.energy}
            xLabels={forecastLabels}
            xLabel="Date"
            yLabel="kWh"
            valueFormatter={(value) => `${value} kWh`}
          />
        </Card>
        <Card title="Scrap/Rejection Forecast" sub="PMS_shiftwise_oee">
          <LineChart
            data={forecastSeries.scrap}
            xLabels={forecastLabels}
            xLabel="Date"
            yLabel="Scrap %"
            valueFormatter={(value) => `${value}%`}
          />
        </Card>
        <Card title="Heat Treatment Cycle Forecast" sub="heat_treatment">
          <LineChart
            data={forecastSeries.heat}
            xLabels={forecastLabels}
            xLabel="Date"
            yLabel="Minutes"
            valueFormatter={(value) => `${value} min`}
          />
        </Card>
      </section>

      <section className="grid" aria-label="Forecasts">
        <Card title="Alerts" sub="Threshold rules applied">
          <div className="legend">
            OEE &lt; {alertThresholds.oee}% (last 3 shifts avg) · Downtime &gt; {alertThresholds.downtimeMinutes} min ·
            Energy &gt; {alertThresholds.energyKwh} kWh · Scrap &gt; {alertThresholds.scrapPercent}%
          </div>
          <ul className="alert-list">
            {alerts.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
