// libraries/voucherServiceManager.js

/**
 * This class Manages all services on the Backend to do with Vouchers
 * 
 * Services availabel:
 * 
 * -add Voucher 
 * -delet Voucher
 * -mail Voucher
 * -search Voucher by reference
 * -search sold vouchers by date range
 * -search redeemed vouchers by date range
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
const { partRedemptionsdb } = require('./prepareDatabases');





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
      db = vouchersdb;
    }
    else if (targetdatabase === 'redeemedVouchers') {
      db = redeemedVouchersdb;
    }

    if (!db) {
      console.error("Invalid database target:", targetdatabase);
      reject("Invalid database target");
      return;
    }

    db.run(
      `INSERT INTO vouchers 
      (id, title, firstName, lastName, phoneNumber, email, value, purchaseDate, adjustedValue, dateUsed) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        voucher.voucherNumber,
        voucher.title,
        voucher.firstName,
        voucher.lastName,
        voucher.phoneNumber,
        voucher.email,
        voucher.value,
        voucher.date,
        voucher.adjustedValue ?? null,
        voucher.dateUsed ?? null
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
 * Retrieves total redeemed values for vouchers within a date range
 * 
 * This function queries the partRedemptions database and returns
 * the total amount redeemed per voucher within the specified period.
 * 
 * error handling: throws an error if the database query fails
 * 
 * @param {string} fromDate   start date (YYYY-MM-DD)
 * @param {string} toDate     end date (YYYY-MM-DD)
 * @returns Promise resolving to an object mapping voucherNumber → total redeemed value
 */
getRedemptionTotals(fromDate, toDate) {
  return new Promise((resolve, reject) => {

    partRedemptionsdb.all(
      `
      SELECT voucherNumber, SUM(valueRedeemed) as total
      FROM partRedemptions
      WHERE date >= ? AND date <= ?
      GROUP BY voucherNumber
      `,
      [fromDate, toDate],
      (err, rows) => {

        if (err) {
          console.error("Error retrieving redemption totals:", err);
          reject(err);
        } 
        else if (!rows || rows.length === 0) {
          console.warn("No redemption records found in date range");
          resolve({});
        } 
        else {
          console.log("Redemption totals retrieved successfully:", rows);

          // Convert rows into lookup object
          const totals = {};

          rows.forEach(row => {
            totals[row.voucherNumber] = row.total;
          });

          resolve(totals);
        }
      }
    );
  });
}


/**
 * Retrieves vouchers redeemed within a date range
 * Includes both partially and fully redeemed vouchers
 * 
 * @param {string} fromDate   start date (YYYY-MM-DD)
 * @param {string} toDate     end date (YYYY-MM-DD)
 * @returns Promise resolving to an array of voucher objects
 */
getRedeemedVouchers(fromDate, toDate) {
  return new Promise(async (resolve, reject) => {

    try {

      // 🔹 1. Get totals for partial redemptions
      const totalsMap = await this.getRedemptionTotals(fromDate, toDate);

      // 🔹 2. Get partially redeemed vouchers
      const partials = await new Promise((res, rej) => {
        vouchersdb.all(
          `
          SELECT * FROM vouchers
          WHERE dateUsed IS NOT NULL
          `,
          [],
          (err, rows) => {
            if (err) return rej(err);
            res(rows || []);
          }
        );
      });

      // 🔹 3. Transform partial vouchers
      const transformedPartials = partials
        .filter(v => totalsMap[v.id]) // only those with activity in range
        .map(v => ({
          voucherNumber: v.id,
          title: v.title,
          firstName: v.firstName,
          lastName: v.lastName,
          phoneNumber: v.phoneNumber,
          email: v.email,

          // 🔥 KEY CHANGE: override value
          value: totalsMap[v.id],

          date: v.purchaseDate,
          dateUsed: v.dateUsed,
          status: 'part-redeemed'
        }));

      // 🔹 4. Fully redeemed vouchers
      const full = await new Promise((res, rej) => {
        redeemedVouchersdb.all(
          `
          SELECT * FROM vouchers
          WHERE dateUsed >= ? AND dateUsed <= ?
          `,
          [fromDate, toDate],
          (err, rows) => {
            if (err) return rej(err);
            res(rows || []);
          }
        );
      });

      const transformedFull = full.map(v => ({
        voucherNumber: v.id,
        title: v.title,
        firstName: v.firstName,
        lastName: v.lastName,
        phoneNumber: v.phoneNumber,
        email: v.email,

        // 🔥 FULL VALUE counts
        value: v.value,

        date: v.purchaseDate,
        dateUsed: v.dateUsed,
        status: 'fully-redeemed'
      }));

      const results = [...transformedPartials, ...transformedFull];

      console.log("Redeemed report:", results);

      resolve(results);

    } catch (error) {
      console.error("Error retrieving redeemed vouchers:", error);
      reject(error);
    }
  });
}

