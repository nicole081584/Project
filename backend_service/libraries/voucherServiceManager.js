// libraries/voucherServiceManager.js

/**
 * This class Manages all services on the Backend to do with Vouchers
 * 
 * Services availabel:
 * 
 * -add Voucher 
 * -delet Voucher
 * -mail Voucher
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
        db =vdb;
      }
      else if (targetdatabase === 'redeemedVouchers'){
        db =rvdb;
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




} //closing bracket for the serviceManager class

module.exports = { voucherServiceManager };
