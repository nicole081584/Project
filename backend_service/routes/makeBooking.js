// routes/makeBookings.js
"use strict";

const express = require('express');
const router = express.Router();
const { nanoid } = require('nanoid');
const booking_js = require("../libraries/booking.js");
const bodyParser = require('body-parser');
const { bookingServiceManager } = require ('../libraries/bookingServiceManager.js');

const jsonParser = bodyParser.json();
const bookingManager = new bookingServiceManager();

/**
* The handler for the POST /makeBooking route.
* To make a Booking, the customer must provide full name, phone Number, email address, numbere Of Guests, Date and Time.
*
* @param request   the request object
* @param response  the response object
*/

router.post("/", jsonParser, async function (request, response) {

        const result = await makeBooking(
                request.body.title,
                request.body.firstName,
                request.body.lastName,
                request.body.phoneNumber,
                request.body.email,
                request.body.numberOfGuests,
                request.body.date,
                request.body.time,
                request.body.comment
                );
        //console.log("Response that gets passed back to app: "+ result); //for debugging
         response.send(result);
});

/**
 * The implementation of the POST /makeBooking route. This will add a new booking to the data base,
 * send a confirmation email and return the full booking details
 * including booking number and date it was booked.
 *
 * @param title           title of the customer
 * @param firstName       first name of the customer
 * @param lastName        lastName of the customer
 * @param phoneNumber     phone Number of the Customer
 * @param email           email of the customer
 * @param numberOfGuests  number of guests in the party
 * @param date            date of booking
 * @param time            time of booking
 * @returns               if sucessful a JSON string representing a booking
 */
 async function makeBooking (title, firstName, lastName, phoneNumber, email, numberOfGuests, date, time, comment) {

    //log Post voucher and values
    console.log("Request to POST booking: " + title + ", " + firstName + ", " + lastName + ", " + phoneNumber + ", " + email + ", " + numberOfGuests + ", " + date + ", " + time + "," + comment);
    // generate a 12 digit random booking number with nanoid  
    const bookingNumber = nanoid(12);
    //get date booking was made
    const bookingDate = new Date().toLocaleDateString("en-GB");
    //add all values to one instance of booking
    var booking = new booking_js.booking(title, firstName, lastName, phoneNumber, email, numberOfGuests, date, time, comment);
    booking.bookingNumber = bookingNumber;
    booking.dateBookingWasMade = bookingDate;

    //add voucher to DB
    try {
    const success = await bookingManager.addBooking(booking, 'bookings');
    let result;

    if (success) {
      result = 
        "{\"status\" : \"success\", \"data\" : [" + booking.stringify() + "]}";
          //if sucessful mail booking confirmation email
           try {
                  await bookingManager.mailBooking(booking);

                      if (success){
                            result = 
                              "{\"status\" : \"success\", \"data\" : [" + booking.stringify() + "]}";
                            // if sucessful add taken slots to bookingSlots db
                              try {
                                await bookingManager.addSlotsToDB(booking.dateOfBooking, booking.time, booking.numberOfGuests);
                                      if (success){
                                          result = 
                                              "{\"status\" : \"success\", \"data\" : [" + booking.stringify() + "]}";
                                          }
                                      else { //if slots cant be added to db throw error
                                          await bookingManager.deletBooking(booking, 'bookings');
                                          result = "{\"status\" : \"error\",\"message\" : \"Failed to add booking slots taken to db\"}";
                                          }
                                  } 
                              catch (err) { //if adding slots is unsucessfull throw error
                                      console.error("Error adding booking:", err);
                                  return {
                                      status: "error",
                                      message: "Server error",
                                    }}
                            }
                      else { //if mailing is unsecessful throw error
                        await bookingManager.deletBooking(booking, 'bookings');
                        result = "{\"status\" : \"error\",\"message\" : \"Failed to send booking confirmation email\"}";
                      }
                } 
                catch (err) { //if mailing booking is unsucessfull throw error
                      console.error("Error adding booking:", err);
                      return {
                        status: "error",
                          message: "Server error",
                        }}
      }  
  else {
        result = "{\"status\" : \"error\",\"message\" : \"Booking unsucessfull\"}";
    }

    //log what happened and respons error if unsucessfull
    console.log("Response from POST makeBooking:", result);
     return result;
  } catch (err) {
    console.error("Error adding booking:", err);
    return {
      status: "error",
      message: "Server error",
    };
  }
}

module.exports = router;