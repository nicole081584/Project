import { booking } from "@/libraries/booking";

export const emptyBooking = new booking(
  '', // title
  '', // firstName
  '', // lastName
  '', // phoneNumber
  '', // email
  0,  // numberOfGuests
  '', // dateOfBooking
  '', // time
  '', // comment
  '', // bookingNumber
  ''  // dateBookingWasMade (if your constructor takes this too)
);