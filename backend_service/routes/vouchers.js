// routes/vouchers.js

"use strict";

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
    const purchaseDate = new Date().toLocaleDateString("en-GB");
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

module.exports = router;