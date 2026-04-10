"use strict";

const { booking } = require("./libraries/booking.js");
const { bookingsdb } = require("./libraries/prepareDatabases");

async function seedBookings() {
  try {
    console.log("Clearing bookings database...");

    // ✅ WAIT for delete to finish
    await new Promise((resolve, reject) => {
      bookingsdb.run("DELETE FROM bookings", (err) => {
        if (err) reject(err);
        else {
          console.log("Cleared bookings table");
          resolve();
        }
      });
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const generateBookingNumber = () =>
      Math.random().toString(36).substring(2, 14).toUpperCase();

    const getFutureDate = (daysAhead) => {
      const d = new Date(today);
      d.setDate(d.getDate() + daysAhead);

      if (d.getDay() === 1) {
        d.setDate(d.getDate() + 1);
      }

      return d;
    };

    const bookings = [
      new booking("Mr.", "John", "Doe", "07777777777", "nicole.stronge@googlemail.com", 3, formatDate(today), "12:30", "", generateBookingNumber(), yesterday.toISOString()),
      new booking("Mr.", "John", "Doe", "07777777777", "nicole.stronge@googlemail.com", 5, formatDate(today), "12:30", "", generateBookingNumber(), yesterday.toISOString()),
      new booking("Mr.", "John", "Doe", "07777777777", "nicole.stronge@googlemail.com", 2, formatDate(getFutureDate(3)), "12:30", "", generateBookingNumber(), yesterday.toISOString()),
      new booking("Mr.", "John", "Doe", "07777777777", "nicole.stronge@googlemail.com", 4, formatDate(getFutureDate(10)), "12:30", "", generateBookingNumber(), yesterday.toISOString()),
      new booking("Mr.", "John", "Doe", "07777777777", "nicole.stronge@googlemail.com", 6, formatDate(getFutureDate(18)), "12:30", "", generateBookingNumber(), yesterday.toISOString()),
    ];

    console.log("Seeding bookings...");

    // ✅ WAIT for all inserts
    await Promise.all(
      bookings.map((b) => {
        return new Promise((resolve, reject) => {
          bookingsdb.run(
            `INSERT INTO bookings 
            (id, title, firstName, lastName, phoneNumber, email, numberOfGuests, date, time, comment, dateBookingWasMade) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                b.bookingNumber,        // ✅ bookingNumber = id
                b.title,
                b.firstName,
                b.lastName,
                b.phoneNumber,
                b.email,
                b.numberOfGuests,
                b.dateOfBooking,        // maps to DB "date"
                b.time,
                b.comment,
                b.dateBookingWasMade,
            ],
            function (err) {
                if (err) {
                console.error("Error inserting booking:", err);
                } else {
                console.log("Inserted booking:", b);
                }
            }
            );

        });
      })
    );

    console.log("✅ Bookings seeded successfully");

  } catch (error) {
    console.error("❌ Error seeding bookings:", error);
  }
}

module.exports = { seedBookings };

// ✅ RUN SCRIPT
seedBookings();