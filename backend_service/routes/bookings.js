// routes/bookings.js
"use strict";

const express = require('express');
const router = express.Router();
const { bookingServiceManager } = require('../libraries/bookingServiceManager.js');

const bookingManager = new bookingServiceManager();

/**
 * The handler for the POST /bookings/search route.
 * To search bookings by filter (currently date range)
 */
router.post('/search', async (request, response) => {
  const result = await searchBookings(
    request.body.filter,
    request.body.from,
    request.body.to
  );

  response.send(result);
});

/**
 * The implementation of the POST /bookings/search route.
 * This returns a list of bookings based on the filter.
 *
 * @param filter    the type of filter (e.g. 'date')
 * @param from      start date
 * @param to        end date
 * @returns         A json string representing an array of bookings
 */
async function searchBookings(filter, from, to) {
  console.log("Request to POST booking search:", { filter, from, to });

  let response = "";

  try {
    const result = await bookingManager.searchBookings(filter, from, to);

    if (result.length > 0) {
      response = "{ \"status\" : \"success\", \"data\" : " + JSON.stringify(result) + "}";
    } else {
      response = "{ \"status\" : \"error\", \"message\" : \"No bookings found for given criteria\"}";
    }

    console.log("Response from POST bookings search:", response);
    return response;

  } catch (error) {
    console.error("Error in searchBookings:", error);
    return JSON.stringify({ status: "error", message: "Server error" });
  }
}

module.exports = router;