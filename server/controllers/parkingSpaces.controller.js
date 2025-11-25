import mongoose from "mongoose";
import ParkingSpaces from "../models/parkingSpaces.model.js";
import Parking from "../models/parking.model.js";
import FlatRate from "../models/flatRates.model.js";
import ParkingEvent from "../models/parkingEvent.model.js";
import { DateTime } from "luxon";

export const registerVehicleEntry = async (req, res) => {
  const { parkingId } = req.params;
  const { spotNumber, licensePlate } = req.body;

  try {
    if (!mongoose.isValidObjectId(parkingId)) {
      return res.status(400).json({ error: "Invalid parking ID format" });
    }

    const parkingSpaces = await ParkingSpaces.findOne({ parkingLot: parkingId });
    const parking = await Parking.findById(parkingId);

    if (!parkingSpaces || !parking) {
      return res.status(404).json({ error: "Parking or ParkingSpaces not found" });
    }

    if (!isWithinOperatingHours(parking)) {
      return res
        .status(400)
        .json({ error: "Vehicle entry not allowed at this time (outside operating hours)" });
    }

    const spotKey = String(spotNumber);
    const spot = parkingSpaces.spots.get(spotKey);

    if (!spot) {
      return res.status(400).json({ error: `Spot ${spotNumber} does not exist` });
    }

    if (spot.isOccupied) {
      return res.status(400).json({ error: `Spot ${spotNumber} is already occupied` });
    }

    // Registrar ocupación
    parkingSpaces.spots.set(spotKey, {
      isOccupied: true,
      licensePlate,
      entryTime: new Date(),
      exitTime: null,
    });

    parkingSpaces.availableSpots -= 1;
    await parkingSpaces.save();

    await ParkingEvent.create({
      parkingLot: parkingId,
      spotNumber,
      licensePlate,
      type: "entry",
      timestamp: new Date(),
    });

    // Verificar notificación por alta ocupación
    const occupancyRate =
      (parkingSpaces.totalCapacity - parkingSpaces.availableSpots) /
      parkingSpaces.totalCapacity;
    const shouldNotify = occupancyRate >= parking.notificationThreshold / 100;

    res.json({
      message: `Vehicle ${licensePlate} entered spot ${spotNumber}`,
      notifyHighOccupancy: shouldNotify,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const registerVehicleExit = async (req, res) => {
  const { parkingId } = req.params;
  const { spotNumber } = req.body;

  try {
    if (!mongoose.isValidObjectId(parkingId)) {
      return res.status(400).json({ error: "Invalid parking ID format" });
    }

    const parkingSpaces = await ParkingSpaces.findOne({ parkingLot: parkingId });
    const parking = await Parking.findById(parkingId);

    if (!parkingSpaces || !parking) {
      return res.status(404).json({ error: "Parking or ParkingSpaces not found" });
    }

    if (!isWithinOperatingHours(parking)) {
      return res
        .status(400)
        .json({ error: "Vehicle exit not allowed at this time (outside operating hours)" });
    }

    const spotKey = String(spotNumber);
    const spot = parkingSpaces.spots.get(spotKey);

    if (!spot || !spot.isOccupied) {
      return res.status(400).json({ error: `Spot ${spotNumber} is not occupied` });
    }

    // Calcular la tarifa antes de liberar el spot    
    const feeResult = await calculateDynamicVehicleFee(parkingId, spot);

    const enTime = new Date(spot.entryTime);
    const exTime = new Date();
    console.log(exTime);


    const durationHours = ((exTime - enTime) / (1000 * 60 * 60)).toFixed(2);
    // Liberar espacio
    parkingSpaces.spots.set(spotKey, {
      isOccupied: false,
      licensePlate: null,
      entryTime: null,
      exitTime: null,
    });

    parkingSpaces.availableSpots += 1;
    await parkingSpaces.save();

    // Registrar evento
    await ParkingEvent.create({
      parkingLot: parkingId,
      spotNumber,
      licensePlate: spot.licensePlate,
      type: "exit",
      timestamp: exTime,
      fee: feeResult,
      durationHours,
    });
    console.log(feeResult);


    const occupancyRate =
      (parkingSpaces.totalCapacity - parkingSpaces.availableSpots) /
      parkingSpaces.totalCapacity;
    const shouldNotify = occupancyRate >= parking.notificationThreshold / 100;

    res.json({
      message: `Vehicle exited from spot ${spotNumber}`,
      totalFee: feeResult,
      entryTime: enTime,
      exitTime: exTime,
      hoursParked: durationHours,
      notifyHighOccupancy: shouldNotify,
    });
    console.log({ enTime, exTime });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getParkingSpacesInfo = async (req, res) => {
  const { parkingId } = req.params;

  try {
    if (!mongoose.isValidObjectId(parkingId)) {
      return res.status(400).json({ error: "Invalid parking ID format" });
    }

    const parking = await Parking.findById(parkingId);
    const parkingSpaces = await ParkingSpaces.findOne({ parkingLot: parkingId });

    if (!parking || !parkingSpaces) {
      return res.status(404).json({ error: "Parking or ParkingSpaces not found" });
    }

    res.json({
      parking: {
        id: parking._id,
        name: parking.name,
        location: parking.location,
      },
      totalCapacity: parkingSpaces.totalCapacity,
      availableSpots: parkingSpaces.availableSpots,
      spots: Object.fromEntries(parkingSpaces.spots),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Convierte HH:mm a minutos del día
const timeToMinutes = (t) => {
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
};

// Construye intervalos, considerando cruces de medianoche y 24h completas
const buildIntervals = (open, close) => {
  const normalize = (t) => (t === "24:00" ? "23:59" : t);

  open = normalize(open);
  close = normalize(close);

  const o = timeToMinutes(open);
  const c = timeToMinutes(close);

  // Caso 24 horas reales
  if (o === c) return [[0, 24 * 60]];

  // Caso normal (sin cruzar medianoche)
  if (o < c) return [[o, c]];

  // Caso cruza medianoche
  return [
    [o, 24 * 60],
    [0, c],
  ];
};

export async function calculateDynamicVehicleFee(parkingLotId, spot) {
  console.log("=== CALCULATE DYNAMIC VEHICLE FEE ===");
  console.log("ParkingLotID:", parkingLotId);
  console.log("Spot recibido:", JSON.stringify(spot, null, 2));

  if (!spot?.entryTime) {
    throw new Error("El espacio no tiene hora de entrada registrada.");
  }

  const startDateUTC = DateTime.fromJSDate(new Date(spot.entryTime)).toUTC();
  const endDateUTC = DateTime.fromJSDate(
    spot.exitTime ? new Date(spot.exitTime) : new Date()
  ).toUTC();

  console.log("Start UTC:", startDateUTC.toISO());
  console.log("End UTC:", endDateUTC.toISO());

  if (endDateUTC <= startDateUTC) {
    throw new Error("Las fechas de entrada y salida no son válidas.");
  }

  const flatRates = await FlatRate.find({ parkingLot: parkingLotId }).lean();
  console.log("Tarifas encontradas:", flatRates);

  if (!flatRates.length) {
    throw new Error("No se encontraron tarifas configuradas para este parqueadero.");
  }

  let totalFee = 0;
  let current = startDateUTC;
  const end = endDateUTC;

  console.log("=== INICIO DEL RECORRIDO POR HORAS ===");

  while (current < end) {
    const local = current.setZone("America/Bogota");
    const normalizedDay = local.weekday;
    const currentMinutes = local.hour * 60 + local.minute;

    console.log("\n--- Hora actual iterada ---");
    console.log("Fecha local:", local.toISO());
    console.log("Día normalizado:", normalizedDay);
    console.log("Minutos del día:", currentMinutes);

    // Buscar tarifa aplicable
    const applicableRate = flatRates.find((rate) => {
      const oh = rate.operatingHour;
      if (!oh) return false;

      const intervals = buildIntervals(oh.openingTime, oh.closingTime);

      const isDayIncluded =
        oh.weekDays.includes(normalizedDay) || oh.weekDays.includes(8);

      let isInRange = false;
      for (const [start, end] of intervals) {
        if (currentMinutes >= start && currentMinutes < end) {
          isInRange = true;
          break;
        }
      }

      console.log("Evaluando tarifa:", {
        rateId: rate._id,
        amount: rate.amount,
        intervals,
        isDayIncluded,
        isInRange,
        weekDays: oh.weekDays,
        opening: oh.openingTime,
        closing: oh.closingTime,
      });

      return isDayIncluded && isInRange;
    });

    if (applicableRate) {
      console.log(">> Tarifa aplicada:", applicableRate.amount);
      totalFee += applicableRate.amount;
    } else {
      console.log(">> NO se encontró tarifa para esta hora.");
    }

    current = current.plus({ hours: 1 });
  }

  console.log("=== TOTAL FEE CALCULADO ===");
  console.log("Total:", totalFee);

  return totalFee;
}

function isWithinOperatingHours(parking) {
  const now = new Date();

  // Día actual → 1 = Lunes, …, 7 = Domingo
  let jsDay = now.getDay();      // 0=domingo → 7
  const normalizedDay = jsDay === 0 ? 7 : jsDay;

  const timeStr = now.toTimeString().slice(0, 5); // HH:mm

  const currentMinutes =
    Number(timeStr.split(":")[0]) * 60 + Number(timeStr.split(":")[1]);

  // Revisar cada operatingHour configurado
  return parking.operatingHours.some((oh) => {
    if (!oh) return false;

    const open = oh.openingTime;   // "HH:mm"
    const close = oh.closingTime;  // "HH:mm"

    // Convertir a minutos para comparación precisa
    const [ohH, ohM] = open.split(":").map(Number);
    const [chH, chM] = close.split(":").map(Number);

    const openMinutes = ohH * 60 + ohM;
    const closeMinutes = chH * 60 + chM;

    const crossesMidnight = openMinutes > closeMinutes;

    const isDayIncluded =
      oh.weekDays.includes(normalizedDay) || oh.weekDays.includes(8); // Festivo

    if (!isDayIncluded) return false;

    // Caso 1: horario normal (no cruza medianoche)
    if (!crossesMidnight) {
      return (
        currentMinutes >= openMinutes &&
        currentMinutes < closeMinutes
      );
    }

    // Caso 2: cruza medianoche (22:00–06:00)
    return (
      currentMinutes >= openMinutes ||
      currentMinutes < closeMinutes
    );
  });
}




