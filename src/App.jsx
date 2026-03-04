import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
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

const STORAGE_KEY = "pro_company_research_data";
const MAX_CRITERIA = 8;
const MIN_CRITERIA = 3;
const THEME_COLORS = [
  "#4F46E5",
  "#2563EB",
  "#059669",
  "#DC2626",
  "#D97706",
  "#7C3AED",
  "#DB2777",
  "#0F172A",
];

const DEFAULT_CRITERIA = [
  { id: "c1", label: "給与・待遇" },
  { id: "c2", label: "ワークライフバランス" },
  { id: "c3", label: "成長環境" },
  { id: "c4", label: "安定性" },
  { id: "c5", label: "企業文化" },
  { id: "c6", label: "将来性" },
];

const generateId = () =>
  `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const validateImportData = (data) => {
  if (!Array.isArray(data)) return false;
  return data.every(
    (item) =>
      item.id &&
      typeof item.name === "string" &&
      Array.isArray(item.criteria) &&
      typeof item.scores === "object",
  );
};

// ==========================================
// [Component] レーダーチャート (SVG)
// ==========================================
const RadarChart = memo(({ data, max = 5, color = "#4F46E5" }) => {
  const viewBoxSize = 300;
  const center = viewBoxSize / 2;
  const radius = (viewBoxSize / 2) * 0.7;
  const angleStep = (Math.PI * 2) / Math.max(data.length, 3);

  const getPoint = useCallback(
    (val, index) => {
      const r = (val / max) * radius;
      const angle = index * angleStep - Math.PI / 2;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      };
    },
    [max, radius, angleStep, center],
  );

  const gridLevels = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      className="overflow-visible font-sans drop-shadow-sm"
    >
      {gridLevels.map((level) => {
        const points = data
          .map((_, i) => `${getPoint(level, i).x},${getPoint(level, i).y}`)
          .join(" ");
        return (
          <polygon
            key={`grid-${level}`}
            points={points}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="1.5"
            strokeDasharray={level === max ? "none" : "2,2"}
          />
        );
      })}

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
              stroke="#E2E8F0"
              strokeWidth="1"
            />
            <text
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor={textAnchor}
              dy={dy}
              fill="#475569"
              className="font-bold text-[11px] tracking-wide"
            >
              {d.label}
            </text>
            <text
              x={labelPoint.x}
              y={labelPoint.y + (labelPoint.y > center ? 14 : -14)}
              textAnchor={textAnchor}
              dy={dy}
              fill={color}
              className="font-black text-[10px]"
            >
              {d.value}
            </text>
          </g>
        );
      })}

      <polygon
        points={data
          .map((d, i) => `${getPoint(d.value, i).x},${getPoint(d.value, i).y}`)
          .join(" ")}
        fill={color}
        fillOpacity="0.15"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {data.map((d, i) => (
        <circle
          key={`dot-${i}`}
          cx={getPoint(d.value, i).x}
          cy={getPoint(d.value, i).y}
          r="4"
          fill="#ffffff"
          stroke={color}
          strokeWidth="2"
        />
      ))}
    </svg>
  );
});

// ==========================================
// [Component] 登録済み企業カード
// ==========================================
const CompanyCard = memo(({ company, onEdit, onDelete }) => {
  const chartData = useMemo(
    () =>
      company.criteria.map((c) => ({
        label: c.label,
        value: company.scores[c.id] || 3,
      })),
    [company.criteria, company.scores],
  );
  const totalScore = useMemo(
    () => Object.values(company.scores).reduce((a, b) => a + b, 0),
    [company.scores],
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group relative flex flex-col h-full">
      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100 z-10">
        <button
          onClick={() => onEdit(company)}
          className="p-2 bg-white/90 backdrop-blur shadow-sm text-slate-500 hover:text-indigo-600 rounded-xl transition-colors"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={() => onDelete(company.id)}
          className="p-2 bg-white/90 backdrop-blur shadow-sm text-slate-500 hover:text-rose-500 rounded-xl transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="mb-4 pr-16">
        <h4 className="font-black text-lg text-slate-800 leading-tight break-words">
          {company.name}
        </h4>
        {company.industry && (
          <span className="inline-block mt-1.5 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
            {company.industry}
          </span>
        )}
      </div>
      <div className="w-full aspect-square max-w-[200px] mx-auto mb-4 pointer-events-none">
        <RadarChart data={chartData} color={company.color} />
      </div>
      <div className="mt-auto space-y-3">
        {company.notes && (
          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl italic line-clamp-2 border border-slate-100">
            {company.notes}
          </p>
        )}
        <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
          <span>{company.criteria.length} 項目</span>
          <span className="text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
            Total: {totalScore} pt
          </span>
        </div>
      </div>
    </div>
  );
});

// ==========================================
// メインアプリケーション
// ==========================================
export default function App() {
  const [companies, setCompanies] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
  }, [companies]);

  const initialFormState = useMemo(
    () => ({
      id: "",
      name: "",
      industry: "",
      notes: "",
      criteria: JSON.parse(JSON.stringify(DEFAULT_CRITERIA)),
      scores: DEFAULT_CRITERIA.reduce(
        (acc, curr) => ({ ...acc, [curr.id]: 3 }),
        {},
      ),
      color: THEME_COLORS[0],
    }),
    [],
  );

  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);

  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    setIsEditing(false);
  }, [initialFormState]);
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);
  const handleScoreChange = useCallback((id, val) => {
    setFormData((prev) => ({
      ...prev,
      scores: { ...prev.scores, [id]: parseInt(val, 10) },
    }));
  }, []);
  const handleLabelChange = useCallback((id, label) => {
    setFormData((prev) => ({
      ...prev,
      criteria: prev.criteria.map((c) => (c.id === id ? { ...c, label } : c)),
    }));
  }, []);

  const addCriterion = useCallback(() => {
    setFormData((prev) => {
      if (prev.criteria.length >= MAX_CRITERIA) return prev;
      const newId = generateId();
      return {
        ...prev,
        criteria: [...prev.criteria, { id: newId, label: "新しい項目" }],
        scores: { ...prev.scores, [newId]: 3 },
      };
    });
  }, []);

  const removeCriterion = useCallback((id) => {
    setFormData((prev) => {
      if (prev.criteria.length <= MIN_CRITERIA) return prev;
      const newScores = { ...prev.scores };
      delete newScores[id];
      return {
        ...prev,
        criteria: prev.criteria.filter((c) => c.id !== id),
        scores: newScores,
      };
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    const cleanedData = {
      ...formData,
      criteria: formData.criteria.map((c, i) => ({
        ...c,
        label: c.label.trim() || `項目 ${i + 1}`,
      })),
      updatedAt: Date.now(),
    };
    if (isEditing) {
      setCompanies((prev) =>
        prev.map((c) => (c.id === formData.id ? cleanedData : c)),
      );
    } else {
      setCompanies((prev) => [{ ...cleanedData, id: generateId() }, ...prev]);
    }
    resetForm();
  };

  const handleEdit = useCallback((company) => {
    setFormData(company);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const handleDelete = useCallback(
    (id) => {
      if (
        window.confirm(
          "この企業データを削除しますか？\nこの操作は元に戻せません。",
        )
      ) {
        setCompanies((prev) => prev.filter((c) => c.id !== id));
        if (formData.id === id) resetForm();
      }
    },
    [formData.id, resetForm],
  );

  const handleExport = useCallback(() => {
    if (companies.length === 0)
      return alert("エクスポートするデータがありません。");
    const blob = new Blob([JSON.stringify(companies, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `company_research.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [companies]);

  const handleImport = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (!validateImportData(imported))
            throw new Error("データ形式が不正です");
          if (window.confirm(`データを上書きしますか？`)) {
            setCompanies(imported);
            resetForm();
          }
        } catch (err) {
          alert(`インポート失敗: ${err.message}`);
        } finally {
          e.target.value = "";
        }
      };
      reader.readAsText(file);
    },
    [resetForm],
  );

  const previewChartData = useMemo(
    () =>
      formData.criteria.map((c) => ({
        label: c.label || "未入力",
        value: formData.scores[c.id] || 3,
      })),
    [formData.criteria, formData.scores],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-md">
              <Building2 size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-800">
                COMPANY ANALYZER
              </h1>
              <p className="text-xs font-bold text-slate-400 mt-0.5">
                企業研究レーダー可視化ツール
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <label className="flex-1 md:flex-none cursor-pointer flex justify-center items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">
              <Upload size={16} /> インポート
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="sr-only"
              />
            </label>
            <button
              onClick={handleExport}
              disabled={companies.length === 0}
              className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 disabled:opacity-50"
            >
              <Download size={16} /> エクスポート
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 lg:p-8 lg:sticky lg:top-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-black text-xl text-slate-800 flex items-center gap-2">
                  {isEditing ? (
                    <Edit2 size={20} className="text-indigo-600" />
                  ) : (
                    <Plus size={20} className="text-indigo-600" />
                  )}
                  {isEditing ? "データを編集" : "新規データ作成"}
                </h2>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase mb-2 block">
                      企業名 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-bold"
                      placeholder="株式会社〇〇"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase mb-2 block">
                      業界
                    </label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) =>
                        handleInputChange("industry", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-medium"
                      placeholder="例: IT・通信"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-black text-slate-400 uppercase flex items-center gap-1.5">
                      <Star
                        size={14}
                        className="text-amber-400 fill-amber-400"
                      />{" "}
                      評価項目とスコア
                    </label>
                    <button
                      type="button"
                      onClick={addCriterion}
                      disabled={formData.criteria.length >= MAX_CRITERIA}
                      className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg disabled:opacity-40"
                    >
                      + 項目追加
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.criteria.map((c) => (
                      <div
                        key={c.id}
                        className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <input
                            type="text"
                            value={c.label}
                            onChange={(e) =>
                              handleLabelChange(c.id, e.target.value)
                            }
                            className="bg-transparent border-b-2 border-dotted border-slate-300 focus:border-indigo-500 outline-none text-sm font-bold w-3/5 pb-0.5"
                          />
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-indigo-600 bg-white border border-slate-100 px-3 py-0.5 rounded-md w-10 text-center">
                              {formData.scores[c.id]}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeCriterion(c.id)}
                              disabled={
                                formData.criteria.length <= MIN_CRITERIA
                              }
                              className="text-slate-400 hover:text-rose-500 disabled:opacity-20"
                            >
                              <X size={16} />
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
                          className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-xs font-black text-slate-400 uppercase mb-3 block">
                    テーマカラー
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {THEME_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleInputChange("color", c)}
                        className={`w-8 h-8 rounded-full border-2 ${formData.color === c ? "border-slate-800 scale-110 shadow-md" : "border-transparent hover:scale-110"}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-xs font-black text-slate-400 uppercase mb-2 block">
                    メモ・所感
                  </label>
                  <textarea
                    rows="3"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none text-sm resize-none"
                    placeholder="面接の雰囲気など..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 mt-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 flex items-center justify-center gap-2 shadow-lg"
                >
                  <Save size={18} />{" "}
                  {isEditing ? "変更を保存する" : "企業リストに追加"}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6 lg:space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 flex flex-col items-center shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Live Preview
                </span>
              </div>
              <div className="w-full max-w-[320px] aspect-square">
                <RadarChart data={previewChartData} color={formData.color} />
              </div>
              <div className="mt-8 text-center max-w-sm w-full">
                <h3 className="text-xl font-black text-slate-800 truncate">
                  {formData.name || "企業名未入力"}
                </h3>
                <p className="text-sm font-bold text-slate-500 mt-1">
                  {formData.industry || "業界未入力"}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <h2 className="font-black text-xl text-slate-800 flex items-center gap-3">
                  <Briefcase className="text-slate-400" size={24} /> 比較リスト
                </h2>
                <span className="bg-slate-100 text-slate-600 text-sm font-bold px-3 py-1 rounded-full">
                  {companies.length}社
                </span>
              </div>
              {companies.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center">
                  <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <RefreshCcw
                      className="text-slate-300 animate-spin-slow"
                      size={32}
                    />
                  </div>
                  <h3 className="text-slate-700 font-bold text-lg mb-1">
                    まだデータがありません
                  </h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {companies.map((item) => (
                    <CompanyCard
                      key={item.id}
                      company={item}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
