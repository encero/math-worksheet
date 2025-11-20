"use client";

import { useEffect, useState } from "react";

type Operation = "addition" | "subtraction" | "mixed";

type Problem = {
  left: number;
  right: number;
  operator: "+" | "-";
};

const DEFAULT_PROBLEMS = 40;
const DEFAULT_MAX_NUMBER = 20;
const STORAGE_KEY = "mathWorksheetSettings_v1";

type Settings = {
  operation: Operation;
  maxNumber: number;
  problemCount: number;
  limitResult: boolean;
};
let cachedStoredSettings: Settings | null | undefined;

function loadStoredSettings(): Settings | null {
  if (cachedStoredSettings !== undefined) {
    return cachedStoredSettings;
  }

  if (typeof window === "undefined") {
    cachedStoredSettings = null;
    return cachedStoredSettings;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cachedStoredSettings = null;
      return cachedStoredSettings;
    }

    const parsed = JSON.parse(raw) as Partial<Settings>;

    let operation: Operation = "mixed";
    if (
      parsed.operation === "addition" ||
      parsed.operation === "subtraction" ||
      parsed.operation === "mixed"
    ) {
      operation = parsed.operation;
    }

    let problemCount = DEFAULT_PROBLEMS;
    if (typeof parsed.problemCount === "number") {
      problemCount = Math.max(1, Math.min(80, Math.floor(parsed.problemCount)));
    }

    let maxNumber = DEFAULT_MAX_NUMBER;
    if (typeof parsed.maxNumber === "number") {
      maxNumber = Math.max(5, Math.min(50, Math.floor(parsed.maxNumber)));
    }

    const limitResult =
      typeof parsed.limitResult === "boolean" ? parsed.limitResult : true;

    cachedStoredSettings = {
      operation,
      maxNumber,
      problemCount,
      limitResult,
    };

    return cachedStoredSettings;
  } catch {
    cachedStoredSettings = null;
    return cachedStoredSettings;
  }
}





function randomInt(maxInclusive: number) {
  return Math.floor(Math.random() * (maxInclusive + 1));
}

function generateSingleProblem(
  maxNumber: number,
  operation: Operation,
  limitResult: boolean
): Problem {
  let op: Operation = operation;
  if (operation === "mixed") {
    op = Math.random() < 0.5 ? "addition" : "subtraction";
  }

  let left = 0;
  let right = 0;

  if (op === "addition") {
    if (limitResult) {
      left = randomInt(maxNumber);
      right = randomInt(maxNumber - left);
    } else {
      left = randomInt(maxNumber);
      right = randomInt(maxNumber);
    }
  } else {
    left = randomInt(maxNumber);
    right = randomInt(maxNumber);
    if (left < right) {
      [left, right] = [right, left];
    }
  }

  return {
    left,
    right,
    operator: op === "addition" ? "+" : "-",
  };
}

function generateProblems(
  count: number,
  maxNumber: number,
  operation: Operation,
  limitResult: boolean
): Problem[] {
  const safeCount = Math.max(1, Math.min(80, Math.floor(count)));
  const safeMax = Math.max(5, Math.min(50, Math.floor(maxNumber)));

  return Array.from({ length: safeCount }, () =>
    generateSingleProblem(safeMax, operation, limitResult)
  );
}

