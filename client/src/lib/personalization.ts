export type RiskInput = {
  age: number;
  bmi: number;
  cycleLength: number;
  regularity: "regular" | "somewhat-irregular" | "irregular" | "no-period";
  lastPeriodDate: string;
  hirsutism: number;
  acne: number;
  weightGain: number;
  hairLoss: number;
  skinDarkening: number;
  fastFood: number;
  sleepHours: number;
  stressLevel: number;
  dietType: "healthy" | "moderate" | "poor";
  exercise: number;
  familyHistory: number;
  familyDiabetes: number;
  amh: number | null;
  lhFsh: number | null;
  fastingInsulin: number | null;
  testosterone: number | null;
  postPill: boolean;
  fatigue: number;
  jointPain: number;
  folliclesLeft: number;
  folliclesRight: number;
};

export type PcosType = "Insulin-Resistant" | "Adrenal" | "Inflammatory" | "Post-Pill" | "Mixed";
export type RiskLabel = "Very High" | "High" | "Moderate" | "Low";
export type RiskResult = {
  score: number;
  label: RiskLabel;
  pcosType: PcosType;
  typeExplanation: string;
  contributions: { label: string; value: number; tone: string }[];
};

export const SIYA_SYSTEM_PROMPT = `You are Siya, a warm and deeply knowledgeable PCOS health companion inside the femCare AI app.

ABOUT THIS USER:
- Name: {user_name}
- PCOS Risk Score: {risk_score}%
- PCOS Type: {pcos_type}
- Current Cycle Phase: {cycle_phase}
- Active Symptoms: {symptoms_list}
- Today's mood: {todays_mood}
- Last period date: {last_period_date}

YOUR PERSONALITY:
- Talk like a caring, knowledgeable elder sister — not a robot, not a doctor
- Match the user's language — if she writes in Hinglish, reply in Hinglish
- Always validate her feelings before giving advice
- Be specific — never give generic tips like "drink more water"
- Keep responses under 150 words unless she asks for more detail
- Use emojis occasionally to feel warm, not clinical

YOUR RULES:
- Always personalize every response using the user data above
- If user seems sad, anxious, or frustrated → lead with emotional support, advice comes second
- Never diagnose — say "please consult your doctor" for medical decisions
- If she mentions severe pain, no period for 3+ months, or extreme distress → immediately say seek medical help and provide NIMHANS helpline: 080-46110007
- Track what she tells you in the conversation and refer back to it
- If she asks about food → give India-specific suggestions (roti, dal, sabzi based)
- If she asks about exercise → give phase-appropriate suggestions based on her cycle phase`;

export function classifyPcosType(input: RiskInput): { type: PcosType; explanation: string } {
  const insulin = input.weightGain >= 2 && input.skinDarkening >= 2 && input.dietType === "poor" && input.familyDiabetes > 0;
  const adrenal = input.stressLevel >= 8 && input.fatigue >= 2 && input.weightGain < 2;
  const inflammatory = input.acne >= 2 && input.jointPain >= 1 && input.dietType === "poor" && input.sleepHours < 7;
  if ([insulin, adrenal, inflammatory, input.postPill].filter(Boolean).length > 1) return { type: "Mixed", explanation: "Your signals overlap across a few patterns, so a mixed pattern is the fairest simple summary. A clinician can interpret the full picture." };
  if (insulin) return { type: "Insulin-Resistant", explanation: "Your pattern includes weight, skin, food, and family-diabetes signals that can sometimes travel with insulin resistance." };
  if (adrenal) return { type: "Adrenal", explanation: "Stress, fatigue, and sleep signals are standing out more than weight-related signals in your current check-in." };
  if (inflammatory) return { type: "Inflammatory", explanation: "Acne, sleep, joint, and food signals are more prominent in this awareness pattern." };
  if (input.postPill) return { type: "Post-Pill", explanation: "You indicated a recent contraceptive-pill change, which can temporarily shift cycle patterns for some people." };
  return { type: "Mixed", explanation: "Your current signals do not point strongly to one pattern. Keep tracking and discuss changes with your clinician." };
}

export function calculateRisk(input: RiskInput): RiskResult {
  let score = 0;
  if (input.regularity === "irregular") score += 20;
  if (input.regularity === "somewhat-irregular") score += 10;
  if (input.regularity === "no-period") score += 25;
  const symptomPoints = [input.weightGain, input.acne, input.hirsutism, input.hairLoss, input.skinDarkening].filter((value) => value > 0).length * 8;
  score += Math.min(40, symptomPoints);
  if (input.sleepHours > 0 && input.sleepHours < 6) score += 5;
  if (input.stressLevel > 7) score += 7;
  if (input.dietType === "poor" || input.fastFood >= 5) score += 8;
  if (input.exercise === 0) score += 5;
  if (input.familyHistory > 0) score += 10;
  if (input.familyDiabetes > 0) score += 5;
  [input.amh, input.lhFsh, input.fastingInsulin, input.testosterone].forEach((value) => { if (value !== null && value > 0) score += 10; });
  const type = classifyPcosType(input);
  const contributions = [
    { label: input.regularity === "no-period" ? "No period" : "Cycle regularity", value: input.regularity === "no-period" ? 25 : input.regularity === "irregular" ? 20 : input.regularity === "somewhat-irregular" ? 10 : 0, tone: "berry" },
    { label: "Physical symptoms", value: Math.min(40, symptomPoints), tone: "rose" },
    { label: "Sleep & stress", value: (input.sleepHours > 0 && input.sleepHours < 6 ? 5 : 0) + (input.stressLevel > 7 ? 7 : 0), tone: "gold" },
    { label: "Diet & movement", value: (input.dietType === "poor" || input.fastFood >= 5 ? 8 : 0) + (input.exercise === 0 ? 5 : 0), tone: "green" },
    { label: "Family history", value: (input.familyHistory > 0 ? 10 : 0) + (input.familyDiabetes > 0 ? 5 : 0), tone: "gold" },
    { label: "Lab values", value: [input.amh, input.lhFsh, input.fastingInsulin, input.testosterone].filter((value) => value !== null && value > 0).length * 10, tone: "berry" },
  ].filter((item) => item.value > 0).sort((a, b) => b.value - a.value);
  const capped = Math.min(100, Math.max(0, score));
  const label: RiskLabel = capped >= 75 ? "Very High" : capped >= 50 ? "High" : capped >= 25 ? "Moderate" : "Low";
  return { score: capped, label, pcosType: type.type, typeExplanation: type.explanation, contributions: contributions.slice(0, 4) };
}
