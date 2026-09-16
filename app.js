const $ = (id) => document.getElementById(id);

const ids = [
  "currentWage", "hoursWeek", "employees", "stateFloor", "customRegion",
  "taxRate", "employerPayroll", "workerPayroll", "incomeTax",
  "response", "altSupplement", "moveCost"
];

const defaults = {
  currentWage: 15,
  hoursWeek: 40,
  employees: 500,
  stateFloor: 22,
  region: "5",
  customRegion: 5,
  taxRate: 125,
  employerPayroll: 7.65,
  workerPayroll: 7.65,
  incomeTax: 10,
  response: 50,
  altSupplement: 0,
  moveCost: 5000
};

function n(id) {
  const value = Number($(id).value);
  return Number.isFinite(value) ? value : 0;
}

function money(value, digits = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  }).format(value || 0);
}

function compactMoney(value) {
  if (Math.abs(value) >= 1_000_000) return `${money(value / 1_000_000, 2)}M`;
  if (Math.abs(value) >= 1_000) return `${money(value / 1_000, 1)}K`;
  return money(value, 0);
}

function pct(value) {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value)}%`;
}

function regionSupplement() {
  return $("region").value === "custom" ? n("customRegion") : Number($("region").value);
}

function annualTaxAtSupplement(supplement, inputs) {
  const benchmark = inputs.floor * (1 + supplement / 100);
  const gap = Math.max(benchmark - inputs.wage, 0);
  return gap * inputs.annualHours * inputs.people * inputs.multiplier;
}

function calculate() {
  const wage = Math.max(n("currentWage"), 0);
  const weeklyHours = Math.max(n("hoursWeek"), 0);
  const people = Math.max(Math.round(n("employees")), 0);
  const floor = Math.max(n("stateFloor"), 0);
  const supplement = Math.max(regionSupplement(), 0);
  const multiplier = Math.max(n("taxRate"), 0) / 100;
  const employerPayroll = Math.max(n("employerPayroll"), 0) / 100;
  const workerTax = Math.min((Math.max(n("workerPayroll"), 0) + Math.max(n("incomeTax"), 0)) / 100, 1);
  const annualHours = weeklyHours * 52;
  const benchmark = floor * (1 + supplement / 100);
  const hourlyGap = Math.max(benchmark - wage, 0);
  const annualGapWorker = hourlyGap * annualHours;
  const grossRaises = annualGapWorker * people;
  const taxTotal = grossRaises * multiplier;
  const raiseCost = grossRaises * (1 + employerPayroll);
  const takeHome = grossRaises * (1 - workerTax);
  const premium = taxTotal - raiseCost;

  $("benchmark").textContent = `${money(benchmark, 2)}/hr`;
  $("shortfall").textContent = money(hourlyGap, 2);
  $("taxTotal").textContent = compactMoney(taxTotal);
  $("taxWorker").textContent = `${money(annualGapWorker * multiplier, 0)} per worker / year`;
  $("raiseCost").textContent = compactMoney(raiseCost);
  $("takeHomeGain").textContent = compactMoney(takeHome);
  $("takeHomeWorker").textContent = `${money(people ? takeHome / people : 0, 0)} per worker / year`;
  $("taxPremium").textContent = `${premium < 0 ? "−" : ""}${compactMoney(Math.abs(premium))}`;
  $("premiumPercent").textContent = raiseCost ? `${pct(Math.abs(premium) / raiseCost * 100)} ${premium >= 0 ? "above" : "below"} the raise cost` : "No wage gap";

  const maxBar = Math.max(taxTotal, raiseCost, 1);
  $("raiseBar").style.width = `${raiseCost / maxBar * 100}%`;
  $("taxBar").style.width = `${taxTotal / maxBar * 100}%`;
  $("barRaiseLabel").textContent = compactMoney(raiseCost);
  $("barTaxLabel").textContent = compactMoney(taxTotal);

  if (!hourlyGap) {
    $("choiceBadge").textContent = "No tax is due";
    $("choiceExplanation").textContent = "The current wage meets or exceeds the selected regional benchmark.";
  } else if (taxTotal > raiseCost) {
    $("choiceBadge").textContent = "Raising wages costs less";
    $("choiceExplanation").textContent = `At these assumptions, paying the tax costs ${compactMoney(premium)} more each year than closing the wage gap, including employer payroll tax.`;
  } else {
    $("choiceBadge").textContent = "The tax costs less";
    $("choiceExplanation").textContent = `At these assumptions, the multiplier is too low to make a full wage increase the cheaper employer option. The tax is ${compactMoney(Math.abs(premium))} less.`;
  }

  const response = Math.min(Math.max(n("response"), 0), 100) / 100;
  const partialHourlyRaise = hourlyGap * response;
  const partialGross = grossRaises * response;
  const remainingTax = grossRaises * (1 - response) * multiplier;
  const partialTakeHome = partialGross * (1 - workerTax);
  $("responseOutput").textContent = pct(response * 100);
  $("partialWage").textContent = money(wage + partialHourlyRaise, 2);
  $("partialRaises").textContent = compactMoney(partialGross);
  $("partialTakeHome").textContent = compactMoney(partialTakeHome);
  $("partialRevenue").textContent = compactMoney(remainingTax);
  $("responseNarrative").textContent = response === 1
    ? `The employer closes the entire ${money(hourlyGap, 2)} hourly gap. Workers receive an estimated ${compactMoney(partialTakeHome)} after payroll and income taxes, and the wage-shortfall tax falls to zero.`
    : response === 0
      ? `The employer leaves wages unchanged. Workers receive no raise, and Maryland collects an estimated ${compactMoney(remainingTax)} in excise-tax revenue.`
      : `Closing ${pct(response * 100)} of the gap raises pay by ${money(partialHourlyRaise, 2)} per hour. Workers retain an estimated ${compactMoney(partialTakeHome)}, while Maryland collects ${compactMoney(remainingTax)} on the remaining shortfall.`;

  const modelInputs = { floor, wage, annualHours, people, multiplier };
  const currentTax = annualTaxAtSupplement(supplement, modelInputs);
  const altSupplement = Math.max(n("altSupplement"), 0);
  const altTax = annualTaxAtSupplement(altSupplement, modelInputs);
  const savings = Math.max(currentTax - altTax, 0);
  const totalMoveCost = Math.max(n("moveCost"), 0) * people;
  const paybackYears = savings > 0 ? totalMoveCost / savings : Infinity;
  $("currentRegionTax").textContent = compactMoney(currentTax);
  $("altRegionTax").textContent = compactMoney(altTax);
  $("relocationSavings").textContent = compactMoney(savings);
  $("payback").textContent = Number.isFinite(paybackYears) ? `${paybackYears.toFixed(1)} years` : "No savings";

  if (altTax >= currentTax) {
    $("relocationExplanation").textContent = "The alternative region does not reduce the tax under these assumptions. A mailing-address change alone would never alter liability because the sourcing rule follows the physical worksite.";
  } else {
    $("relocationExplanation").textContent = `Moving the actual jobs would save ${compactMoney(savings)} per year before other operating effects. At ${money(n("moveCost"), 0)} per job in one-time moving costs, the simplified payback period is ${paybackYears.toFixed(1)} years. This identifies—not resolves—the proposal's geographic-competition risk.`;
  }
}

function reset() {
  Object.entries(defaults).forEach(([id, value]) => {
    if ($(id)) $(id).value = value;
  });
  $("customRegionRow").hidden = true;
  calculate();
}

ids.forEach((id) => $(id).addEventListener("input", calculate));
$("region").addEventListener("change", () => {
  $("customRegionRow").hidden = $("region").value !== "custom";
  calculate();
});
$("reset").addEventListener("click", reset);
$("resetTop").addEventListener("click", reset);

calculate();
