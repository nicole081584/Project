const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt'); 

const voucherdb = new sqlite3.Database('./db/vouchers.db');
const redeemedVouchersdb = new sqlite3.Database('./db/redeemedVouchers.db');
const bookingSlotsdb = new sqlite3.Database('./db/bookingSlots.db');
const bookingsdb = new sqlite3.Database('./db/bookings.db');
const pastBookingsdb = new sqlite3.Database('./db/pastBookings.db');
const admindb = new sqlite3.Database('./db/admin.db');

function initializeDatabases() {
  // Create Voucher table
  voucherdb.run(`
    CREATE TABLE IF NOT EXISTS vouchers (
      id TEXT PRIMARY KEY,
      title TEXT,
      firstName TEXT,
      lastName TEXT,
      phoneNumber TEXT,
      email TEXT,
      value REAL,
      purchaseDate TEXT,
      adjustedValue TEXT,
      dateUsed TEXT
    )
  `);

  // Create Redeemed Vouchers table
  redeemedVouchersdb.run(`
    CREATE TABLE IF NOT EXISTS vouchers (
      id TEXT PRIMARY KEY,
      title TEXT,
      firstName TEXT,
      lastName TEXT,
      phoneNumber TEXT,
      email TEXT,
      value REAL,
      purchaseDate TEXT,
      adjustedValue TEXT,
      dateUsed TEXT
    )
  `);

  // Create BookingSlots table
  bookingSlotsdb.run(`
    CREATE TABLE IF NOT EXISTS bookingSlots (
      date TEXT PRIMARY KEY,
      "12:00" INTEGER,
      "12:30" INTEGER,
      "13:00" INTEGER,
      "13:30" INTEGER,
      "14:00" INTEGER,
      "14:30" INTEGER,
      "15:00" INTEGER,
      "15:30" INTEGER,
      "17:00" INTEGER,
      "17:30" INTEGER,
      "18:00" INTEGER,
      "18:30" INTEGER,
      "19:00" INTEGER,
      "19:30" INTEGER,
      "20:00" INTEGER,
      "20:30" INTEGER,
      "21:00" INTEGER
    )
  `);

  // Create Bookings table
  bookingsdb.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      title TEXT,
      firstName TEXT,
      lastName TEXT,
      phoneNumber TEXT,
      email TEXT,
      numberOfGuests REAL,
      date TEXT,
      time TEXT,
      comment TEXT,
      dateBookingWasMade TEXT
    )
  `);

  // Create past Bookings table
  pastBookingsdb.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      title TEXT,
      firstName TEXT,
      lastName TEXT,
      phoneNumber TEXT,
      email TEXT,
      numberOfGuests REAL,
      date TEXT,
      time TEXT,
      comment TEXT,
      dateBookingWasMade TEXT
    )
  `);

  // Create Admin table and insert default admin if it doesn't already exist
  admindb.serialize(() => {
    admindb.run(`
      CREATE TABLE IF NOT EXISTS admin (
        adminId REAL PRIMARY KEY,
        name TEXT,
        password TEXT
      )
    `);

    // Insert default admin row if not already present
     admindb.get(`SELECT COUNT(*) AS count FROM admin WHERE adminId = 1`, async (err, row) => {
      if (err) {
        console.error("Error checking admin table:", err);
      } else if (row.count === 0) {
        const hashedPassword = await bcrypt.hash('Sintons', 10);
        admindb.run(`
          INSERT INTO admin (adminId, name, password)
          VALUES (?, ?, ?)
        `, [1, 'admin', hashedPassword]);
        console.log("Default admin user created.");
      }
    });
  });
}


// Export the database connections and the initializer
module.exports = {
  initializeDatabases,
  voucherdb,
  redeemedVouchersdb,
  bookingSlotsdb,
  bookingsdb,
  pastBookingsdb,
  admindb
};