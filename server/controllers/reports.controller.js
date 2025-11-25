import mongoose from "mongoose";
import ParkingEvent from "../models/parkingEvent.model.js";
import Parking from "../models/parking.model.js";

function toLocalDateTime(input, endOfDay = false) {
  const hasTime = input.includes("T");
  const date = new Date(input);

  if (!hasTime) {
    if (endOfDay) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }
  }

  // Convertir a hora local real del servidor (ej: UTC-5 para Colombia)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  return date;
}

export const getParkingReport = async (req, res) => {
  const { parkingId } = req.params;
  const { from, to, licensePlate } = req.query;

  try {
    if (!mongoose.isValidObjectId(parkingId)) {
      return res.status(400).json({ error: "Invalid parking ID format" });
    }

    const parking = await Parking.findById(parkingId);
    if (!parking) {
      return res.status(404).json({ error: "Parking not found" });
    }

    if (!from || !to) {
      return res.status(400).json({
        error: "Query params 'from' and 'to' are required (YYYY-MM-DD or YYYY-MM-DDTHH:mm).",
      });
    }

    // Convertir fechas del usuario (local) → fechas reales para Mongo
    const startDate = new Date(from);    
    const endDate = new Date(to);
    console.log({startDate, endDate});
    

    const query = {
      parkingLot: parkingId,
      timestamp: { $gte: startDate, $lte: endDate },
    };

    if (licensePlate) {
      query.licensePlate = licensePlate;
    }

    const events = await ParkingEvent.find(query).lean();

    // --- Estadísticas ---
    const entries = events.filter(e => e.type === "entry").length;
    const exits = events.filter(e => e.type === "exit").length;
    const totalRevenue = events.reduce((sum, e) => sum + (e.fee || 0), 0);

    const avgDuration =
      events.filter(e => e.durationHours).reduce((s, e) => s + e.durationHours, 0) /
      (exits || 1);

    // --- Agrupar por día en hora local ---
    const eventsByDay = {};

    events.forEach(ev => {
      const local = new Date(ev.timestamp);
      local.setMinutes(local.getMinutes() - local.getTimezoneOffset());

      const day = local.toISOString().slice(0, 10); // YYYY-MM-DD en hora Colombia
      if (!eventsByDay[day]) eventsByDay[day] = [];

      eventsByDay[day].push(ev);
    });

    return res.json({
      parking: {
        id: parking._id,
        name: parking.name,
        location: parking.location,
      },

      period: {
        inputFrom: from,
        inputTo: to,
        fromLocal: startDate,
        toLocal: endDate,
      },

      stats: {
        totalEntries: entries,
        totalExits: exits,
        totalRevenue,
        averageDurationHours: Number(avgDuration.toFixed(2)),
      },

      events,
      groupedByDay: eventsByDay,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};
