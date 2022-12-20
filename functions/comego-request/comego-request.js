// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const handler = async (event) => {
  try {
    // Import SendGrid Mail Service
    const sgMail = require('@sendgrid/mail')
    
    // Set SendGrid API Key
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)

    // Get form post fields
    const {
      visitorName, 
      employeeName,
      trafficDirection,
      eventDateTimeISOString
    } = JSON.parse(event.body);

    // Define required mail fields
    const msg = {
        to: process.env.TEAMS_EMAIL,
        from: '<YOUR_VERIFIED_SENDGRID_SENDER_EMAIL_ADDRESS_GOES_HERE>', // Change to your verified sender
        subject: `New Office Traffic Event`,
        // text: `It time to get a leafing! at ${address}`,
        html: `
          <p>${visitorName} is the visitor</p>
          <p>${employeeName} is the employee</p>
          Event occurred at ${eventDateTimeISOString}
          Traffic direction was ${trafficDirection}
        `,
    }
    try {
      await sgMail.send(msg);
      
      console.log('Email sent')
      
      return {
        statusCode: 200,
        body: JSON.stringify({ message: `Email sent successfully!` }),
        headers: { "access-control-allow-origin": "*" }
        // isBase64Encoded: true,
      }
    } catch (error) {
      console.error(error);
      console.error('error output complete');
    }
  } catch (error) {
    console.log('ERROR IN CATCH', error, 'CAUGHT')
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }