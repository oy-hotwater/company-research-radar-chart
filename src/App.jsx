import React, { useState, useEffect, useMemo } from "react";
import {
  Briefcase,
  Building2,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Star,
  Download,
  Upload,
  RefreshCcw,
} from "lucide-react";

// --- 初期評価項目のテンプレート ---
const DEFAULT_CRITERIA = [
  { id: "c1", label: "給与・待遇" },
  { id: "c2", label: "ワークライフバランス" },
  { id: "c3", label: "成長環境" },
  { id: "c4", label: "安定性" },
  { id: "c5", label: "企業文化" },
  { id: "c6", label: "将来性" },
];

// --- カスタムレーダーチャートコンポーネント ---
const RadarChart = ({ data, max = 5, size = 280, color = "#4F46E5" }) => {
  const center = size / 2;
  const radius = (size / 2) * 0.65;
  const angleStep = (Math.PI * 2) / Math.max(data.length, 3);

  const getPoint = (val, index) => {
    const r = (val / max) * radius;
    const angle = index * angleStep - Math.PI / 2;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const gridLevels = Array.from({ length: max }, (_, i) => i + 1);
  const dataPoints = data
    .map((d, i) => {
      const p = getPoint(d.value, i);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible font-sans"
    >
      {/* 背景グリッド */}
      {gridLevels.map((level) => {
        const points = data
          .map((_, i) => {
            const p = getPoint(level, i);
            return `${p.x},${p.y}`;
          })
          .join(" ");
        return (
          <polygon
            key={`grid-${level}`}
            points={points}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="1"
          />
        );
      })}

      {/* 軸とラベル */}
      {data.map((d, i) => {
        const outerPoint = getPoint(max, i);
        const labelPoint = getPoint(max + 1.25, i);
        let textAnchor = "middle";
        if (Math.abs(labelPoint.x - center) > 10)
          textAnchor = labelPoint.x > center ? "start" : "end";
        let dy = labelPoint.y > center ? "1em" : "-0.3em";
        if (Math.abs(labelPoint.y - center) <= 10) dy = "0.3em";

        return (
          <g key={`axis-${i}`}>
            <line
              x1={center}
              y1={center}
              x2={outerPoint.x}
              y2={outerPoint.y}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
            <text
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor={textAnchor}
              dy={dy}
              fill="#4B5563"
              className="font-medium text-[10px] md:text-xs"
            >
              {d.label}
            </text>
            <text
              x={labelPoint.x}
              y={labelPoint.y + (labelPoint.y > center ? 14 : -14)}
              textAnchor={textAnchor}
              dy={dy}
              fill={color}
              className="font-bold text-[10px]"
            >
              {d.value}
            </text>
          </g>
        );
      })}

      <polygon
        points={dataPoints}
        fill={color}
        fillOpacity="0.2"
        stroke={color}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {data.map((d, i) => {
        const p = getPoint(d.value, i);
        return (
          <circle
            key={`dot-${i}`}
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill="#ffffff"
            stroke={color}
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
};

// --- メインアプリケーション ---
export default function App() {
  // --- LocalStorageからの読み込み ---
  const [companies, setCompanies] = useState(() => {
    const saved = localStorage.getItem("my_company_research_data");
    return saved ? JSON.parse(saved) : [];
  });

  // データが変更されるたびにLocalStorageに保存
  useEffect(() => {
    localStorage.setItem("my_company_research_data", JSON.stringify(companies));
  }, [companies]);

  // --- Form State ---
  const getInitialScores = (criteriaList) => {
    return criteriaList.reduce((acc, curr) => ({ ...acc, [curr.id]: 3 }), {});
  };

  const initialFormState = {
    id: "",
    name: "",
    industry: "",
    notes: "",
    criteria: JSON.parse(JSON.stringify(DEFAULT_CRITERIA)),
    scores: getInitialScores(DEFAULT_CRITERIA),
    color: "#4F46E5",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const colors = [
    "#4F46E5",
    "#2563EB",
    "#059669",
    "#DC2626",
    "#D97706",
    "#7C3AED",
    "#DB2777",
  ];

  // --- Handlers ---
  const resetForm = () => {
    setFormData(initialFormState);
    setIsEditing(false);
  };

  const handleScoreChange = (id, val) => {
    setFormData((prev) => ({
      ...prev,
      scores: { ...prev.scores, [id]: parseInt(val) },
    }));
  };

  const handleLabelChange = (id, label) => {
    setFormData((prev) => ({
      ...prev,
      criteria: prev.criteria.map((c) => (c.id === id ? { ...c, label } : c)),
    }));
  };

  const addCriterion = () => {
    if (formData.criteria.length >= 8) return;
    const newId = `c-${Date.now()}`;
    setFormData((prev) => ({
      ...prev,
      criteria: [...prev.criteria, { id: newId, label: "新しい項目" }],
      scores: { ...prev.scores, [newId]: 3 },
    }));
  };

  const removeCriterion = (id) => {
    if (formData.criteria.length <= 3) return;
    setFormData((prev) => {
      const newCriteria = prev.criteria.filter((c) => c.id !== id);
      const newScores = { ...prev.scores };
      delete newScores[id];
      return { ...prev, criteria: newCriteria, scores: newScores };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const dataToSave = {
      ...formData,
      id: isEditing ? formData.id : Date.now().toString(),
      updatedAt: Date.now(),
    };

    if (isEditing) {
      setCompanies((prev) =>
        prev.map((c) => (c.id === formData.id ? dataToSave : c)),
      );
    } else {
      setCompanies((prev) => [dataToSave, ...prev]);
    }
    resetForm();
  };

  // データの書き出し（JSON）
  const exportData = () => {
    const blob = new Blob([JSON.stringify(companies, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `company_research_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // データの読み込み
  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          if (confirm("現在のデータを上書きしてインポートしますか？")) {
            setCompanies(imported);
          }
        }
      } catch {
        alert("ファイルの読み込みに失敗しました。");
      }
    };
    reader.readAsText(file);
  };

  const previewChartData = useMemo(() => {
    return formData.criteria.map((c) => ({
      label: c.label,
      value: formData.scores[c.id] || 3,
    }));
  }, [formData.criteria, formData.scores]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight">
                COMPANY ANALYZER
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                企業研究レーダーチャート作成ツール
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">
              <Upload size={14} /> インポート
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              <Download size={14} /> エクスポート
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 lg:sticky lg:top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  {isEditing ? (
                    <Edit2 size={18} className="text-indigo-500" />
                  ) : (
                    <Plus size={18} className="text-indigo-500" />
                  )}
                  {isEditing ? "企業データを編集" : "企業を追加"}
                </h2>
                {isEditing && (
                  <button
                    onClick={resetForm}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                      企業名
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                      placeholder="株式会社〇〇"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                      業界
                    </label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) =>
                        setFormData({ ...formData, industry: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="IT・通信"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Star
                        size={12}
                        className="text-amber-400 fill-amber-400"
                      />{" "}
                      評価項目とスコア
                    </label>
                    <button
                      type="button"
                      onClick={addCriterion}
                      disabled={formData.criteria.length >= 8}
                      className="text-[10px] font-bold text-indigo-600 hover:underline disabled:opacity-30"
                    >
                      + 項目追加
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.criteria.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 bg-slate-50 rounded-2xl border border-slate-100 group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <input
                            type="text"
                            value={c.label}
                            onChange={(e) =>
                              handleLabelChange(c.id, e.target.value)
                            }
                            className="bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 outline-none text-xs font-bold w-32"
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-indigo-600 w-4 text-center">
                              {formData.scores[c.id]}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeCriterion(c.id)}
                              disabled={formData.criteria.length <= 3}
                              className="text-slate-300 hover:text-red-400 disabled:opacity-0 transition-all"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={formData.scores[c.id]}
                          onChange={(e) =>
                            handleScoreChange(c.id, e.target.value)
                          }
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${formData.color === c ? "border-slate-800 scale-110 shadow-lg" : "border-transparent hover:scale-105"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                    メモ
                  </label>
                  <textarea
                    rows="3"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                    placeholder="気になったこと、面接での印象など..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
                >
                  <Save size={18} />{" "}
                  {isEditing ? "変更を保存する" : "リストに登録する"}
                </button>
              </form>
            </div>
          </div>

          {/* List and Preview */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 flex flex-col items-center">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">
                Live Preview
              </span>
              <div className="w-full max-w-[300px] aspect-square">
                <RadarChart data={previewChartData} color={formData.color} />
              </div>
              <div className="mt-6 text-center">
                <h3 className="text-xl font-black">
                  {formData.name || "企業名"}
                </h3>
                <p className="text-sm text-slate-500">
                  {formData.industry || "業界"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="font-black text-xl flex items-center gap-2">
                <Briefcase className="text-slate-400" size={20} />
                比較リスト ({companies.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companies.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl border border-slate-100 p-5 hover:shadow-xl hover:shadow-slate-200 transition-all group relative"
                  >
                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() =>
                          setFormData(item) ||
                          setIsEditing(true) ||
                          window.scrollTo(0, 0)
                        }
                        className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() =>
                          confirm("削除しますか？") &&
                          setCompanies(
                            companies.filter((c) => c.id !== item.id),
                          )
                        }
                        className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-black text-lg line-clamp-1 pr-12">
                        {item.name}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                        {item.industry || "未設定"}
                      </span>
                    </div>

                    <div className="w-full aspect-square max-w-[180px] mx-auto mb-4 pointer-events-none opacity-90">
                      <RadarChart
                        data={item.criteria.map((c) => ({
                          label: c.label,
                          value: item.scores[c.id] || 3,
                        }))}
                        color={item.color}
                        size={180}
                      />
                    </div>

                    {item.notes && (
                      <p className="text-xs text-slate-500 line-clamp-2 bg-slate-50 p-2 rounded-xl italic">
                        "{item.notes}"
                      </p>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold text-slate-400">
                      <span>{item.criteria.length}項目</span>
                      <span>
                        合計:{" "}
                        {Object.values(item.scores).reduce((a, b) => a + b, 0)}{" "}
                        pt
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {companies.length === 0 && (
                <div className="text-center py-20 bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200">
                  <RefreshCcw className="mx-auto text-slate-300 mb-2 animate-spin-slow" />
                  <p className="text-slate-400 font-bold text-sm">
                    企業を登録して比較を始めましょう
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
