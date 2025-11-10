import mongoose from "mongoose";
import ParkingSpaces from "../models/parkingSpaces.model.js";
import Parking from "../models/parking.model.js";
import FlatRate from "../models/flatRates.model.js";

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

    const spotKey = String(spotNumber);
    const spot = parkingSpaces.spots.get(spotKey);

    if (!spot || !spot.isOccupied) {
      return res.status(400).json({ error: `Spot ${spotNumber} is not occupied` });
    }
    
    // Calcular la tarifa antes de liberar el spot    
    const feeResult = await calculateDynamicVehicleFee(parkingId, spot);
    
    const enTime = new Date(spot.entryTime);
    const exTime = new Date();

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

export async function calculateDynamicVehicleFee(parkingLotId, spot) {
  if (!spot?.entryTime) {
    throw new Error("El espacio no tiene hora de entrada registrada.");
  }

  const startDate = new Date(spot.entryTime);
  const endDate = spot.exitTime ? new Date(spot.exitTime) : new Date();

  if (endDate <= startDate) {
    throw new Error("Las fechas de entrada y salida no son válidas.");
  }

  // 🔹 Obtener las tarifas del parqueadero
  const flatRates = await FlatRate.find({ parkingLot: parkingLotId }).lean();
  if (!flatRates.length) {
    throw new Error("No se encontraron tarifas configuradas para este parqueadero.");
  }

  let totalFee = 0;
  let currentTime = new Date(startDate);

  // 🔁 Iterar hora a hora desde la entrada hasta la salida
  while (currentTime < endDate) {
    const jsDay = currentTime.getDay(); // Domingo=0 ... Sábado=6
    const normalizedDay = jsDay === 0 ? 7 : jsDay; // Lunes=1 ... Domingo=7
    const hourStr = currentTime.toTimeString().slice(0, 5); // HH:mm

    // 🕐 Buscar tarifa aplicable
    const applicableRate = flatRates.find((rate) => {
      const oh = rate.operatingHour;
      if (!oh) return false;

      const open = oh.openingTime;
      const close = oh.closingTime;
      const crossesMidnight = open > close; // p.ej. 22:00 - 06:00

      // Verificar día (incluye festivos si es 8)
      const isDayIncluded = oh.weekDays.includes(normalizedDay) || oh.weekDays.includes(8);

      // Verificar rango horario
      const isInRange = crossesMidnight
        ? hourStr >= open || hourStr < close
        : hourStr >= open && hourStr < close;

      return isDayIncluded && isInRange;
    });

    if (applicableRate) {
      totalFee += applicableRate.amount;
    }

    // Avanzar una hora exacta
    currentTime.setHours(currentTime.getHours() + 1);
  }
 
  return totalFee;
}



