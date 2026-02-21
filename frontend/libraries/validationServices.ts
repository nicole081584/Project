/** 
 * This service validates Input formats.
 * 
 * The following validation is supported:
 *  isValidEmail - validates common email formats
 *  isValidPhoneNumber - Validates UK phone numbers
 **/

/**
 * Validates an Email address
 * 
 * error handling: alerts if the email address is not a valid format
 *
 * @param email         the email address of the customer
 * @returns boolean     true if it is email flase if it isnt             
 * */

 export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    console.log("Invalid email.");
    return false;
  }

  return true;
}

/**
 * Validates a phone number
 * 
 * error handling: alerts if the phone number is not a valid format
 *
 * @param phoneNumber       the phone number of the customer
 * @returns boolean         true if it is email flase if it isnt             
 * */

export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, ''); // remove spaces

  const phoneRegex = /^(?:0(?:7\d{9}|1\d{9}|2\d{9}|3\d{9}))$/;

  if (!phoneRegex.test(cleaned)) {
    console.log(
      "Invalid phone number");
    
    return false;
    }
   return true;
}