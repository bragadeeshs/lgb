# Data Inventory and Dashboard Outline

## Overview
This `dump/` directory contains a MongoDB dump for a database named `pgr_trace`. The data is manufacturing/plant operations focused: OEE, machine status, energy consumption, work orders, heat treatment, inspections, tool usage, and user/role metadata.

## Coverage Window (observed timestamps)
- Earliest timestamp: 2025-07-08T07:27:22.703000 (from `PCB_Trace`)
- Latest timestamp: 2026-02-06T09:37:10 (from `energy_consumption`)
- High-frequency telemetry: `energy_consumption` (1,020,439 rows) and `machine_status` (866,424 rows)

## Collections Summary
| Collection | Rows | Date Range (min - max) | Example Fields |
|---|---:|---|---|
| PCB_Trace | 20 | 2025-07-08T07:27:22.703000 - 2025-07-09T07:49:47.353000 | _id, flag, machine_description, machine_id, operator_id, process_name, rejected_count, rejection_details … |
| PMS_assignrole | 4 | N/A | _id, employee_code, role_name |
| PMS_heattreatment | 5 | N/A | _id, machines, process_name, serial_no |
| PMS_logs | 64 | 2025-07-26T10:34:04.757000 - 2026-02-03T17:21:09.355000 | _id, ip, level, message, name, timestamp, username |
| PMS_machine_info | 18 | 2025-09-02T00:00:00 - 2025-12-08T00:00:00 | _id, cycle_time, installation_date, last_maintenance_date, machine_name, machine_type, part_count, serial_number … |
| PMS_oee_cell | 4 | N/A | _id, controlplanno, part_name, partno_id, processes, sap_plant_code |
| PMS_partno | 4 | N/A | _id, part_name, part_number, project_id, project_name, sap_plant_code |
| PMS_project | 3 | N/A | _id, project_name, sap_plant_code |
| PMS_role | 7 | N/A | _id, role_id, role_name |
| PMS_shiftwise_oee | 3893 | 2025-09-18T00:00:00 - 2026-02-06T07:55:01.407000 | _id, availability, created_at, cycle_time_minutes, cycle_time_seconds, data_source, date, downtime … |
| PMS_tools | 375 | 2025-12-08T16:39:11.191000 - 2025-12-08T16:39:11.193000 | _id, created_date, product_no, tool_code, tool_life, tool_status |
| PMS_unplanneddowntime | 30955 | 2025-09-25T17:05:52.154000 - 2026-02-06T09:34:26 | _id, created_at, createdat, date, machine_id, process_name, unplanned_downtime |
| daily_oee_report | 1255 | 2025-09-25T00:00:00 - 2026-02-06T02:27:03.929000 | _id, availability, created_at, created_at_utc, cycle_time_minutes, cycle_time_seconds, data_source, date … |
| device_configs | 2 | N/A | _id, command, device_name, hostname, password, plant, status, username |
| energy_consumption | 1020439 | 2025-12-23T10:40:29 - 2026-02-06T09:37:10 | KVAR, KVARH, _id, average_PF, created_at, employee_code, machine_id, machine_name … |
| heat_treatment | 641 | 2025-09-08T08:45:04.387000 - 2026-02-06T09:10:28.813000 | _id, batch_no, chargeno, end_time, operator_id, process_name, scanned_machine, start_time … |
| machine_status | 866424 | 2026-01-05T04:36:19.181000 - 2026-02-06T09:35:59.717000 | _id, created_at, end_time, machine_id, machine_name, start_time, stroke_count |
| sapplant | 1 | N/A | _id, plant_code, plant_name, sap_plant_code |
| setup_inspection | 9 | 2026-01-20T03:53:42.190000 - 2026-01-27T12:57:57.324000 | _id, approved_at, approved_by, approved_count, inspection_type, machine_id, operator_id, rejected_count … |
| sub_process | 1 | N/A | _id, plant_name, sap_plant_code, sub_process_name |
| tool_in_machine | 2 | 2025-12-09T16:48:32.981000 - 2025-12-31T17:27:56.250000 | _id, created_at, machine, operation_type, operator, product, status, status_flag … |
| trace_assignrole | 2 | N/A | _id, employee_code, role_name |
| trace_employees | 6 | N/A | _id, department, designation, division, dob, doj, email, employee_code … |
| trace_role | 4 | N/A | _id, role_id, role_name |
| trace_users.users | 6 | N/A | _id, first_name, username |
| traceability_log | 67 | 2025-08-22T11:22:20.718000 - 2026-01-30T15:50:21.158000 | _id, ip, level, message, name, timestamp, url_path, username |
| users | 6 | N/A | _id, first_name, username |
| users.employees | 8 | N/A | _id, department, designation, division, dob, doj, email, employee_code … |
| users.users | 2 | N/A | _id, first_name, username |
| work_order_entry | 3238 | 2025-12-01T08:12:18 - 2026-02-06T08:56:05 | _id, downtime_duration, flag, idle_duration, machine_description, machine_id, operator_id, process_name … |