export default function HomePage() {
  const [operation, setOperation] = useState<Operation>(() => {
    const stored = loadStoredSettings();
    return stored?.operation ?? "mixed";
  });

  const [maxNumber, setMaxNumber] = useState(() => {
    const stored = loadStoredSettings();
    return stored?.maxNumber ?? DEFAULT_MAX_NUMBER;
  });

  const [problemCount, setProblemCount] = useState(() => {
    const stored = loadStoredSettings();
    return stored?.problemCount ?? DEFAULT_PROBLEMS;
  });

  const [limitResult, setLimitResult] = useState(() => {
    const stored = loadStoredSettings();
    return stored?.limitResult ?? true;
  });

  const [problems, setProblems] = useState<Problem[]>(() => {
    const stored = loadStoredSettings();
    const op = stored?.operation ?? "mixed";
    const max = stored?.maxNumber ?? DEFAULT_MAX_NUMBER;
    const count = stored?.problemCount ?? DEFAULT_PROBLEMS;
    const limit = stored?.limitResult ?? true;
    return generateProblems(count, max, op, limit);
  });

  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (hasHydrated) return;
    if (typeof window === "undefined") return;

    const id = window.requestAnimationFrame(() => {
      setHasHydrated(true);
    });

    return () => window.cancelAnimationFrame(id);
  }, [hasHydrated]);


  // Persist settings whenever they change
  useEffect(() => {
    if (typeof window === "undefined") return;

    const settings: Settings = {
      operation,
      maxNumber,
      problemCount,
      limitResult,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [operation, maxNumber, problemCount, limitResult]);

  const handleGenerate = () => {
    setProblems(
      generateProblems(problemCount, maxNumber, operation, limitResult)
    );
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleReset = () => {
    const op: Operation = "mixed";
    const max = DEFAULT_MAX_NUMBER;
    const count = DEFAULT_PROBLEMS;
    const limit = true;

    setOperation(op);
    setMaxNumber(max);
    setProblemCount(count);
    setLimitResult(limit);
    setProblems(generateProblems(count, max, op, limit));

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  if (!hasHydrated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6 print-page">
        <div className="no-print mb-6 flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Math Practice Worksheet
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Generate addition and subtraction problems for first graders, then
              print on A4.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex flex-col text-sm font-medium text-gray-700">
              Number of problems
              <input
                type="number"
                className="mt-1 rounded border border-gray-300 px-2 py-1 text-base"
                min={10}
                max={80}
                step={5}
                value={problemCount}
                onChange={(e) =>
                  setProblemCount(
                    Number.isNaN(Number(e.target.value))
                      ? DEFAULT_PROBLEMS
                      : Number(e.target.value)
                  )
                }
              />
            </label>

            <label className="flex flex-col text-sm font-medium text-gray-700">
              Largest number
              <input
                type="number"
                className="mt-1 rounded border border-gray-300 px-2 py-1 text-base"
                min={5}
                max={50}
                value={maxNumber}
                onChange={(e) =>
                  setMaxNumber(
                    Number.isNaN(Number(e.target.value))
                      ? DEFAULT_MAX_NUMBER
                      : Number(e.target.value)
                  )
                }
              />
            </label>

            <fieldset className="flex flex-col text-sm font-medium text-gray-700">
              <span>Operations</span>
              <div className="mt-1 flex flex-col gap-1 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="operation"
                    value="addition"
                    checked={operation === "addition"}
                    onChange={() => setOperation("addition")}
                  />
                  <span>Addition only</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="operation"
                    value="subtraction"
                    checked={operation === "subtraction"}
                    onChange={() => setOperation("subtraction")}
                  />
                  <span>Subtraction only</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="operation"
                    value="mixed"
                    checked={operation === "mixed"}
                    onChange={() => setOperation("mixed")}
                  />
                  <span>Mixed</span>
                </label>
                <label className="inline-flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={limitResult}
                    onChange={(e) => setLimitResult(e.target.checked)}
                  />
                  <span>Limit result to largest number</span>
                </label>
              </div>
            </fieldset>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Generate new worksheet
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100"
            >
              Print
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              Reset settings
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-semibold text-gray-900">
            Name: ____________________
          </div>
          <div className="text-lg font-semibold text-gray-900">
            Date: ____________________
          </div>
        </div>

        <div className="problem-grid grid gap-x-8 gap-y-4 text-2xl sm:grid-cols-3 md:grid-cols-4">
          {problems.map((p, index) => (
            <div
              key={`${p.left}-${p.operator}-${p.right}-${index}`}
              className="flex items-center border-b border-gray-300 pb-1"
            >
              <span className="mr-2">
                {p.left} {p.operator} {p.right} =
              </span>
              <span className="ml-2 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
