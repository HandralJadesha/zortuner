const MATERIAL_DENSITIES = {
  PLA: 1.24,
  ABS: 1.04,
  Resin: 1.15,
  TPU: 1.21,
  PETG: 1.27
};

const MATERIAL_FILAMENT_COSTS = {
  PLA: 2.0,   // ₹2 per gram
  ABS: 2.5,   // ₹2.5 per gram
  Resin: 6.0,  // ₹6 per gram
  TPU: 4.0,   // ₹4 per gram
  PETG: 3.0   // ₹3 per gram
};

const FINISH_FEES = {
  Raw: 0,
  Sanded: 150,
  Painted: 450
};

export const calculateQuote = (input) => {
  const { volume, material, finish, infill = 20 } = input;

  const density = MATERIAL_DENSITIES[material] || 1.24;
  const costPerGram = MATERIAL_FILAMENT_COSTS[material] || 2.0;
  const finishFee = FINISH_FEES[finish] || 0;

  const infillRatio = infill / 100;
  const shellRatio = 0.25;
  const effectiveVolumeFactor = shellRatio + (1 - shellRatio) * infillRatio;
  const effectiveVolume = volume * effectiveVolumeFactor;

  const weight = Math.max(1, Math.round(effectiveVolume * density * 10) / 10);

  const rawHours = (effectiveVolume * 12) / 60;
  const printDuration = Math.max(0.5, Math.round(rawHours * 10) / 10);

  const startupFee = 100;
  const materialCost = weight * costPerGram;
  const machineCost = printDuration * 45;

  const rawPrice = startupFee + materialCost + machineCost + finishFee;
  const estimatedPrice = Math.max(150, Math.ceil(rawPrice));

  return {
    weight,
    printDuration,
    estimatedPrice
  };
};
export default calculateQuote;
