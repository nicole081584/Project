// routes/bookingSlots.js
"use strict";

const express = require('express');
const router = express.Router();
const { bookingServiceManager } = require ('../libraries/bookingServiceManager.js')

const bookingManager = new bookingServiceManager();

/**
 * The handler for the GET /bookingSlots route.
 * To get all available booking slots on the date for the number of people
 */
router.get('/', async (request, response) => {
  const result = await getBookingSlots(
    request.query.date,
    request.query.numberOfGuests
  );
  //console.log("Response that gets passed back to app from booking slots: "+ result); //for debugging
  response.send(result);
});

/**
 * The implementation of the GET /bookingSlots route.
 * This returns a list of all available booking slots on a given date.
 *
 * @param date           the date we want to retrieve the booking slots for
 * @param numberOfGuests the number of guests the booking is for
 * @returns              A json string representing an array of the available booking slots for the date
 */
async function getBookingSlots(date, numberOfGuests) {
    console.log("Request to GET available booking slots: Date: "+date+", Number of Guests: "+numberOfGuests);

    let response = "";
    try {
      const result = await bookingManager.findBookingSlots(date, numberOfGuests);

        if (result.length > 0){
          response = "{ \"status\" : \"success\", \"data\" : "+JSON.stringify(result)+"}";
          }
        else {
          response = "{ \"status\" : \"error\", \"message\" : \"No booking slots available online. Please contact the Restaurant to book\"}";
          }
    
    console.log("Response from GET booking slots:", response);
    return response;
  } 
  
  catch (error) {
    console.error("Error in getBookingSlots:", error);
    return JSON.stringify({ status: "error", message: "Server error" });
  }
}

module.exports = router;
