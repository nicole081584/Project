"use strict";
/**
 * giftVoucher class:
 * Used to represent an gift Voucher. This is a simple class that just stores the
 * data. It does not do any checking of the data.
 *
 *
 * @export
 * @class giftVoucher
 * @param tile          the title of the customer
 * @param firstName     the firts name of the custome
 * @param lastName      the last name of the customer
 * @param phoneNumber   the contact phone number for the customer
 * @param email         the email address of the customer
 * @param value         the value of the voucher
 * @param date          the date the voucher was purchased
 * @param voucherNumber the vouchers unique identifying number
 * @param adjustedValue value of the voucher after previous use (optional)
 * @param dateUsed      Date the voucher was last used (optional)
 *
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.giftVoucher = void 0;
class giftVoucher {
    /**
     * Creates an instance of giftVoucher.
     * @param title         title of the customer
     * @param fistName      first Name of the sustomer
     * @param lastName      last Name of the customer
     * @param phoneNumber   the contact phone number for the customer
     * @param email         the email address of the customer
     * @param value         the value of the voucher
     * @param adjustedValue value of the voucher after previous use (optional)
     * @param dateUsed      Date the voucher was last used (optional)
     */
    constructor(title, firstName, lastName, phoneNumber, email, value, date, voucherNumber, adjustedValue, dateUsed) {
        this.title = title;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.value = value;
        this.date = date;
        this.voucherNumber = voucherNumber;
        this.adjustedValue = adjustedValue;
        this.dateUsed = dateUsed;
    }
    /**
     * Turns this voucher into a JSON string.
     *
     * @return         a JSON string representing this permit
     */
    stringify() {
        return JSON.stringify(this);
    }
    /**
     * Displays the details of the voucher on the console. Maybe used for debugging.
     */
    displayVoucherDetails() {
        console.log(`Gift Voucher:
            Name:${this.title} + ' '+ ${this.firstName} + ' '+ ${this.lastName}
            phoneNumber: ${this.phoneNumber} 
            Email: ${this.email}
            Value (£): ${this.value}`);
    }
}
exports.giftVoucher = giftVoucher;
