"use strict";
/**
 * booking class:
 * Used to represent a booking. This is a simple class that just stores the
 * data. It does not do any checking of the data.
 *
 *
 * @export
 * @class booking
 * @param tile                  the title of the customer
 * @param firstName             the firts name of the custome
 * @param lastName              the last name of the customer
 * @param phoneNumber           the contact phone number for the customer
 * @param email                 the email address of the customer
 * @param numberOfGuests        the number of people in the booking
 * @param dateOfBooking         the date the voucher was purchased
 * @param time                  the time of the booking
 * @param comment               comment the guest left on the booking
 * @param bookingNumber         the bookings unique identifying number
 * @param dateBookingWasMade    the Date the booking was Made/Changed
 *
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.booking = void 0;
class booking {
    /**
     * Creates an instance of booking.
     * @param tile                  the title of the customer
     * @param firstName             the firts name of the custome
     * @param lastName              the last name of the customer
     * @param phoneNumber           the contact phone number for the customer
     * @param email                 the email address of the customer
     * @param numberOfGuests        the number of people in the booking
     * @param dateOfBooking         the date the voucher was purchased
     * @param time                  the time of the booking
     * @param comment               comment the guest left on the booking
     * @param bookingNumber         the bookings unique identifying number
     * @param dateBookingWasMade    the Date the booking was Made/Changed
     *
     */
    constructor(title, firstName, lastName, phoneNumber, email, numberOfGuests, dateOfBooking, time, comment, bookingNumber, dateBookingWasMade) {
        this.title = title;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.numberOfGuests = numberOfGuests;
        this.dateOfBooking = dateOfBooking;
        this.time = time;
        this.comment = comment;
        this.bookingNumber = bookingNumber;
        this.dateBookingWasMade = dateBookingWasMade;
    }
    /**
     * Turns this booking into a JSON string.
     *
     * @return         a JSON string representing this permit
     */
    stringify() {
        return JSON.stringify(this);
    }
    /**
     * Displays the details of the voucher on the console. Maybe used for debugging.
     */
    displayBookingDetails() {
        console.log(`Gift Voucher:
            Name:${this.title} + ' '+ ${this.firstName} + ' '+ ${this.lastName}
            phoneNumber: ${this.phoneNumber} 
            Email: ${this.email}
            Booking : ${this.dateOfBooking} + ' ' + ${this.time} + ' number of guests: ' + ${this.numberOfGuests}
            Comment: ${this.comment}`);
    }
}
exports.booking = booking;
