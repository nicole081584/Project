// libraries/bookingServiceManager.js

const nodemailer = require('nodemailer'); //used for emailing

/**
 * This class Manages all services on the Backend to do with Bookings
 * 
 * Services availabel:
 * 
 * - find available booking slots
 * - add booking 
 * - delet booking
 * - email booking
 * 
 * uses the bookingSlots and bookings data Bases 
 */

// import all Database connections
const { bookingSlotsdb } = require('./prepareDatabases');
const { bookingsdb } = require('./prepareDatabases');
const { pastBookingsdb } = require('./prepareDatabases');



// Define global list of all possible booking slots
const allSlots = [
  "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30",
  "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30",
  "21:00"
];


class bookingServiceManager {
  constructor() {
    this.booking = [];
  }

  /**
   * Function that gets all available booking slots for a certain date and number of Guests
   * from the bookingSlots database and returns sucess or failure and a list of available slots
   * 
   * @param date                date of the booking 
   * @param numberOfGuests      number of guests in the booking 
   * @returns true/false for    slots retrieved
   */
  findBookingSlots(date, numberOfGuests) {
  return new Promise((resolve, reject) => {
    bookingSlotsdb.get("SELECT * FROM bookingSlots WHERE date = ?", [date], (err, row) => {
      // if database cant be read throw error
      if (err) {
        console.error("Database error:", err);
        reject(err);
        return;
      }

      //Set available Slots to default list incase there are no bookings for the date yet
      let availableSlots = [...allSlots];

      // If date is found, filter it
      if (row) {
        availableSlots = [];
        
        //If there is still the number of covers needed available add time to available Slots
        //Total number of guests per timeslot is 20 maximum
        Object.keys(row).forEach((column) => {
          if (column !== 'date') {
            const booked = parseInt(row[column], 10);
            if (booked <= (20 - numberOfGuests)) {
              availableSlots.push(column);
            }
          }
        });
      }
      // change date format to YYYY-MM-DD to determine weekday
      const [day, month, year] = date.split('/');
      const formatedDate =`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      //Apply day-based rules 
      const dayName = new Date(formatedDate).toLocaleDateString('en-GB', { weekday: 'long' });

      if (dayName === "Tuesday" || dayName === "Wednesday") {
        availableSlots = availableSlots.filter(time => time <= "15:00");
      } else if (dayName === "Thursday") {
        availableSlots = availableSlots.filter(time => time <= "20:00");
      } else if (dayName === "Sunday") {
        availableSlots = availableSlots.filter(time => time <= "19:00");
      }

      resolve(availableSlots);
    });
  });
}

/**
   * Function that adds a booking to the bookings database and returns sucess or failure
   * @param {*} booking 
   * @returns true/false for booking added
   */
  addBooking(booking, targetdatabase) {
    return new Promise((resolve, reject) => {
      let db;
      if (targetdatabase === 'bookings') {
        db = bookingsdb;
      }
      else if (targetdatabase === 'pastBookings'){
        db =pastBookingsdb;
      }
      db.run(
        'INSERT INTO bookings (id,title, firstName, lastName, phoneNumber, email, numberOfGuests, date, time, comment, dateBookingWasMade) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          booking.bookingNumber,
          booking.title,
          booking.firstName,
          booking.lastName,
          booking.phoneNumber,
          booking.email,
          booking.numberOfGuests,
          booking.dateOfBooking,
          booking.time,
          booking.comment,
          booking.dateBookingWasMade
        ],
        function (err) {
          if (err) {
            console.error('Error writing to database:', err);
            reject(err);
          } else {
            console.log('Booking added successfully.');
            resolve(true);
          }
        }
      );
    });
  }

  /**
   * Function that delets a booking from the specified database and returns sucess or failure
   * @param {*} booking 
   * @param {string} targetdatabase - either 'bookings' or 'pastBookings'
   * @returns true/false for booking deleted
   */
  deletBooking(booking, targetdatabase) {
    return new Promise((resolve, reject) => {
      let db;
      if (targetdatabase === 'bookings') {
        db = bookingsdb;
      }
      else if (targetdatabase === 'pastBookings'){
        db =pastBookingsdb;
      }
      db.run(
        'DELETE FROM bookings WHERE id = ?',
      [booking.bookingNumber],
      function (err) {
        if (err) {
          console.error('Error deleting booking from database:', err);
          reject(err);
        } else if (this.changes === 0) {
          console.warn('No booking found with the specified Number.');
          resolve(false);
        } else {
          console.log('Booking deleted successfully.');
          resolve(true);
        }
      }
        );
    });
  }


  /**
     * Function that emails a confirmation email to the  
     * email address given
     * 
     * @param {*} booking 
     * @returns true/false for voucher emailed
     */
  
    async mailBooking(booking) {
    try {
  
      // Send Email
      const transporter = nodemailer.createTransport({
        service: 'googlemail',// adjust for production
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
  
      await transporter.sendMail({
        from: `"Sinton's at the Bridge" <${process.env.EMAIL_USER}>`,
        to: booking.email,
        subject: 'Your Booking',
        text: `Dear ${booking.title} ${booking.lastName},
  
  With this email we confirm your booking on ${booking.dateOfBooking} at ${booking.time}
  for ${booking.numberOfGuests}.
  Your booking reference number is: ${booking.bookingNumber}
  You can use this number to amend your booking under the Login tab in the app.
  
  We are looking forward to welcome you at our award winning restaurant!
  
  If you have any questions, please do not hesitate to contact us.
  Email: dining@sintonsatthebridge.com 
  Phone: 028 3883 2444.`,
    html: `
      <p>Dear ${booking.title} ${booking.lastName},</p>
      <p>With this email we confirm your booking on ${booking.dateOfBooking} at ${booking.time}</p>
      <p>for ${booking.numberOfGuests} people.</p>
      <p>Your booking reference number is: ${booking.bookingNumber}</p>
      <p>You can use this number to amend your booking under the Login tab in the app.</p>
      <p>We are looking forward to welcome you at our award winning restaurant!</p>
      <p>If you have any questions, please do not hesitate to contact us.</p>
      <p>
        Email: <a href="mailto:dining@sintonsatthebridge.com">dining@sintonsatthebridge.com</a><br />
        Phone: <a href="tel:+442838832444">028 3883 2444</a>
      </p>
    `,
      });
  
      console.log('Booking confirmation emailed successfully.');
      return true;
  
    } catch (error) {
      console.error('Error in mailBooking:', error);
      throw error;
    }
  }


   /**
   * Function to add slots to the bookingSlots database.
   * If the date exists, increments the guest count for the given time slot.
   * If the date does not exist, inserts a new row with all 0s and sets the time slot to the number of guests.
   *
   * @param {string} date - Date of the booking
   * @param {string} time - Time slot (e.g., "12:30")
   * @param {number} numberOfGuests - Number of guests to add
   */
  addSlotsToDB(date, time, numberOfGuests) {
    return new Promise((resolve, reject) => {
      //Check if the date exists
      bookingSlotsdb.get("SELECT * FROM bookingSlots WHERE date = ?", [date], (err, row) => {
        if (err) {
          console.error("Database error in addSlotsToDB (select):", err);
          reject(err);
          return;
        }

        if (!row) {
         // Row doesn't exist, create one
        const columns = [
          'date', "12:00", "12:30", "13:00", "13:30",
          "14:00", "14:30", "15:00", "15:30", "17:00", "17:30",
          "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"
        ];
        // add 0 to all columns 
        const values = columns.map(col => col === 'date' ? '?' : (col === time ? '?' : 0));
        const placeholders = values.map(() => '?').join(', ');
        const insertQuery = `INSERT INTO bookingSlots (${columns.map(col => `"${col}"`).join(', ')}) VALUES (${placeholders})`;

       //define what to add to each column
        const insertValues = columns.map(col => {
          if (col === 'date') return date;
          if (col === time) return numberOfGuests;
          return 0;
        });

         //insert numbers into columns
        bookingSlotsdb.run(insertQuery, insertValues, (err) => {
          if (err) {
            console.error("Insert error in addSlotsToDB:", err);
            return reject(err);
          }
          return resolve(true);
        });

        } else {
          // Step 2b: Date exists, update the relevant column
          const currentValue = parseInt(row[time] || 0, 10);
          const updatedValue = currentValue + numberOfGuests;

          const updateQuery = `UPDATE bookingSlots SET "${time}" = ? WHERE date = ?`;
          bookingSlotsdb.run(updateQuery, [updatedValue, date], function (updateErr) {
            if (updateErr) {
              console.error("Update error in addSlotsToDB:", updateErr);
              reject(updateErr);
            } else {
              console.log ("Slot added to bookingSlots.db");
              resolve(true);
            }
          });
        }
      });
    });
  }




} //closes class

module.exports = { bookingServiceManager };
