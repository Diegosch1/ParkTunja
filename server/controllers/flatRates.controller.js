import * as Yup from "yup";
import mongoose from "mongoose";
import FlatRate from "../models/flatRates.model.js";
import Parking from "../models/parking.model.js";

// Define Yup validation schema for input data
const flatRateValidationSchema = Yup.object().shape({
  parkingLot: Yup.string().trim().max(255).required("Parking lot is required"),
  name: Yup.string().trim().max(255).required("Name is required"),
  amount: Yup.number().min(0).required("Amount is required"),
});

// Validate ObjectId format
export const validateObjectId = (id, fieldName) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error(`Invalid ${fieldName} ID format`);
  }
};

// Check if parking lot exists
export const validateParkingExists = async (parkingLot) => {
  const parking = await Parking.findById(parkingLot);
  if (!parking) {
    throw new Error("Parking lot does not exist");
  }
};

// Check if flat rate exists
export const validateFlatRateExists = async (id) => {
  const flatRate = await FlatRate.findById(id);
  if (!flatRate) {
    throw new Error("Flat rate not found");
  }
};

// --- Helpers for interval, overlap and coverage validation (shared) ---
const timeToMinutes = (t) => {
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
};

const buildIntervals = (open, close) => {
  const o = timeToMinutes(open);
  const c = timeToMinutes(close);
  if (o === c) return [[0, 24 * 60]];
  if (o < c) return [[o, c]];
  return [[o, 24 * 60], [0, c]]; // crosses midnight
};

const intervalsOverlap = (a, b) => a[0] < b[1] && b[0] < a[1];

const rangesOverlap = (open1, close1, open2, close2) => {
  const ints1 = buildIntervals(open1, close1);
  const ints2 = buildIntervals(open2, close2);
  for (const i1 of ints1) for (const i2 of ints2) if (intervalsOverlap(i1, i2)) return true;
  return false;
};

const validateMergedRatesNoOverlapAndNoGaps = (mergedRates) => {
  // mergedRates: array of { name, operatingHour }
  // Check overlaps
  const overlaps = [];
  for (let i = 0; i < mergedRates.length; i++) {
    for (let j = i + 1; j < mergedRates.length; j++) {
      const a = mergedRates[i];
      const b = mergedRates[j];
      const daysA = a.operatingHour.weekDays || [];
      const daysB = b.operatingHour.weekDays || [];
      const intersection = daysA.filter((d) => daysB.includes(d));
      if (intersection.length === 0) continue;
      if (rangesOverlap(a.operatingHour.openingTime, a.operatingHour.closingTime, b.operatingHour.openingTime, b.operatingHour.closingTime)) {
        overlaps.push({ a: a.name, b: b.name, days: intersection });
      }
    }
  }
  if (overlaps.length) {
    const msg = overlaps.map((o) => `Overlap between "${o.a}" and "${o.b}" on days ${o.days.join(', ')}`).join('; ');
    throw new Error(msg);
  }

  // Check coverage (no gaps) for days 1..8
  const daysSet = [1,2,3,4,5,6,7,8];
  const gapsReport = [];
  for (const day of daysSet) {
    const intervals = [];
    mergedRates.forEach((m) => {
      if ((m.operatingHour.weekDays || []).includes(day)) {
        const ints = buildIntervals(m.operatingHour.openingTime, m.operatingHour.closingTime);
        ints.forEach((it) => intervals.push(it));
      }
    });
    if (!intervals.length) {
      gapsReport.push({ day, gaps: [['00:00', '24:00']] });
      continue;
    }
    intervals.sort((a, b) => a[0] - b[0]);
    const mergedInts = [intervals[0]];
    for (let i = 1; i < intervals.length; i++) {
      const cur = intervals[i];
      const last = mergedInts[mergedInts.length - 1];
      if (cur[0] <= last[1]) {
        last[1] = Math.max(last[1], cur[1]);
      } else {
        mergedInts.push([cur[0], cur[1]]);
      }
    }
    const gaps = [];
    let cursor = 0;
    for (const mi of mergedInts) {
      if (mi[0] > cursor) gaps.push([cursor, mi[0]]);
      cursor = Math.max(cursor, mi[1]);
    }
    if (cursor < 24 * 60) gaps.push([cursor, 24 * 60]);
    if (gaps.length) {
      gapsReport.push({ day, gaps: gaps.map(([s, e]) => {
        const sh = String(Math.floor(s / 60)).padStart(2, '0');
        const sm = String(s % 60).padStart(2, '0');
        const eh = String(Math.floor(e / 60)).padStart(2, '0');
        const em = String(e % 60).padStart(2, '0');
        return `${sh}:${sm}-${eh}:${em}`;
      })});
    }
  }
  if (gapsReport.length) {
    const msg = gapsReport.map(g => `Day ${g.day} has gaps: ${g.gaps.join(', ')}`).join('; ');
    throw new Error(`Coverage error: ${msg}`);
  }
};

