## HOW TO USE

To use this repo, you'll need a SendGrid account with an API key and a verified sending email.

Once you have these, you can replace the <YOUR_SEND_GRID_KEY_GOES_HERE> with your key and replace <YOUR_VERIFIED_SENDGRID_SENDER_EMAIL_ADDRESS_GOES_HERE> with your verified sender email.

If you want the emails to be sent to a Microsoft Teams channel you can change 
<YOUR_MICROSOFT_TEAMS_CHANNEL_EMAIL_GOES_HERE> to a Microsoft Teams channel email.

Otherwise you can use any email you want.

You can also replace YOUR_SITE_NAME with the name you'd like to use for the guest book.

### Environment Variables
It's a good idea to add any .env files to your gitignore to avoid committing any private keys once you add them to the .env files in this repo.