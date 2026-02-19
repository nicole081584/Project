// libraries/adminServiceManager.

const bcrypt = require('bcrypt'); 


/**
 * This class Manages all services on the Backend to do with admin
 * 
 * Services availabel:
 * 
 * - find User Type
 * 
 * uses the booking, past bookings, bookingslots, voucher, redeemed vouchers and admin databases 
 */

//import all db connections
const { bookingSlotsdb } = require('./prepareDatabases');
const { bookingsdb } = require('./prepareDatabases');
const { pastBookingsdb } = require('./prepareDatabases');
const { admindb } = require('./prepareDatabases');
const { vouchersdb } = require('./prepareDatabases');
const { redeemedVouchersdb } = require('./prepareDatabases');

class adminServiceManager {
  constructor() {
    this.booking = [];
  }

  /**
   * Function that checks first the admin db and if no match was found the bookings db and then returns
   * sucess or failure and if sucess which db it was found in, admin or booking.
   * 
   * @param emailUsername               Email of the guest/Username of the admin
   * @param bookingNumberPassword       Booking Number of the guest/Password of the Admin
   * @returns true/false                admin or booking
   */
  findUserType(emailUsername, bookingNumberPassword) {
  return new Promise((resolve, reject) => {
    admindb.get(
      "SELECT * FROM admin WHERE name = ?",
      [emailUsername],
      (err, adminRow) => {
        if (err) {
          console.error("Admin database error:", err);
          return reject(err);
        }

        if (adminRow) {
          // Compare hashed password for admin
          bcrypt.compare(bookingNumberPassword, adminRow.password, (err, match) => {
            if (err) {
              console.error("Error comparing passwords:", err);
              return reject(err);
            }

            if (match) {
              console.log("User Type: admin, Username:", adminRow.name);
              return resolve("admin");
            } else {
              console.log("Admin password incorrect.");
              return resolve(""); // No match, check bookings next
            }
          });
        } else {
          // Not in admin DB, check bookings DB
          bookingsdb.get(
            "SELECT * FROM bookings WHERE email = ? AND id = ?",
            [emailUsername, bookingNumberPassword],
            (err, bookingRow) => {
              if (err) {
                console.error("Booking database error:", err);
                return reject(err);
              }

              if (bookingRow) {
                return resolve("booking");
              } else {
                return resolve(""); // No match in either DB
              }
            }
          );
        }
      }
    );
  });
}


} //closes class

module.exports = { adminServiceManager };