export const createFlatRates = async (req, res) => {
  // Accept either a single rate (legacy) or an array of rates in `rates`
  const body = req.body || {};
  const ratesInput = Array.isArray(body.rates)
    ? body.rates
    : body.name && body.amount
    ? [{ parkingLot: body.parkingLot, name: body.name, amount: body.amount, operatingHour: body.operatingHour }]
    : [];

  if (!ratesInput.length) {
    return res.status(400).json({ error: "No rates provided. Expect 'rates' array or single rate fields." });
  }

  try {
    // All rates must reference the same parkingLot
    const parkingLot = ratesInput[0].parkingLot;
    if (!parkingLot) throw new Error("parkingLot is required for each rate");

    validateObjectId(parkingLot, "parking lot");
    await validateParkingExists(parkingLot);

    // Helpers for time/interval handling
    const timeToMinutes = (t) => {
      const [hh, mm] = t.split(":").map(Number);
      return hh * 60 + mm;
    };

    const buildIntervals = (open, close) => {
      const o = timeToMinutes(open);
      const c = timeToMinutes(close);
      if (o === c) return [[0, 24 * 60]];
      if (o < c) return [[o, c]];
      return [[o, 24 * 60], [0, c]]; // crosses midnight
    };

    const intervalsOverlap = (a, b) => a[0] < b[1] && b[0] < a[1];

    const rangesOverlap = (open1, close1, open2, close2) => {
      const ints1 = buildIntervals(open1, close1);
      const ints2 = buildIntervals(open2, close2);
      for (const i1 of ints1) for (const i2 of ints2) if (intervalsOverlap(i1, i2)) return true;
      return false;
    };

    // Validate each rate payload and operatingHour shape
    for (const r of ratesInput) {
      await flatRateValidationSchema.validate({ parkingLot: r.parkingLot || parkingLot, name: r.name, amount: r.amount }, { abortEarly: false });

      if (r.operatingHour) {
        if (!Array.isArray(r.operatingHour.weekDays)) throw new Error("weekDays must be an array of numbers");
        const invalidDays = r.operatingHour.weekDays.filter((d) => d < 1 || d > 8);
        if (invalidDays.length) throw new Error(`Invalid weekDays: ${invalidDays.join(", ")} (allowed: 1–8)`);
        // validate time format loosely (should match HH:mm)
        if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(r.operatingHour.openingTime || "")) throw new Error("Invalid openingTime format");
        if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(r.operatingHour.closingTime || "")) throw new Error("Invalid closingTime format");
      }
    }

    // Fetch existing rates for parkingLot
    const existing = await FlatRate.find({ parkingLot }).lean();

    // Build merged list (existing + new) for validations
    const merged = [];
    for (const e of existing) {
      if (e.operatingHour) merged.push({ source: 'existing', name: e.name, operatingHour: e.operatingHour });
    }
    for (const n of ratesInput) {
      if (n.operatingHour) merged.push({ source: 'new', name: n.name, operatingHour: n.operatingHour });
    }

    // Check overlaps between any pair where weekDays intersect
    const overlaps = [];
    for (let i = 0; i < merged.length; i++) {
      for (let j = i + 1; j < merged.length; j++) {
        const a = merged[i];
        const b = merged[j];
        const daysA = a.operatingHour.weekDays || [];
        const daysB = b.operatingHour.weekDays || [];
        const intersection = daysA.filter((d) => daysB.includes(d));
        if (intersection.length === 0) continue;
        if (rangesOverlap(a.operatingHour.openingTime, a.operatingHour.closingTime, b.operatingHour.openingTime, b.operatingHour.closingTime)) {
          overlaps.push({ a: a.name, b: b.name, days: intersection });
        }
      }
    }
    if (overlaps.length) {
      const msg = overlaps.map((o) => `Overlap between "${o.a}" and "${o.b}" on days ${o.days.join(', ')}`).join('; ');
      throw new Error(msg);
    }

    // Check coverage (no gaps) for all days 1..8 (include 8 explicitly)
    // If a day (including 8=holiday) has no intervals, it will be treated as a gap.
    const daysSet = new Set([1,2,3,4,5,6,7,8]);
    const gapsReport = [];
    for (const day of [...daysSet].sort((a, b) => a - b)) {
      // collect intervals for this day
      const intervals = [];
      merged.forEach((m) => {
        if ((m.operatingHour.weekDays || []).includes(day)) {
          const ints = buildIntervals(m.operatingHour.openingTime, m.operatingHour.closingTime);
          ints.forEach((it) => intervals.push(it));
        }
      });
      if (!intervals.length) {
        gapsReport.push({ day, gaps: [['00:00', '24:00']] });
        continue;
      }
      // merge intervals
      intervals.sort((a, b) => a[0] - b[0]);
      const mergedInts = [intervals[0]];
      for (let i = 1; i < intervals.length; i++) {
        const cur = intervals[i];
        const last = mergedInts[mergedInts.length - 1];
        if (cur[0] <= last[1]) {
          // overlap or contiguous -> extend
          last[1] = Math.max(last[1], cur[1]);
        } else {
          mergedInts.push([cur[0], cur[1]]);
        }
      }
      // check coverage from 0 to 1440
      const gaps = [];
      let cursor = 0;
      for (const mi of mergedInts) {
        if (mi[0] > cursor) {
          gaps.push([cursor, mi[0]]);
        }
        cursor = Math.max(cursor, mi[1]);
      }
      if (cursor < 24 * 60) gaps.push([cursor, 24 * 60]);
      if (gaps.length) {
        gapsReport.push({ day, gaps: gaps.map(([s, e]) => {
          const sh = String(Math.floor(s / 60)).padStart(2, '0');
          const sm = String(s % 60).padStart(2, '0');
          const eh = String(Math.floor(e / 60)).padStart(2, '0');
          const em = String(e % 60).padStart(2, '0');
          return `${sh}:${sm}-${eh}:${em}`;
        })});
      }
    }

    if (gapsReport.length) {
      const msg = gapsReport.map(g => `Day ${g.day} has gaps: ${g.gaps.join(', ')}`).join('; ');
      throw new Error(`Coverage error: ${msg}`);
    }

    // All validations passed — insert new rates atomically
    const docsToInsert = ratesInput.map((r) => ({ parkingLot, name: r.name, amount: r.amount, operatingHour: r.operatingHour }));
    const inserted = await FlatRate.insertMany(docsToInsert, { ordered: true });
    res.status(201).json(inserted);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getFlatRates = async (req, res) => {
  try {
    const flatRates = await FlatRate.find();
    res.json(flatRates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFlatRate = async (req, res) => {
  const { id } = req.params;
  try {
    validateObjectId(id, "flat rate");
    const flatRate = await FlatRate.findById(id);
    res.json(flatRate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteFlatRates = async (req, res) => {
  
  const {parkingLot} = req.params;
  try {
    if (!parkingLot) throw new Error('parkingLot is required in body');
    validateObjectId(parkingLot, 'parking lot');
    await validateParkingExists(parkingLot);

    const existing = await FlatRate.find({ parkingLot }).lean();
    if (!existing.length) return res.status(404).json({ error: 'No flat rates found for this parking lot' });

    const result = await FlatRate.deleteMany({ parkingLot });
    res.json({ deletedCount: result.deletedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Replace all flat rates for a parkingLot with a provided list (atomic)
// Body: { parkingLot: ObjectId, rates: [ { name, amount, operatingHour } ] }
export const updateFlatRates = async (req, res) => {
  const { parkingLot, rates } = req.body || {};
  try {
    if (!parkingLot) throw new Error('parkingLot is required');
    validateObjectId(parkingLot, 'parking lot');
    await validateParkingExists(parkingLot);

    const ratesInput = Array.isArray(rates) ? rates : [];
    if (!ratesInput.length) {
      return res.status(400).json({ error: "No rates provided. Expect 'rates' array." });
    }

    // validate shape of each rate
    for (const r of ratesInput) {
      await flatRateValidationSchema.validate({ parkingLot, name: r.name, amount: r.amount }, { abortEarly: false });
      if (!r.operatingHour) throw new Error('Each rate must include operatingHour');
      if (!Array.isArray(r.operatingHour.weekDays)) throw new Error('weekDays must be an array of numbers');
      const invalidDays = r.operatingHour.weekDays.filter((d) => d < 1 || d > 8);
      if (invalidDays.length) throw new Error(`Invalid weekDays: ${invalidDays.join(", ")} (allowed: 1–8)`);
      if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(r.operatingHour.openingTime || "")) throw new Error('Invalid openingTime format');
      if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(r.operatingHour.closingTime || "")) throw new Error('Invalid closingTime format');
    }

    // Build mergedRates from provided list only (they will replace existing)
    const mergedRates = ratesInput.map((r) => ({ name: r.name, operatingHour: r.operatingHour }));

    // Validate overlaps and coverage (throws on error)
    validateMergedRatesNoOverlapAndNoGaps(mergedRates);

    // All good — replace atomically: delete existing and insert new
    await FlatRate.deleteMany({ parkingLot });
    const docsToInsert = ratesInput.map((r) => ({ parkingLot, name: r.name, amount: r.amount, operatingHour: r.operatingHour }));
    const inserted = await FlatRate.insertMany(docsToInsert, { ordered: true });
    res.status(200).json(inserted);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
