
'use client';

import { useEffect, useState } from "react";

export function RecoveryWidget() {
  const [data, setData] = useState(null);
  const [soreness, setSoreness] = useState(1);

  const load = async () => {
    const res = await fetch("/api/recovery");

    if (res.ok) {
      setData(await res.json());
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    const res = await fetch("/api/recovery", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ soreness }),
    });

    if (res.ok) {
      await load();
    }
  };

  if (!data) {
    return <p>Loading recovery...</p>;
  }

  const color =
    data.score >= 75
      ? "#22c55e"
      : data.score >= 45
      ? "#eab308"
      : "#ef4444";

  return (
    <section className="glass-card p-8 space-y-6">
      <h2 className="text-2xl font-serif italic">
        Recovery Readiness
      </h2>

      <div className="text-5xl font-bold" style={{ color }}>
        {data.score}
      </div>

      <div className="h-3 rounded-full bg-white/10">
        <div
          className="h-3 rounded-full"
          style={{
            width: `${data.score}%`,
            background: color,
          }}
        />
      </div>

      <h3 style={{ color }}>
        {data.level}
      </h3>

      <p>{data.advice}</p>

      <div className="flex gap-3">
        <select
          value={soreness}
          onChange={(e) => setSoreness(Number(e.target.value))}
          className="bg-black/30 p-3 rounded-xl"
        >
          <option value={1}>Mild Soreness</option>
          <option value={2}>Moderate Soreness</option>
          <option value={3}>Severe Soreness</option>
        </select>

        <button
          onClick={save}
          className="bg-white text-black px-5 rounded-full"
        >
          Check in
        </button>
      </div>

      <h3 className="font-serif text-xl">
        7-day trend
      </h3>

      <div className="flex items-end gap-3 h-32">
        {data.history.map((d) => (
          <div key={d.date} className="flex-1 text-center">
            <div
              className="rounded-t"
              style={{
                height: `${d.score}%`,
                background:
                  d.score >= 75
                    ? "#22c55e"
                    : d.score >= 45
                    ? "#eab308"
                    : "#ef4444",
              }}
            />

            <small>{d.date}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