## Sensitive Fields
- `device_configs` includes `username` and `password`. Treat as secrets and redact in any export.
- `trace_employees` and `users.employees` contain PII (name, email, mobile, DOB, DOJ).

## Suggested Core Metrics
- **OEE**: overall, availability, performance, quality (from `daily_oee_report`, `PMS_shiftwise_oee`)
- **Throughput**: `total_parts`, `total_count`, `work_order_count`
- **Downtime**: `unplanned_downtime`, `downtime_duration`, `idle_duration`
- **Scrap/Rejection**: `rejected_count`, `rejected_parts`, `rejection_details`
- **Energy**: `power_consumed`, `total_kilowatt`, `average_PF`
- **Machine Utilization**: `machine_status` start/end times, stroke counts
- **Heat Treatment**: batch throughput and cycle durations

## Dashboard Representation (wireframe)
```
PGR TRACE — OPERATIONS DASHBOARD
Date Range: [2025-12-23 .. 2026-02-06]  Plant: [All]  Machine: [All]  Shift: [All]

KPI STRIP
[OEE %]  [Availability %]  [Performance %]  [Quality %]  [Throughput]  [Scrap %]  [Energy kWh]

ROW 1
OEE Trend (daily)            Downtime Trend (unplanned)       Energy Consumption (kWh)
line chart                  line/area chart                  line chart

ROW 2
Machine Utilization (per machine)    Top Downtime Machines     Scrap by Process
bar/heatmap                          bar chart                stacked bar

ROW 3
Work Orders (count + duration)       Heat Treatment Batches    Tool Life / Status
bar + line                            timeline                 status table

ROW 4
Alerts
- OEE below 75% (last 3 shifts average)
- Unplanned downtime spike if latest downtime > 30 minutes
- Energy spike if latest kWh > 140
- Scrap rate increase if latest scrap > 2.5%
Rules use fixed thresholds against the most recent filtered data point (and last 3 for OEE).
```

## Forecasts To Build
- **OEE Forecast (daily/shift)**: predict next 7–30 days from `daily_oee_report` and `PMS_shiftwise_oee`
- **Downtime Forecast**: `PMS_unplanneddowntime` by machine/process
- **Throughput Forecast**: `work_order_entry` and `daily_oee_report.total_count`
- **Energy Forecast**: `energy_consumption` per machine and plant
- **Scrap/Rejection Forecast**: `rejected_count` and `rejected_parts`
- **Heat Treatment Cycle Time Forecast**: `heat_treatment` start/end times

## Notes
- There are overlapping user/employee collections (`users`, `users.users`, `trace_users.users`, `users.employees`, `trace_employees`) that likely represent different modules or historical schema changes.
- `daily_oee_report` and `PMS_shiftwise_oee` should be treated as primary sources for OEE analytics.
- `machine_status` and `energy_consumption` are high volume and will benefit from time-based partitioning for analytics.
