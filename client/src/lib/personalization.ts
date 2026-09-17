export type RiskInput = {
  age: number;
  bmi: number;
  cycleLength: number;
  regularity: string;
  hirsutism: number;
  acne: number;
  weightGain: number;
  hairLoss: number;
  skinDarkening: number;
  fastFood: number;
  exercise: number;
  familyHistory: number;
  folliclesLeft: number;
  folliclesRight: number;
};

export type RiskResult = {
  score: number;
  label: "High" | "Moderate" | "Low";
  contributions: { label: string; value: number; tone: string }[];
};

export function calculateRisk(input: RiskInput): RiskResult {
  const score = Math.min(94, Math.max(8,
    26 +
    (input.age >= 30 ? 2 : 0) +
    (input.regularity === "irregular" ? 17 : input.regularity === "somewhat-irregular" ? 9 : 0) +
    Math.max(0, input.cycleLength - 28) * 0.8 +
    input.hirsutism * 4.5 + input.acne * 3.2 + input.weightGain * 3.5 + input.hairLoss * 2.5 +
    input.skinDarkening * 2.5 + input.fastFood * 1.5 - input.exercise * 1.2 + input.familyHistory * 12 +
    Math.max(0, input.folliclesLeft + input.folliclesRight - 16) * 0.7 +
    (input.bmi > 30 ? 7 : input.bmi > 25 ? 3 : 0)
  ));
  const label = score >= 68 ? "High" : score >= 42 ? "Moderate" : "Low";
  const contributions = [
    { label: "Cycle regularity", value: input.regularity === "irregular" ? 26 : input.regularity === "somewhat-irregular" ? 18 : 5, tone: "berry" },
    { label: "Follicle count", value: Math.round(Math.max(6, input.folliclesLeft + input.folliclesRight - 11) * 1.35), tone: "gold" },
    { label: "Hirsutism", value: input.hirsutism * 8, tone: "rose" },
    { label: "Acne", value: input.acne * 7, tone: "rose" },
    { label: "Weight gain", value: input.weightGain * 6, tone: "gold" },
    { label: "Cycle length", value: Math.round(Math.max(4, input.cycleLength - 24) * 1.6), tone: "berry" },
    { label: "Family history", value: input.familyHistory ? 15 : 0, tone: "gold" },
    { label: "BMI", value: input.bmi > 30 ? 12 : input.bmi > 25 ? 5 : 1, tone: "berry" },
  ].sort((a, b) => b.value - a.value);
  return { score: Math.round(score), label, contributions: contributions.slice(0, 4) };
}
