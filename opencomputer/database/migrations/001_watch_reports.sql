CREATE TABLE watch_reports (
  monitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  checked_at TEXT NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('passed', 'issues', 'blocked')),
  fingerprints TEXT NOT NULL CHECK (json_valid(fingerprints)),
  delivery TEXT NOT NULL,
  PRIMARY KEY (monitor_id, session_id)
);
CREATE INDEX watch_reports_sent ON watch_reports (monitor_id, delivery);
