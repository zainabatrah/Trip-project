import express from "express";
import mongoose from "mongoose";

import PrivateTripRequest from "../models/PrivateTripRequest.js";

const router = express.Router();

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function sendValidationError(error, res) {
  if (error?.name === "ValidationError") {
    const errors = Object.values(error.errors).map(
      (item) => item.message
    );

    return res.status(400).json({
      success: false,
      message: errors.join(" "),
      errors,
    });
  }

  return res.status(500).json({
    success: false,
    message:
      error?.message || "An unexpected server error occurred.",
  });
}

/*
GET /api/private-trip-requests
Return all private-trip requests
*/
router.get("/", async (req, res) => {
  try {
    const requests = await PrivateTripRequest.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("GET private trip requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not load private trip requests.",
      error: error.message,
    });
  }
});

/*
POST /api/private-trip-requests
Create a new private-trip request
*/
router.post("/", async (req, res) => {
  try {
    console.log("Received private trip body:", req.body);

    const title = String(req.body.title || "").trim();

    const destination = String(
      req.body.destination || req.body.to || ""
    ).trim();

    const startDate = String(
      req.body.startDate || req.body.date || ""
    ).trim();

    const endDate = String(
      req.body.endDate || req.body.startDate || req.body.date || ""
    ).trim();

    const transportation = String(
      req.body.transportation || req.body.vehicle || ""
    ).trim();

    const travelersValue =
      req.body.travelers ?? req.body.passengers;

    const budgetValue = req.body.budget;

    const notes = String(req.body.notes || "").trim();

    const clientName = String(
      req.body.clientName ||
        req.body.fullName ||
        req.body.name ||
        "Client"
    ).trim();

    const email = String(
      req.body.email || req.body.userEmail || ""
    )
      .trim()
      .toLowerCase();

    const missingFields = [];

    if (!title) {
      missingFields.push("title");
    }

    if (!destination) {
      missingFields.push("destination");
    }

    if (!startDate) {
      missingFields.push("startDate");
    }

    if (!endDate) {
      missingFields.push("endDate");
    }

    if (!transportation) {
      missingFields.push("transportation");
    }

    if (
      travelersValue === undefined ||
      travelersValue === null ||
      travelersValue === ""
    ) {
      missingFields.push("travelers");
    }

    if (
      budgetValue === undefined ||
      budgetValue === null ||
      budgetValue === ""
    ) {
      missingFields.push("budget");
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
        missingFields,
      });
    }

    const travelers = Number(travelersValue);
    const budget = Number(budgetValue);

    if (!Number.isInteger(travelers) || travelers < 1) {
      return res.status(400).json({
        success: false,
        message:
          "Travelers must be a whole number greater than or equal to 1.",
      });
    }

    if (!Number.isFinite(budget) || budget < 0) {
      return res.status(400).json({
        success: false,
        message: "Budget must be a valid non-negative number.",
      });
    }

    const transportationMap = {
      car: "Car",
      van: "Van",
      minibus: "Minibus",
      bus: "Bus",
    };

    const normalizedTransportation =
      transportationMap[transportation.toLowerCase()];

    if (!normalizedTransportation) {
      return res.status(400).json({
        success: false,
        message:
          "Transportation must be Car, Van, Minibus, or Bus.",
      });
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (
      Number.isNaN(parsedStartDate.getTime()) ||
      Number.isNaN(parsedEndDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Start date or end date is invalid.",
      });
    }

    if (parsedEndDate < parsedStartDate) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before the start date.",
      });
    }

    const request = await PrivateTripRequest.create({
      title,
      destination,
      startDate,
      endDate,
      transportation: normalizedTransportation,
      travelers,
      budget,
      notes,
      clientName,
      email,
      status: "PENDING",
      organizerReply: "",
      reviewedAt: null,
      messages: [],
    });

    return res.status(201).json({
      success: true,
      message: "Private trip request sent successfully.",
      request,
    });
  } catch (error) {
    console.error("POST private trip request error:", error);

    return sendValidationError(error, res);
  }
});

/*
GET /api/private-trip-requests/:id/messages
Return messages for one request

This route must appear before /:id
*/
router.get("/:id/messages", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID.",
      });
    }

    const request = await PrivateTripRequest.findById(id).select(
      "messages"
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Private trip request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      messages: request.messages || [],
    });
  } catch (error) {
    console.error("GET request messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not load messages.",
      error: error.message,
    });
  }
});

