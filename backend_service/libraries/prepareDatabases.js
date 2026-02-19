
//Prepare bookingSlots Data base
const sqlite3 = require('sqlite3').verbose();
//Connect to database
const bookingSlotsdb = new sqlite3.Database('./db/bookingSlots.db', (err) => {
  if (err) {
    console.error('Could not connect to bookingSlots.db:', err);
  } else {
    console.log('Connected to bookingSlots.db');
  }
});

//Prepare bookings Data base
const sqlite3_1 = require('sqlite3').verbose();
//Connect to database
const bookingsdb = new sqlite3_1.Database('./db/bookings.db', (err) => {
  if (err) {
    console.error('Could not connect to bookings.db:', err);
  } else {
    console.log('Connected to bookings.db');
  }
});

//Prepare pastBookings Data base
const sqlite3_2 = require('sqlite3').verbose();
//Connect to database
const pastBookingsdb = new sqlite3_2.Database('./db/pastBookings.db', (err) => {
  if (err) {
    console.error('Could not connect to pastBookings.db:', err);
  } else {
    console.log('Connected to pastBookings.db');
  }
});
//Prepare bookingSlots Data base
const sqlite3_3 = require('sqlite3').verbose();
//Connect to database
const admindb = new sqlite3_3.Database('./db/admin.db', (err) => {
  if (err) {
    console.error('Could not connect to admin.db:', err);
  } else {
    console.log('Connected to admin.db');
  }
});

//Prepare database
const sqlite3_4 = require('sqlite3').verbose();
//Connect to database
const vouchersdb = new sqlite3_4.Database('./db/vouchers.db', (err) => {
  if (err) {
    console.error('Could not connect to the Vouchers database:', err);
  } else {
    console.log('Connected to vouchers.db');
  }
});

//Prepare database
const sqlite3_5 = require('sqlite3').verbose();
//Connect to database
const redeemedVouchersdb  = new sqlite3_5.Database('./db/redeemedVouchers.db', (err) => {
  if (err) {
    console.error('Could not connect to the redeemedVouchers database:', err);
  } else {
    console.log('Connected to redeemedVouchers.db');
  }
});

module.exports = {
  bookingSlotsdb,
  bookingsdb,
  pastBookingsdb,
  admindb,
  vouchersdb,
  redeemedVouchersdb
};