/**
 * Retrieves vouchers sold within a date range
 * Includes vouchers that may have since been redeemed
 * 
 * @param {string} fromDate   start date (YYYY-MM-DD)
 * @param {string} toDate     end date (YYYY-MM-DD)
 * @returns Promise resolving to an array of voucher objects
 */
getSoldVouchers(fromDate, toDate) {
  return new Promise((resolve, reject) => {

    const query = `
      SELECT * FROM vouchers
      WHERE purchaseDate >= ? AND purchaseDate <= ?
    `;

    // --- CURRENT VOUCHERS (not fully redeemed)
    vouchersdb.all(query, [fromDate, toDate], (err, rows1) => {

      if (err) {
        console.error('Error retrieving sold vouchers (active):', err);
        reject(err);
        return;
      }

      const active = (rows1 || []).map(row => ({
        title: row.title,
        firstName: row.firstName,
        lastName: row.lastName,
        phoneNumber: row.phoneNumber,
        email: row.email,
        value: row.value,
        date: row.purchaseDate,
        voucherNumber: row.id,
        adjustedValue: row.adjustedValue || null,
        dateUsed: row.dateUsed || null,
        status: 'sold-active'
      }));
      console.log('Active vouchers retrieved successfully:', active);

      // --- FULLY REDEEMED (still need to count as sold!)
      redeemedVouchersdb.all(query, [fromDate, toDate], (err2, rows2) => {

        if (err2) {
          console.error('Error retrieving sold vouchers (redeemed):', err2);
          reject(err2);
          return;
        }

        const redeemed = (rows2 || []).map(row => ({
          title: row.title,
          firstName: row.firstName,
          lastName: row.lastName,
          phoneNumber: row.phoneNumber,
          email: row.email,
          value: row.value,
          date: row.purchaseDate,
          voucherNumber: row.id,
          adjustedValue: row.adjustedValue || null,
          dateUsed: row.dateUsed || null,
          status: 'sold-redeemed'
        }));
        console.log('redeemed vouchers retrieved successfully:', redeemed);



        const results = [...active, ...redeemed];

        console.log('Sold vouchers retrieved successfully:', results);

        resolve(results);
      });
    });
  });
}

/**
 * Redeems a voucher either fully or partially
 * 
 * This function retrieves a voucher by reference and calculates the remaining value.
 * If an amount is provided, it is deducted from the current value (or adjustedValue if present).
 * Partial redemptions update the voucher and are recorded in the partRedemptions database.
 * Full redemptions move the voucher to the redeemedVouchers database.
 * 
 * error handling: throws an error if retrieval, update, or database operations fail
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

        // --- CURRENT VALUE ---
        const currentValue = row.adjustedValue
          ? parseFloat(row.adjustedValue)
          : parseFloat(row.value);

        let newValue;

        // --- CLEAN AMOUNT HANDLING ---
        const parsedAmount = amount ? parseFloat(amount) : null;

        // --- FULL REDEMPTION ---
        if (!parsedAmount) {
          newValue = 0;
        } 
        else {

          if (parsedAmount <= 0) {
            resolve({ error: "Invalid redemption amount" });
            return;
          }

          if (parsedAmount > currentValue) {
            resolve({ error: "Amount exceeds voucher value" });
            return;
          }

          newValue = currentValue - parsedAmount;
        }

        // --- DATE USED ---
        const dateUsed = new Date().toISOString().split('T')[0];

        // --- UPDATED VOUCHER ---
        const updatedVoucher = {
          voucherNumber: row.id,
          title: row.title,
          firstName: row.firstName,
          lastName: row.lastName,
          phoneNumber: row.phoneNumber,
          email: row.email,
          value: row.value,
          date: row.purchaseDate,
          adjustedValue: newValue.toString(),
          dateUsed: dateUsed
        };

        try {

          // ==============================
          // FULL REDEMPTION
          // ==============================
          if (newValue === 0) {

            console.log("Voucher fully redeemed, moving to redeemedVouchers database");

            const added = await this.addVoucher(updatedVoucher, 'redeemedVouchers');

            if (!added) {
              resolve({ error: "Failed to move voucher to redeemed database" });
              return;
            }

            await this.deletVoucher(updatedVoucher, 'vouchers');
          }

          // ==============================
          // PARTIAL REDEMPTION
          // ==============================
          else {

            partRedemptionsdb.run(
              'INSERT INTO partRedemptions (voucherNumber, valueRedeemed, date) VALUES (?, ?, ?)',
              [reference, parsedAmount, dateUsed],
              function (err) {
              if (err) {
              console.error("Error inserting redemption record:", err);
              } else {
              console.log("Partial redemption recorded");
            }
            }
          );

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
