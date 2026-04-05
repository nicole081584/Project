const { vouchersdb, redeemedVouchersdb } = require('./libraries/prepareDatabases');

// Generate a random 18-character ID
function generateVoucherId(length = 18) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Format date to YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Create test dates
const today = new Date();

const dates = [
  new Date(today.setMonth(today.getMonth() - 1)), // 1 month ago
  new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
  new Date() // today
];

// Reset today (because setMonth mutates it!)
const realToday = new Date();

vouchersdb.run('DELETE FROM vouchers', () => {
  console.log("Cleared vouchers table");
});

redeemedVouchersdb.run('DELETE FROM redeemedVouchers', () => {
  console.log("Cleared redeemed vouchers table");
});

const vouchers = dates.map((date, index) => ({
  id: generateVoucherId(),
  title: "Ms",
  firstName: "Jane",
  lastName: "Doe",
  phoneNumber: "07777777777",
  email: "nicole.stronge@googlemail.com",
  value: 70,
  purchaseDate: formatDate(date)
}));

// Insert into DB
function seedDatabase() {

  vouchers.forEach(voucher => {
    vouchersdb.run(
      `INSERT INTO vouchers 
      (id, title, firstName, lastName, phoneNumber, email, value, purchaseDate) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        voucher.id,
        voucher.title,
        voucher.firstName,
        voucher.lastName,
        voucher.phoneNumber,
        voucher.email,
        voucher.value,
        voucher.purchaseDate
      ],
      function (err) {
        if (err) {
          console.error("Error inserting voucher:", err);
        } else {
          console.log("Inserted voucher:", voucher.id, voucher.purchaseDate);
        }
      }
    );
  });
}

seedDatabase();