
   const { sendOTP } = require('./src/utils'); // Adjust path if utils.js is in src/

   (async () => {
     try {
       await sendOTP('test@example.com'); // Replace with a real test email
       console.log('Test OTP sent successfully');
     } catch (err) {
       console.error('Test failed:', err.message);
       console.error('Error details:', err);
     }
   })();
   