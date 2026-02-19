// routes/userType.js
"use strict";

const express = require('express');
const router = express.Router();
const { adminServiceManager } = require ('../libraries/adminServiceManager.js')

const adminManager = new adminServiceManager();

/**
 * The handler for the GET / userType route.
 * To get all available booking slots on the date for the number of people
 */
router.get('/', async (request, response) => {
  const result = await getUserType(
    request.query.emailUsername,
    request.query.bookingNumberPassword
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
async function getUserType(emailUsername, bookingNumberPassword) {
    console.log("Request to GET userType: Email/Username: "+emailUsername+", Bookingnumber/ Password: "+bookingNumberPassword);

    let response = "";
    try {
      const result = await adminManager.findUserType(emailUsername, bookingNumberPassword);

        if (result.length > 0){
          response = "{ \"status\" : \"success\", \"data\" : "+JSON.stringify(result)+"}";
          }
        else {
          response = "{ \"status\" : \"error\", \"message\" : \"No Entry for this data found please try again!\"}";
          }
    
    console.log("Response from find User Type", response);
    return response;
  } 
  
  catch (error) {
    console.error("Error in getUserType:", error);
    return JSON.stringify({ status: "error", message: "Server error" });
  }
}

module.exports = router;