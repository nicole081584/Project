// libraries/voucherServiceManager.js

/**
 * This class Manages all services on the Backend to do with Vouchers
 * 
 * Services availabel:
 * 
 * -add Voucher 
 * -delet Voucher
 * -mail Voucher
 * -search Voucher 
 * -redeem Voucher
 * 
 * 
 * uses the vouchers data Base 
 */

const nodemailer = require('nodemailer'); //used for emailing
const puppeteer = require('puppeteer'); //used for PDF 
const fs = require('fs'); //node.js file system
const path = require('path');// handle and manipulate file path
const qr = require('qrcode');//qr Code generator
require('dotenv').config();// use env file 

//Impport all Data base connections
const { vouchersdb } = require('./prepareDatabases');
const { redeemedVouchersdb } = require('./prepareDatabases');





class voucherServiceManager {
  constructor() {
    this.vouchers = [];
  }

  /**
   * Function that adds a voucher to the specified database and returns sucess or failure
   * @param {*} voucher 
   * @param {string} targetdatabase - either 'vouchers' or 'redeemedVouchers'
   * @returns true/false for voucher added
   */
  addVoucher(voucher, targetdatabase) {
    return new Promise((resolve, reject) => {

       let db;
      if (targetdatabase === 'vouchers') {
        db =vouchersdb;
      }
      else if (targetdatabase === 'redeemedVouchers'){
        db =redeemedVouchersdb;
      }

      if (!db) {
        console.error("Invalid database target:", targetdatabase);
        reject("Invalid database target");
        return;
      }
      db.run(
        'INSERT INTO vouchers (id,title, firstName, lastName, phoneNumber, email, value, purchaseDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          voucher.voucherNumber,
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
            console.error('Error writing to database:', err);
            reject(err);
          } else {
            console.log('Voucher added successfully.');
            resolve(true);
          }
        }
      );
    });
  }

  /**
   * Function that delets a voucher from the specified database and returns sucess or failure
   * @param {*} voucher 
   * @param {string} targetdatabase - either 'vouchers' or 'redeemedVouchers'
   * @returns true/false for voucher deleted
   */
  deletVoucher(voucher, targetdatabase) {
    return new Promise((resolve, reject) => {
      let db;

      if (targetdatabase === 'vouchers') {
        db = vouchersdb;
      }
      else if (targetdatabase === 'redeemedVouchers'){
        db = redeemedVouchersdb;
      }
      if (!db) {
        console.error("Invalid database target:", targetdatabase);
        reject("Invalid database target");
        return;
      }
      db.run(
        'DELETE FROM vouchers WHERE id = ?',
      [voucher.voucherNumber],
      function (err) {
        if (err) {
          console.error('Error deleting from database:', err);
          reject(err);
        } else if (this.changes === 0) {
          console.warn('No voucher found with the specified ID.');
          resolve(false);
        } else {
          console.log('Voucher deleted successfully.');
          resolve(true);
        }
      }
        );
    });
  }

  /**
   * Function that populates a voucher template with the voucher data 
   * and email it to the email address given
   * 
   * @param {*} voucher 
   * @returns true/false for voucher emailed
   */

  async mailVoucher(voucher) {
  try {
    
    const templatePath = path.join(__dirname, '../templates/voucherTemplate.html');// html template for voucher
    let html = fs.readFileSync(templatePath, 'utf8');

    // Generate QR Code as data URI
    const qrCodeUrl = await qr.toDataURL(voucher.voucherNumber);

    // Inject values into template
    html = html
      .replace('{{value}}', voucher.value.toString())
      .replace('{{date}}', voucher.date)
      .replace('{{voucherNumber}}', voucher.voucherNumber)
      .replace('{{qrCodeUrl}}', qrCodeUrl)
      .replace('{{backgroundUrl}}', `${process.env.SERVER_URL || 'http://localhost:3001'}/assets/images/background.png`); //change at production

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    
    await browser.close();

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
      to: voucher.email,
      subject: 'Your Gift Voucher',
      text: `Dear ${voucher.title} ${voucher.lastName},

Please find your gift voucher attached.

Thank you for your purchase!

If you have any questions, please do not hesitate to contact us.
Email: dining@sintonsatthebridge.com 
Phone: 028 3883 2444.`,
  html: `
    <p>Dear ${voucher.title} ${voucher.lastName},</p>
    <p>Please find your gift voucher attached.</p>
    <p>Thank you for your purchase!</p>
    <p>If you have any questions, please do not hesitate to contact us.</p>
    <p>
      Email: <a href="mailto:dining@sintonsatthebridge.com">dining@sintonsatthebridge.com</a><br />
      Phone: <a href="tel:+442838832444">028 3883 2444</a>
    </p>
  `,
      attachments: [
        {
          filename: `voucher-${voucher.voucherNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    console.log('Voucher email sent successfully.');
    return true;

  } catch (error) {
    console.error('Error in mailVoucher:', error);
    throw error;
  }
}

/**
 * Retrieves a voucher by its reference (voucherNumber)
 * 
 * @param {string} reference   unique voucher reference
 * @returns Promise resolving to an array of voucher objects
 */
getVoucherByReference(reference) {
  return new Promise((resolve, reject) => {

    const db = vouchersdb;

    db.all(
      'SELECT * FROM vouchers WHERE id = ?',
      [reference],
      (err, rows) => {
        if (err) {
          console.error('Error retrieving voucher:', err);
          reject(err);
        } else if (!rows || rows.length === 0) {
          console.warn('No voucher found for reference:', reference);
          resolve([]); // important: return empty array
        } else {
          console.log('Voucher retrieved successfully:', rows);

          // Map DB rows → voucher objects
          const vouchers = rows.map(row => ({
            title: row.title,
            firstName: row.firstName,
            lastName: row.lastName,
            phoneNumber: row.phoneNumber,
            email: row.email,
            value: row.value,
            date: row.purchaseDate,
            voucherNumber: row.id,
            adjustedValue: row.adjustedValue || null,
            dateUsed: row.dateUsed || null
          }));

          resolve(vouchers);
        }
      }
    );
  });
}


/**
 * Function that redeems a voucher either fully or partially.
 * 
 * If the voucher is fully redeemed (value becomes 0), it is moved to the redeemedVouchers database.
 * Otherwise, the adjusted value is updated in the vouchers database.
 * 
 * @param {string} reference   unique voucher number
 * @param {number} amount      optional amount to redeem
 * @returns                   object containing voucherNumber and remainingValue OR error
 */
async redeemVoucher(reference, amount) {

  return new Promise((resolve, reject) => {

    vouchersdb.get(
      'SELECT * FROM vouchers WHERE id = ?',
      [reference],
      async (err, row) => {

        if (err) {
          console.error("Error retrieving voucher:", err);
          reject(err);
          return;
        }

        if (!row) {
          console.warn("Voucher not found:", reference);
          resolve(null);
          return;
        }

        // determine current value of voucher
        const currentValue = row.adjustedValue
          ? parseFloat(row.adjustedValue)
          : row.value;

        let newValue;

        // full redemption if no amount provided
        if (!amount) {
          newValue = 0;
        } else {
          const parsedAmount = parseFloat(amount);

          // prevent redeeming more than available
          if (parsedAmount > currentValue) {
            resolve({
              error: "Amount exceeds voucher value"
            });
            return;
          }

          newValue = currentValue - parsedAmount;
        }

        const dateUsed = new Date().toLocaleDateString("en-GB");

        // create updated voucher object
        const updatedVoucher = {
          title: row.title,
          firstName: row.firstName,
          lastName: row.lastName,
          phoneNumber: row.phoneNumber,
          email: row.email,
          value: row.value,
          date: row.purchaseDate,
          voucherNumber: row.id,
          adjustedValue: newValue.toString(),
          dateUsed: dateUsed
        };

        try {

          // if fully redeemed move to redeemedVouchers database
          if (newValue === 0) {

            console.log("Voucher fully redeemed, moving to redeemedVouchers database");

            const added = await this.addVoucher(updatedVoucher, 'redeemedVouchers');

            if (added) {
              await this.deletVoucher(updatedVoucher, 'vouchers');
            } else {
              resolve({
                error: "Failed to move voucher to redeemed database"
              });
              return;
            }

          } else {

            // partial redemption, update existing voucher
            vouchersdb.run(
              'UPDATE vouchers SET adjustedValue = ?, dateUsed = ? WHERE id = ?',
              [newValue.toString(), dateUsed, reference],
              function (updateErr) {

                if (updateErr) {
                  console.error("Error updating voucher:", updateErr);
                  reject(updateErr);
                }
              }
            );
          }

          resolve({
            voucherNumber: reference,
            remainingValue: newValue
          });

        } catch (error) {
          console.error("Error processing voucher redemption:", error);
          reject(error);
        }
      }
    );
  });
}



} //closing bracket for the serviceManager class

module.exports = { voucherServiceManager };