/*
POST /api/private-trip-requests/:id/messages
Send a message from the client
*/
router.post("/:id/messages", async (req, res) => {
  try {
    const { id } = req.params;
    const text = String(req.body.text || "").trim();

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID.",
      });
    }

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Message text is required.",
      });
    }

    if (text.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 1000 characters.",
      });
    }

    const request = await PrivateTripRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Private trip request not found.",
      });
    }

    request.messages.push({
      sender: "client",
      text,
    });

    await request.save();

    const newMessage =
      request.messages[request.messages.length - 1];

    return res.status(201).json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.error("POST client message error:", error);

    return sendValidationError(error, res);
  }
});

/*
POST /api/private-trip-requests/:id/organizer-messages
Send a message from the organizer
*/
router.post("/:id/organizer-messages", async (req, res) => {
  try {
    const { id } = req.params;
    const text = String(req.body.text || "").trim();

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID.",
      });
    }

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Message text is required.",
      });
    }

    if (text.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 1000 characters.",
      });
    }

    const request = await PrivateTripRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Private trip request not found.",
      });
    }

    request.messages.push({
      sender: "organizer",
      text,
    });

    await request.save();

    const newMessage =
      request.messages[request.messages.length - 1];

    return res.status(201).json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.error("POST organizer message error:", error);

    return sendValidationError(error, res);
  }
});

/*
PATCH /api/private-trip-requests/:id/status
Approve, reject, or reset a request
*/
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID.",
      });
    }

    const status = String(req.body.status || "")
      .trim()
      .toUpperCase();

    const organizerReply = String(
      req.body.organizerReply ||
        req.body.organizerMessage ||
        ""
    ).trim();

    const allowedStatuses = [
      "PENDING",
      "APPROVED",
      "REJECTED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be PENDING, APPROVED, or REJECTED.",
        receivedStatus: req.body.status,
      });
    }

    if (organizerReply.length > 1000) {
      return res.status(400).json({
        success: false,
        message:
          "Organizer reply cannot exceed 1000 characters.",
      });
    }

    const request = await PrivateTripRequest.findByIdAndUpdate(
      id,
      {
        status,
        organizerReply,
        reviewedAt:
          status === "PENDING" ? null : new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Private trip request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Request changed to ${status}.`,
      request,
    });
  } catch (error) {
    console.error("PATCH request status error:", error);

    return sendValidationError(error, res);
  }
});

/*
GET /api/private-trip-requests/:id
Return one request

This must appear after /:id/messages and /:id/status.
*/
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID.",
      });
    }

    const request = await PrivateTripRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Private trip request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    console.error("GET one request error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not load the private trip request.",
      error: error.message,
    });
  }
});

/*
PUT /api/private-trip-requests/:id
Update request information
*/
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID.",
      });
    }

    const updateData = { ...req.body };

    if (updateData.travelers !== undefined) {
      updateData.travelers = Number(updateData.travelers);
    }

    if (updateData.budget !== undefined) {
      updateData.budget = Number(updateData.budget);
    }

    if (updateData.status !== undefined) {
      updateData.status = String(updateData.status)
        .trim()
        .toUpperCase();
    }

    if (updateData.transportation !== undefined) {
      const transportationMap = {
        car: "Car",
        van: "Van",
        minibus: "Minibus",
        bus: "Bus",
      };

      updateData.transportation =
        transportationMap[
          String(updateData.transportation).toLowerCase()
        ] || updateData.transportation;
    }

    delete updateData.messages;
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.__v;

    const request = await PrivateTripRequest.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Private trip request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Private trip request updated successfully.",
      request,
    });
  } catch (error) {
    console.error("PUT private trip request error:", error);

    return sendValidationError(error, res);
  }
});

/*
DELETE /api/private-trip-requests/:id
Delete a request
*/
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID.",
      });
    }

    const request =
      await PrivateTripRequest.findByIdAndDelete(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Private trip request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Private trip request deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE private trip request error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not delete private trip request.",
      error: error.message,
    });
  }
});

// This is the critical line that fixes your current error.
export default router;