// routes/vouchers.js

"use strict";

/**
 * Voucher Service API Routes
 * 
 * This file defines all routes related to voucher operations.
 * It acts as the interface between the frontend application and the backend voucher service.
 * 
 * The following routes are supported:
 * 
 *  POST   /voucher           - Create (purchase) a new voucher
 *  POST   /voucher/search    - Search for voucher(s) using filters (reference, email, phone, etc.)
 *  POST   /voucher/redeem    - Redeem a voucher (full or partial) [to be implemented]
 * 
 * Notes:
 * - All routes return JSON responses with a "status" field ("success" or "error")
 * - Data is returned in a "data" array where applicable
 * - Errors include a descriptive "message"
 * 
 */

const express = require('express');
const router = express.Router();
const { nanoid } = require('nanoid');
const giftVoucher_js = require('../libraries/giftVoucher.js'); 
const { voucherServiceManager } = require('../libraries/voucherServiceManager');
const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();
const voucherManager = new voucherServiceManager();

/**
* The handler for the POST /voucher route.
* To purchase a voucher, the customer must provide a name, phone Number, email address and voucher value.
*
* @param request   the request object
* @param response  the response object
*/

router.post('/', jsonParser, async (request, response) => {

        const result = await postVoucher(
                request.body.title,
                request.body.firstName,
                request.body.lastName,
                request.body.phoneNumber,
                request.body.email,
                request.body.value
                );
        //console.log("Response that gets passed back to app: "+ result); //for debugging
         response.send(result);
});

/**
 * The handler for the POST /voucher/search route.
 * Retrieves voucher(s) based on provided filters.
 *
 * @param request   the request object
 * @param response  the response object
 */
router.post('/search', jsonParser, async (request, response) => {

    const result = await searchVoucher(request.body.filters);

    response.send(result);
});

/**
 * The handler for the POST /voucher/redeem route.
 * Redeems a voucher either fully or partially.
 *
 * @param request   the request object
 * @param response  the response object
 */
router.post('/redeem', jsonParser, async (request, response) => {

    const result = await redeemVoucher(
        request.body.reference,
        request.body.amount
    );

    response.send(result);
});

/**
 * The implementation of the POST /voucher route. This will add a new voucher
 * to the database.
 *
 * @param title       title of the customer
 * @param firstName   first name of the customer
 * @param lastName    lastName of the customer
 * @param phoneNumber phone Number of the Customer
 * @param email       email of the customer
 * @param value       value of the voucher
 * @returns           if sucessful a JSON string representing a list of voucher(s)
 */
 async function postVoucher(title, firstName, lastName, phoneNumber, email, value) {

    //log Post voucher and values
    console.log("Request to POST voucher: " + title + ", " + firstName + ", " + lastName + ", " + phoneNumber + ", " + email + ", " + value);
    // generate a 18 digit random voucher number with nanoid  
    const voucherNumber = nanoid(18);
    //get purchase date
    const purchaseDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    //add all values to one instance of voucher
    var voucher = new giftVoucher_js.giftVoucher(title, firstName, lastName, phoneNumber, email, value);
    voucher.voucherNumber = voucherNumber;
    voucher.date = purchaseDate;

    //add voucher to DB
    try {
    const success = await voucherManager.addVoucher(voucher, 'vouchers');
    let result;

    if (success) {
          //if sucessful mail voucher
           try {
                  await voucherManager.mailVoucher(voucher);

                      if (success){
                            result = 
                              "{\"status\" : \"success\", \"data\" : [" + voucher.stringify() + "]}";
                            }
                      else { //if mailing is unsecessful throw error
                        await voucherManager.deletVoucher(voucher, 'vouchers');
                        result = "{\"status\" : \"error\",\"message\" : \"Failed to send voucher\"}";
                      }
                } 
                catch (err) { //if adding voucher is unsucessfull throw error
                      console.error("Error adding voucher:", err);
                      return {
                        status: "error",
                          message: "Server error",
                        }}
      }  
  else {
        result = "{\"status\" : \"error\",\"message\" : \"Purchase unsucessful\"}";
    }

    //log what happened and respons error if unsucessfull
    console.log("Response from POST voucher:", result);
     return result;
  } catch (err) {
    console.error("Error adding voucher:", err);
    return {
      status: "error",
      message: "Server error",
    };
  }
}

/**
 * The implementation of the POST /voucher/search route.
 * Searches for voucher(s) based on filters
 *
 * @param filters   object containing search fields (e.g. reference, email, phone)
 * @returns         JSON string representing voucher(s)
 */
async function searchVoucher(filters) {

    console.log("Request to SEARCH voucher with filters:", filters);

    try {
        let vouchers = [];

        const { reference, fromDate, toDate, status } = filters;

        // --- SEARCH BY REFERENCE ---
        if (reference) {
            vouchers = await voucherManager.getVoucherByReference(reference);
        }

        // --- SOLD ---
        else if (fromDate && toDate && status === 'sold') {
            vouchers = await voucherManager.getSoldVouchers(fromDate, toDate);
        }

        // --- REDEEMED ---
        else if (fromDate && toDate && status === 'redeemed') {
            vouchers = await voucherManager.getRedeemedVouchers(fromDate, toDate);
        }

        else {
            return JSON.stringify({
                status: "error",
                message: "Invalid search filters"
            });
        }

        if (!vouchers || vouchers.length === 0) {
            return JSON.stringify({
                status: "error",
                message: "No vouchers found"
            });
        }

        return JSON.stringify({
            status: "success",
            data: vouchers
        });

    } catch (err) {
        console.error("Error searching vouchers:", err);
        return JSON.stringify({
            status: "error",
            message: "Server error"
        });
    }
}

/**
 * The implementation of the POST /voucher/redeem route.
 * This will redeem a voucher either fully or partially.
 *
 * @param reference   unique voucher number
 * @param amount      optional amount to redeem (if not provided, full value is redeemed)
 * @returns           JSON string representing the updated voucher state
 */
async function redeemVoucher(reference, amount) {

    console.log("Request to REDEEM voucher:", reference, "amount:", amount);

    try {

        const voucher = await voucherManager.getVoucherByReference(reference);

        if (!voucher || voucher.length === 0) {
            return JSON.stringify({
                status: "error",
                message: "Voucher not found"
            });
        }

        const result = await voucherManager.redeemVoucher(reference, amount);

        if (result && result.error) {
            return JSON.stringify({
                status: "error",
                message: result.error
            });
        }

        return JSON.stringify({
            status: "success",
            data: result
        });

    } catch (err) {
        console.error("Error redeeming voucher:", err);
        return JSON.stringify({
            status: "error",
            message: "Server error"
        });
    }
}

module.exports = router;